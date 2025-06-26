"""
Amazon Nova Reel Video Generation Module
Handles video generation from trading cards using Amazon Bedrock Nova Reel
Updated: 2025-06-26 - Fixed method definitions and transparency handling
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import boto3

# Configure logging
logger = logging.getLogger(__name__)

class VideoGenerator:
    """Handles video generation using Amazon Nova Reel"""
    
    def __init__(self):
        """Initialize the video generator with AWS clients"""
        self.bedrock_runtime = boto3.client('bedrock-runtime')
        self.s3_client = boto3.client('s3')
        self.video_bucket = os.environ.get('VIDEO_BUCKET_NAME', 'snapmagic-videos-default')
        logger.info("🎬 VideoGenerator initialized")
    
    def validate_image_format(self, image_base64: str) -> tuple[bool, Optional[str]]:
        """Validate that the image is in JPEG format and has no transparency"""
        try:
            import base64
            
            # Decode base64 to check format
            image_data = base64.b64decode(image_base64)
            
            # Check JPEG magic bytes (FF D8 FF)
            if not image_data.startswith(b'\xff\xd8\xff'):
                return False, "Image is not in JPEG format"
            
            # JPEG cannot have transparency by design
            logger.info("✅ Image validation passed: JPEG format confirmed")
            return True, None
            
        except Exception as e:
            logger.error(f"❌ Image validation failed: {str(e)}")
            return False, f"Image validation error: {str(e)}"
    
    def validate_animation_prompt(self, prompt: str) -> tuple[bool, Optional[str]]:
        """Validate animation prompt for video generation"""
        if not prompt or not prompt.strip():
            return False, "Animation prompt cannot be empty"
        
        if len(prompt.strip()) < 5:
            return False, "Animation prompt must be at least 5 characters"
        
        if len(prompt) > 512:
            return False, "Animation prompt must be less than 512 characters"
        
        return True, None
    
    def get_video_status(self, invocation_arn: str) -> Dict[str, Any]:
        """
        Check video generation status using Bedrock get_async_invoke API
        
        Args:
            invocation_arn: The full invocation ARN from Nova Reel async call
            
        Returns:
            Dictionary with video status and data if ready
        """
        try:
            logger.info(f"🔍 Checking video status via Bedrock API: {invocation_arn}")
            
            # Use Bedrock API to check async job status
            response = self.bedrock_runtime.get_async_invoke(
                invocationArn=invocation_arn
            )
            
            status = response.get('status', 'Unknown')
            logger.info(f"📊 Bedrock async job status: {status}")
            
            if status == 'Completed':
                # Video generation completed - now get the video from S3
                logger.info("✅ Video generation completed, retrieving from S3...")
                
                # Extract invocation ID from ARN for S3 path
                # ARN format: arn:aws:bedrock:region:account:async-invoke/invocation-id
                invocation_id = invocation_arn.split('/')[-1]
                video_key = f"videos/{invocation_id}/output.mp4"
                
                try:
                    # Get the video file from S3
                    video_response = self.s3_client.get_object(Bucket=self.video_bucket, Key=video_key)
                    video_data = video_response['Body'].read()
                    
                    # Convert to base64 for frontend
                    import base64
                    video_base64 = base64.b64encode(video_data).decode('utf-8')
                    
                    logger.info(f"✅ Video retrieved! Size: {len(video_data)} bytes")
                    
                    return {
                        'success': True,
                        'status': 'completed',
                        'video_base64': video_base64,
                        'video_size': len(video_data),
                        'message': 'Video generation completed successfully'
                    }
                    
                except Exception as e:
                    logger.error(f"❌ Error downloading completed video: {str(e)}")
                    return {
                        'success': False,
                        'status': 'error',
                        'message': f'Video completed but not accessible: {str(e)}'
                    }
                    
            elif status == 'InProgress':
                # Video is still being generated
                logger.info("⏳ Video generation in progress...")
                return {
                    'success': False,
                    'status': 'processing',
                    'message': 'Video is still being generated'
                }
                
            elif status == 'Failed':
                # Video generation failed
                failure_message = response.get('failureMessage', 'Unknown failure')
                logger.error(f"❌ Video generation failed: {failure_message}")
                return {
                    'success': False,
                    'status': 'failed',
                    'message': f'Video generation failed: {failure_message}'
                }
                
            else:
                # Unknown status
                logger.warning(f"⚠️ Unknown video status: {status}")
                return {
                    'success': False,
                    'status': 'unknown',
                    'message': f'Unknown video status: {status}'
                }
                
        except Exception as e:
            logger.error(f"❌ Error checking video status via Bedrock API: {str(e)}")
            return {
                'success': False,
                'status': 'error',
                'message': f'Error checking video status: {str(e)}'
            }
    
    def generate_video_from_card(self, card_image_base64: str, animation_prompt: str) -> Dict[str, Any]:
        """
        Generate animated video from trading card using Amazon Nova Reel
        
        Args:
            card_image_base64: Base64 encoded trading card image
            animation_prompt: Text description of desired animation
            
        Returns:
            Dictionary with success status and video information
        """
        try:
            logger.info("🎬 Starting Nova Reel video generation...")
            
            # Validate image format first
            is_valid_image, image_error = self.validate_image_format(card_image_base64)
            if not is_valid_image:
                logger.error(f"❌ Image validation failed: {image_error}")
                return {
                    'success': False,
                    'error': f"Image format error: {image_error}"
                }
            
            # Generate unique video ID
            video_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Prepare the request for Nova Reel (Image-to-Video)
            model_input = {
                "taskType": "TEXT_VIDEO",
                "textToVideoParams": {
                    "text": f"{animation_prompt}. Keep the trading card format intact while adding subtle movement and effects.",
                    "images": [
                        {
                            "format": "jpeg",
                            "source": {
                                "bytes": card_image_base64
                            }
                        }
                    ]
                },
                "videoGenerationConfig": {
                    "durationSeconds": 6,
                    "fps": 24,
                    "dimension": "1280x720",
                    "seed": 42
                }
            }
            
            # Call Nova Reel with ASYNC API (Nova Reel doesn't support sync InvokeModel)
            logger.info("📡 Calling Amazon Bedrock Nova Reel with StartAsyncInvoke...")
            response = self.bedrock_runtime.start_async_invoke(
                modelId='amazon.nova-reel-v1:1',  # Correct model ID
                modelInput=model_input,  # Pass as dict, not JSON string
                outputDataConfig={
                    's3OutputDataConfig': {
                        's3Uri': f's3://{self.video_bucket}/videos/'
                    }
                }
            )
            
            # Parse async response
            invocation_arn = response.get('invocationArn', '')
            logger.info(f"📡 Nova Reel async job started: {invocation_arn}")
            
            # Return async job information
            return {
                'success': True,
                'video_id': video_id,
                'invocation_arn': invocation_arn,
                'message': 'Video generation started - this is async processing',
                'status': 'processing',
                'estimated_time': '30-60 seconds',
                'video_base64': None,  # Not available immediately with async
                'video_url': None,     # Will be available when processing completes
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Nova Reel video generation failed: {str(e)}")
            return {
                'success': False,
                'error': f"Video generation failed: {str(e)}"
            }
