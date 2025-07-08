"""
SnapMagic Trading Card Generator
AI-powered trading card generation using Amazon Bedrock Nova Canvas with pure text-to-image generation
"""

import json
import logging
import os
import random
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import boto3
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger(__name__)

class TradingCardGenerator:
    """
    Professional trading card generator using Amazon Bedrock Nova Canvas
    
    Uses pure TEXT_IMAGE generation for maximum Nova Canvas creativity and 
    full prompt adherence. Frontend handles card template compositing.
    """
    
    # Class constants for configuration
    MODEL_ID = os.environ.get('NOVA_CANVAS_MODEL', 'amazon.nova-canvas-v1:0')
    
    # Generation parameters - optimized for trading card content
    DEFAULT_WIDTH = 768
    DEFAULT_HEIGHT = 1024
    DEFAULT_CFG_SCALE = 7.0
    QUALITY_SETTING = 'premium'
    
    # Validation constants
    MIN_PROMPT_LENGTH = 10
    MAX_PROMPT_LENGTH = 1024
    
    def __init__(self):
        """
        Initialize the trading card generator with AWS clients
        
        Raises:
            ClientError: If AWS Bedrock client cannot be initialized
        """
        try:
            # Initialize AWS Bedrock Runtime client
            self.bedrock_runtime_client = boto3.client('bedrock-runtime')
            
            logger.info("🎴 TradingCardGenerator initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize TradingCardGenerator: {str(e)}")
            raise
    
    def validate_prompt(self, user_prompt: str) -> Tuple[bool, Optional[str]]:
        """
        Validate user prompt for trading card generation
        
        Args:
            user_prompt: User-provided description for the trading card
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not user_prompt or not user_prompt.strip():
            return False, "Trading card prompt cannot be empty"
        
        prompt_length = len(user_prompt.strip())
        
        if prompt_length < self.MIN_PROMPT_LENGTH:
            return False, f"Prompt must be at least {self.MIN_PROMPT_LENGTH} characters"
        
        if prompt_length > self.MAX_PROMPT_LENGTH:
            return False, f"Prompt must be less than {self.MAX_PROMPT_LENGTH} characters"
        
        return True, None
    
    def generate_trading_card(self, user_prompt: str) -> Dict[str, Any]:
        """
        Generate a professional trading card using Amazon Bedrock Nova Canvas
        
        Args:
            user_prompt: Text description of the desired card content
            
        Returns:
            Dictionary containing:
            - success: Boolean indicating if generation was successful
            - result: Base64 encoded image data (if successful)
            - imageSrc: Data URL for frontend display (if successful)
            - metadata: Generation metadata (if successful)
            - error: Error message (if failed)
        """
        try:
            logger.info(f"🎨 Generating card for prompt: {user_prompt[:50]}...")
            
            # Enhance prompt for trading card context
            enhanced_prompt = self._enhance_prompt_for_trading_card(user_prompt)
            
            # Prepare Nova Canvas request for pure text-to-image generation
            request_payload = self._build_generation_request(enhanced_prompt)
            
            # Call Amazon Bedrock Nova Canvas for pure creative generation
            generated_image_data = self._call_nova_canvas(request_payload)
            
            # Return raw Nova Canvas image for frontend compositing
            return self._create_success_response(generated_image_data, user_prompt)
            
        except Exception as e:
            logger.error(f"❌ Trading card generation failed: {str(e)}")
            return self._create_error_response(f"Card generation failed: {str(e)}")
    
    def _enhance_prompt_for_trading_card(self, user_prompt: str) -> str:
        """
        Enhance user prompt with trading card context for better Nova Canvas results
        
        Args:
            user_prompt: Original user prompt
            
        Returns:
            Enhanced prompt optimized for trading card generation
        """
        # Add trading card context while preserving user's creative intent
        enhanced_prompt = f"Professional trading card artwork featuring {user_prompt}. High quality digital art, detailed illustration, vibrant colors, professional composition, trading card style."
        
        logger.info(f"🎯 Enhanced prompt: {enhanced_prompt[:100]}...")
        return enhanced_prompt
    
    def _build_generation_request(self, enhanced_prompt: str) -> Dict[str, Any]:
        """
        Build the request payload for Nova Canvas API - Pure text-to-image generation
        
        Args:
            enhanced_prompt: Enhanced prompt for generation
            
        Returns:
            Complete request payload for Nova Canvas
        """
        return {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": enhanced_prompt
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": self.QUALITY_SETTING,
                "width": self.DEFAULT_WIDTH,
                "height": self.DEFAULT_HEIGHT,
                "cfgScale": self.DEFAULT_CFG_SCALE,
                "seed": random.randint(0, 2147483646)  # Nova Canvas max seed value
            }
        }
    
    def _call_nova_canvas(self, request_payload: Dict[str, Any]) -> str:
        """
        Make API call to Amazon Bedrock Nova Canvas
        
        Args:
            request_payload: Complete request payload
            
        Returns:
            Base64 encoded image data
            
        Raises:
            ClientError: If API call fails
            ValueError: If response doesn't contain image data
        """
        try:
            logger.info("📡 Calling Amazon Bedrock Nova Canvas...")
            
            api_response = self.bedrock_runtime_client.invoke_model(
                modelId=self.MODEL_ID,
                body=json.dumps(request_payload),
                contentType='application/json'
            )
            
            # Parse API response
            response_data = json.loads(api_response['body'].read())
            logger.info("✅ Nova Canvas response received successfully")
            
            # Extract image data
            if 'images' in response_data and len(response_data['images']) > 0:
                return response_data['images'][0]
            else:
                raise ValueError("No image data received from Nova Canvas")
                
        except ClientError as e:
            logger.error(f"❌ AWS API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"❌ Nova Canvas call failed: {str(e)}")
            raise
    
    def _create_success_response(self, image_base64_data: str, original_prompt: str) -> Dict[str, Any]:
        """
        Create successful response with raw Nova Canvas image data and metadata
        
        Args:
            image_base64_data: Base64 encoded image data from Nova Canvas
            original_prompt: Original user prompt
            
        Returns:
            Success response dictionary
        """
        # Create data URL for frontend display
        data_url = f"data:image/png;base64,{image_base64_data}"
        
        return {
            'success': True,
            'result': image_base64_data,
            'imageSrc': data_url,
            'metadata': {
                'prompt': original_prompt,
                'model': self.MODEL_ID,
                'quality': self.QUALITY_SETTING,
                'dimensions': f'{self.DEFAULT_WIDTH}x{self.DEFAULT_HEIGHT}',
                'generated_at': datetime.now().isoformat(),
                'generation_type': 'text_to_image',
                'compositing': 'frontend'
            }
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
CardGenerator = TradingCardGenerator
