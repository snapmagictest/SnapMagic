"""
SnapMagic Trading Card Video Animation Generator
AI-powered video animation generation using Amazon Bedrock Nova Reel with S3 storage
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import boto3
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger(__name__)

class TradingCardVideoGenerator:
    """
    Professional trading card video animation generator using Amazon Bedrock Nova Reel
    
    Handles asynchronous video generation with S3 storage and presigned URL access
    for streaming and download functionality.
    """
    
    # Class constants for configuration
    MODEL_ID = os.environ.get('NOVA_REEL_MODEL', 'amazon.nova-reel-v1:1')
    
    # Video generation parameters
    DEFAULT_DURATION_SECONDS = 6
    DEFAULT_FPS = 24
    DEFAULT_DIMENSION = "1280x720"
    DEFAULT_SEED = 42
    
    # Validation constants
    MIN_PROMPT_LENGTH = 5
    MAX_PROMPT_LENGTH = 512
    
    # S3 configuration
    VIDEO_FOLDER_PREFIX = "videos/"
    OUTPUT_VIDEO_FILENAME = "output.mp4"
    PRESIGNED_URL_EXPIRY = 3600  # 1 hour
    
    def __init__(self):
        """
        Initialize the trading card video generator with AWS clients
        
        Raises:
            ClientError: If AWS clients cannot be initialized
        """
        try:
            # Initialize AWS clients
            self.bedrock_runtime_client = boto3.client('bedrock-runtime')
            self.s3_client = boto3.client('s3')
            
            # Get S3 bucket name from environment
            self.video_storage_bucket = os.environ.get('VIDEO_BUCKET_NAME', 'snapmagic-videos-default')
            
            logger.info("🎬 TradingCardVideoGenerator initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize TradingCardVideoGenerator: {str(e)}")
            raise
    
    def validate_image_format(self, image_base64_data: str) -> Tuple[bool, Optional[str]]:
        """
        Validate that the image is in JPEG format and suitable for video generation
        
        Args:
            image_base64_data: Base64 encoded image data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            import base64
            
            # Decode base64 to check format
            image_binary_data = base64.b64decode(image_base64_data)
            
            # Check JPEG magic bytes (FF D8 FF)
            if not image_binary_data.startswith(b'\xff\xd8\xff'):
                return False, "Image must be in JPEG format for video generation"
            
            # JPEG format is suitable for Nova Reel (no transparency issues)
            logger.info("✅ Image format validation passed: JPEG confirmed")
            return True, None
            
        except Exception as e:
            logger.error(f"❌ Image format validation failed: {str(e)}")
            return False, f"Image validation error: {str(e)}"
    
    def validate_animation_prompt(self, animation_prompt: str) -> Tuple[bool, Optional[str]]:
        """
        Validate animation prompt for video generation
        
        Args:
            animation_prompt: User-provided animation description
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not animation_prompt or not animation_prompt.strip():
            return False, "Animation prompt cannot be empty"
        
        prompt_length = len(animation_prompt.strip())
        
        if prompt_length < self.MIN_PROMPT_LENGTH:
            return False, f"Animation prompt must be at least {self.MIN_PROMPT_LENGTH} characters"
        
        if prompt_length > self.MAX_PROMPT_LENGTH:
            return False, f"Animation prompt must be less than {self.MAX_PROMPT_LENGTH} characters"
        
        return True, None
    
    def get_video_status(self, invocation_arn: str) -> Dict[str, Any]:
        """
        Check video generation status using Bedrock async invoke API
        
        Args:
            invocation_arn: The full invocation ARN from Nova Reel async call
            
        Returns:
            Dictionary containing:
            - success: Boolean indicating if status check was successful
            - status: Current status ('completed', 'processing', 'failed', etc.)
            - video_url: Presigned URL for video access (if completed)
            - video_size: Size of video file in bytes (if completed)
            - message: Status message
        """
        try:
            logger.info(f"🔍 Checking video status via Bedrock API: {invocation_arn}")
            
            # Use Bedrock API to check async job status
            bedrock_response = self.bedrock_runtime_client.get_async_invoke(
                invocationArn=invocation_arn
            )
            
            job_status = bedrock_response.get('status', 'Unknown')
            logger.info(f"📊 Bedrock async job status: {job_status}")
            
            if job_status == 'Completed':
                return self._handle_completed_video(invocation_arn)
            elif job_status == 'InProgress':
                return self._handle_processing_video()
            elif job_status == 'Failed':
                return self._handle_failed_video(bedrock_response)
            else:
                return self._handle_unknown_status(job_status)
                
        except Exception as e:
            logger.error(f"❌ Error checking video status via Bedrock API: {str(e)}")
            return self._create_error_response(f'Error checking video status: {str(e)}')
    
    def store_video_with_session_filename(self, invocation_arn: str, session_id: str, prompt: str, username: str) -> Dict[str, Any]:
        """
        Store completed video with session-based filename for usage tracking
        
        Args:
            invocation_arn: The invocation ARN from Bedrock
            session_id: Session identifier (IP + browser hash)
            prompt: Animation prompt used
            username: Authenticated username
            
        Returns:
            Dictionary containing success status and session-based S3 key
        """
        try:
            from datetime import datetime
            
            # Extract invocation ID from ARN for original S3 path
            invocation_id = invocation_arn.split('/')[-1]
            original_s3_key = f"{self.VIDEO_FOLDER_PREFIX}{invocation_id}/{self.OUTPUT_VIDEO_FILENAME}"
            
            # Count existing videos for this session to get next number
            existing_videos = self.s3_client.list_objects_v2(
                Bucket=self.video_storage_bucket,
                Prefix=f'videos/{session_id}_video_'
            )
            video_count = len(existing_videos.get('Contents', [])) + 1  # Next video number
            
            # Generate timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Create session-based filename: SESSION_video_COUNT_timestamp.mp4
            session_filename = f"{session_id}_video_{video_count}_{timestamp}.mp4"
            session_s3_key = f"videos/{session_filename}"
            
            # Copy video from original Bedrock location to session-based location
            logger.info(f"📹 Copying video from {original_s3_key} to {session_s3_key}")
            
            copy_source = {
                'Bucket': self.video_storage_bucket,
                'Key': original_s3_key
            }
            
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.video_storage_bucket,
                Key=session_s3_key,
                Metadata={
                    'session_id': session_id,
                    'video_number': str(video_count),
                    'username': username,
                    'animation_prompt': prompt[:500],  # Truncate if too long
                    'generated_at': datetime.now().isoformat(),
                    'video_type': 'session_tracked',
                    'original_invocation_id': invocation_id
                },
                MetadataDirective='REPLACE'
            )
            
            logger.info(f"✅ Video stored with session filename: {session_s3_key} (Video #{video_count} for session {session_id})")
            
            return {
                'success': True,
                'session_s3_key': session_s3_key,
                'session_filename': session_filename,
                'video_number': video_count,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to store video with session filename: {str(e)}")
            return {
                'success': False,
                'error': f"Session-based video storage failed: {str(e)}"
            }

    def _handle_completed_video(self, invocation_arn: str) -> Dict[str, Any]:
        """
        Handle completed video generation - create presigned URL for access
        
        Args:
            invocation_arn: The invocation ARN
            
        Returns:
            Success response with video access information
        """
        try:
            logger.info("✅ Video generation completed, creating presigned URL...")
            
            # Extract invocation ID from ARN for S3 path
            # ARN format: arn:aws:bedrock:region:account:async-invoke/invocation-id
            invocation_id = invocation_arn.split('/')[-1]
            video_s3_key = f"{self.VIDEO_FOLDER_PREFIX}{invocation_id}/{self.OUTPUT_VIDEO_FILENAME}"
            
            # Verify video exists in S3
            self.s3_client.head_object(Bucket=self.video_storage_bucket, Key=video_s3_key)
            
            # Generate presigned URL for video streaming and download
            presigned_video_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.video_storage_bucket, 'Key': video_s3_key},
                ExpiresIn=self.PRESIGNED_URL_EXPIRY
            )
            
            # Get video metadata
            video_metadata = self.s3_client.head_object(Bucket=self.video_storage_bucket, Key=video_s3_key)
            video_file_size = video_metadata['ContentLength']
            
            logger.info(f"✅ Presigned URL created for video streaming ({video_file_size} bytes)")
            
            return {
                'success': True,
                'status': 'completed',
                'video_url': presigned_video_url,
                'video_base64': None,  # Use presigned URL instead of base64 for efficiency
                'video_size': video_file_size,
                'message': 'Video generation completed successfully'
            }
            
        except Exception as e:
            logger.error(f"❌ Error creating presigned URL: {str(e)}")
            return self._create_error_response(f'Video completed but not accessible: {str(e)}')
    
    def _handle_processing_video(self) -> Dict[str, Any]:
        """Handle video still in progress"""
        logger.info("⏳ Video generation in progress...")
        return {
            'success': False,
            'status': 'processing',
            'message': 'Video is still being generated'
        }
    
    def _handle_failed_video(self, bedrock_response: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed video generation"""
        failure_message = bedrock_response.get('failureMessage', 'Unknown failure')
        logger.error(f"❌ Video generation failed: {failure_message}")
        return {
            'success': False,
            'status': 'failed',
            'message': f'Video generation failed: {failure_message}'
        }
    
    def _handle_unknown_status(self, job_status: str) -> Dict[str, Any]:
        """Handle unknown job status"""
        logger.warning(f"⚠️ Unknown video status: {job_status}")
        return {
            'success': False,
            'status': 'unknown',
            'message': f'Unknown video status: {job_status}'
        }
    
    def generate_video_from_card(self, card_image_base64: str, animation_prompt: str) -> Dict[str, Any]:
        """
        Generate animated video from trading card using Amazon Nova Reel
        
        Args:
            card_image_base64: Base64 encoded trading card image (JPEG format)
            animation_prompt: Text description of desired animation
            
        Returns:
            Dictionary containing:
            - success: Boolean indicating if generation was initiated
            - video_id: Unique identifier for the video
            - invocation_arn: ARN for tracking async job status
            - message: Status message
            - estimated_time: Estimated completion time
        """
        try:
            logger.info("🎬 Starting Nova Reel video generation...")
            
            # Validate inputs
            validation_result = self._validate_generation_inputs(card_image_base64, animation_prompt)
            if not validation_result['valid']:
                return self._create_error_response(validation_result['error'])
            
            # Generate unique identifiers
            video_id = str(uuid.uuid4())
            generation_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Build Nova Reel request with raw user prompt
            nova_reel_request = self._build_video_generation_request(card_image_base64, animation_prompt)
            
            # Start async video generation
            async_response = self._start_async_video_generation(nova_reel_request)
            
            # Return success response with tracking information
            return self._create_generation_success_response(video_id, async_response, generation_timestamp)
            
        except Exception as e:
            logger.error(f"❌ Nova Reel video generation failed: {str(e)}")
            return self._create_error_response(f"Video generation failed: {str(e)}")
    
    def _validate_generation_inputs(self, card_image_base64: str, animation_prompt: str) -> Dict[str, Any]:
        """
        Validate inputs for video generation
        
        Args:
            card_image_base64: Base64 encoded image
            animation_prompt: Animation description
            
        Returns:
            Dictionary with validation result
        """
        # Validate image format
        is_valid_image, image_error = self.validate_image_format(card_image_base64)
        if not is_valid_image:
            logger.error(f"❌ Image validation failed: {image_error}")
            return {'valid': False, 'error': f"Image format error: {image_error}"}
        
        # Validate animation prompt
        is_valid_prompt, prompt_error = self.validate_animation_prompt(animation_prompt)
        if not is_valid_prompt:
            logger.error(f"❌ Prompt validation failed: {prompt_error}")
            return {'valid': False, 'error': f"Animation prompt error: {prompt_error}"}
        
        return {'valid': True, 'error': None}
    
    def _build_video_generation_request(self, card_image_base64: str, animation_prompt: str) -> Dict[str, Any]:
        """
        Build the request payload for Nova Reel API
        
        Args:
            card_image_base64: Base64 encoded image
            animation_prompt: Raw user animation prompt
            
        Returns:
            Complete request payload for Nova Reel
        """
        return {
            "taskType": "TEXT_VIDEO",
            "textToVideoParams": {
                "text": animation_prompt,
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
                "durationSeconds": self.DEFAULT_DURATION_SECONDS,
                "fps": self.DEFAULT_FPS,
                "dimension": self.DEFAULT_DIMENSION,
                "seed": self.DEFAULT_SEED
            }
        }
    
    def _start_async_video_generation(self, nova_reel_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Start asynchronous video generation with Nova Reel
        
        Args:
            nova_reel_request: Complete request payload
            
        Returns:
            Async response from Bedrock
            
        Raises:
            ClientError: If API call fails
        """
        try:
            logger.info("📡 Calling Amazon Bedrock Nova Reel with StartAsyncInvoke...")
            
            async_response = self.bedrock_runtime_client.start_async_invoke(
                modelId=self.MODEL_ID,
                modelInput=nova_reel_request,
                outputDataConfig={
                    's3OutputDataConfig': {
                        's3Uri': f's3://{self.video_storage_bucket}/{self.VIDEO_FOLDER_PREFIX}'
                    }
                }
            )
            
            invocation_arn = async_response.get('invocationArn', '')
            logger.info(f"📡 Nova Reel async job started: {invocation_arn}")
            
            return async_response
            
        except ClientError as e:
            logger.error(f"❌ AWS API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"❌ Nova Reel call failed: {str(e)}")
            raise
    
    def _create_generation_success_response(self, video_id: str, async_response: Dict[str, Any], timestamp: str) -> Dict[str, Any]:
        """
        Create success response for video generation initiation
        
        Args:
            video_id: Unique video identifier
            async_response: Response from async API call
            timestamp: Generation timestamp
            
        Returns:
            Success response dictionary
        """
        return {
            'success': True,
            'video_id': video_id,
            'invocation_arn': async_response.get('invocationArn', ''),
            'message': 'Video generation started - this is async processing',
            'status': 'processing',
            'estimated_time': '30-60 seconds',
            'video_base64': None,  # Not available immediately with async
            'video_url': None,     # Will be available when processing completes
            'timestamp': datetime.now().isoformat()
        }
    
    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """
        Create error response dictionary
        
        Args:
            error_message: Error message to include
            
        Returns:
            Error response dictionary
        """
        return {
            'success': False,
            'error': error_message
        }


# Maintain backward compatibility with old class name
VideoGenerator = TradingCardVideoGenerator
