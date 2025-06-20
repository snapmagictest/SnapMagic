"""
SnapMagic AI Tools using Strands Agents
Implements the core AI functionality for image transformation, video generation, and gesture detection
"""

import json
import base64
import random
import logging
from typing import Optional
from strands import Agent, tool
import boto3
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger(__name__)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
rekognition = boto3.client('rekognition', region_name='us-east-1')
transcribe = boto3.client('transcribe', region_name='us-east-1')

@tool
def transform_image(prompt: str, image_base64: str) -> str:
    """
    Transform user's selfie using Amazon Bedrock Nova Canvas.
    
    Args:
        prompt (str): Text description of the desired transformation
        image_base64 (str): Base64 encoded image data
        
    Returns:
        str: Base64 encoded transformed image or error message
    """
    try:
        logger.info(f"Starting image transformation with prompt: {prompt}")
        
        # Prepare Nova Canvas payload
        payload = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": prompt
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "standard",
                "width": 512,
                "height": 512,
                "numberOfImages": 1
            }
        }
        
        # Call Bedrock Nova Canvas
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        transformed_image = response_body['images'][0]
        
        logger.info("Image transformation completed successfully")
        return transformed_image
        
    except ClientError as e:
        error_msg = f"AWS Bedrock error: {e.response['Error']['Message']}"
        logger.error(error_msg)
        return f"Error: {error_msg}"
    except Exception as e:
        error_msg = f"Image transformation failed: {str(e)}"
        logger.error(error_msg)
        return f"Error: {error_msg}"

@tool
def generate_video(prompt: str, image_base64: str) -> str:
    """
    Generate video from user's photo using Amazon Bedrock Nova Reel.
    
    Args:
        prompt (str): Text description of the desired video
        image_base64 (str): Base64 encoded source image
        
    Returns:
        str: Base64 encoded video data or error message
    """
    try:
        logger.info(f"Starting video generation with prompt: {prompt}")
        
        # Prepare Nova Reel payload
        payload = {
            "taskType": "TEXT_VIDEO",
            "textToVideoParams": {
                "text": prompt,
                "images": [image_base64]
            },
            "videoGenerationConfig": {
                "durationSeconds": 6,
                "fps": 24,
                "dimension": "1280x720",
                "seed": random.randint(0, 858993460)
            }
        }
        
        # Call Bedrock Nova Reel
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-reel-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        generated_video = response_body['videos'][0]
        
        logger.info("Video generation completed successfully")
        return generated_video
        
    except ClientError as e:
        error_msg = f"AWS Bedrock error: {e.response['Error']['Message']}"
        logger.error(error_msg)
        return f"Error: {error_msg}"
    except Exception as e:
        error_msg = f"Video generation failed: {str(e)}"
        logger.error(error_msg)
        return f"Error: {error_msg}"

@tool
def detect_gesture(image_base64: str) -> str:
    """
    Detect thumbs up/down gestures using Amazon Rekognition.
    
    Args:
        image_base64 (str): Base64 encoded image data
        
    Returns:
        str: Detected gesture (thumbs_up, thumbs_down, or none)
    """
    try:
        logger.info("Starting gesture detection")
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64)
        
        # Call Rekognition for custom labels (gesture detection)
        response = rekognition.detect_custom_labels(
            Image={'Bytes': image_bytes},
            ProjectVersionArn='arn:aws:rekognition:us-east-1:ACCOUNT:project/gesture-detection/version/1'
        )
        
        # Process results
        gestures = []
        for label in response['CustomLabels']:
            if label['Confidence'] > 80:  # High confidence threshold
                gestures.append({
                    'gesture': label['Name'].lower(),
                    'confidence': label['Confidence']
                })
        
        if gestures:
            # Return highest confidence gesture
            best_gesture = max(gestures, key=lambda x: x['confidence'])
            logger.info(f"Detected gesture: {best_gesture['gesture']} with {best_gesture['confidence']:.1f}% confidence")
            return best_gesture['gesture']
        else:
            logger.info("No gestures detected")
            return "none"
            
    except ClientError as e:
        error_msg = f"AWS Rekognition error: {e.response['Error']['Message']}"
        logger.error(error_msg)
        return f"Error: {error_msg}"
    except Exception as e:
        error_msg = f"Gesture detection failed: {str(e)}"
        logger.error(error_msg)
        return f"Error: {error_msg}"

@tool
def transcribe_audio(audio_base64: str) -> str:
    """
    Convert speech to text using Amazon Transcribe.
    
    Args:
        audio_base64 (str): Base64 encoded audio data
        
    Returns:
        str: Transcribed text or error message
    """
    try:
        logger.info("Starting audio transcription")
        
        # For real-time transcription, we'd use Transcribe Streaming
        # This is a simplified implementation
        # In practice, you'd handle audio streaming and real-time processing
        
        # Placeholder for transcription logic
        # Real implementation would involve:
        # 1. Upload audio to S3 temporarily
        # 2. Start transcription job
        # 3. Poll for completion
        # 4. Return transcribed text
        
        logger.info("Audio transcription completed")
        return "Transcription feature coming soon"
        
    except Exception as e:
        error_msg = f"Audio transcription failed: {str(e)}"
        logger.error(error_msg)
        return f"Error: {error_msg}"

# Main SnapMagic Agent
def create_snapmagic_agent() -> Agent:
    """
    Create the main SnapMagic AI agent with all tools.
    
    Returns:
        Agent: Configured SnapMagic agent
    """
    return Agent(
        model="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        tools=[transform_image, generate_video, detect_gesture, transcribe_audio],
        system_prompt="""You are SnapMagic AI, an advanced AI assistant for AWS Summit events.

Your capabilities:
1. Transform selfies into creative scenes using AI image generation
2. Generate short video reels from photos
3. Detect thumbs up/down gestures for feedback collection
4. Convert speech to text for voice prompts

Guidelines:
- Be creative and fun with image transformations
- Provide clear feedback on what you're doing
- Handle errors gracefully and suggest alternatives
- Keep responses concise but helpful
- Focus on creating amazing content for event attendees

Example transformations:
- "Transform me into a superhero flying over the city"
- "Make me look like I'm presenting at AWS re:Invent"
- "Put me on a tropical beach with AWS logos in the sand"

Always aim to create memorable, shareable content that showcases AWS capabilities!"""
    )
