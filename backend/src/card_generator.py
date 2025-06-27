"""
SnapMagic Trading Card Generator
AI-powered trading card generation using Amazon Bedrock Nova Canvas with inpainting technique
"""

import json
import logging
import os
import base64
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import boto3
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger(__name__)

class TradingCardGenerator:
    """
    Professional trading card generator using Amazon Bedrock Nova Canvas
    
    Uses inpainting technique with pre-defined template and mask for consistent
    trading card layout and professional quality output.
    """
    
    # Class constants for configuration
    MODEL_ID = 'amazon.nova-canvas-v1:0'
    TEMPLATE_FILENAME = 'finalpink.png'
    MASK_FILENAME = 'exact_mask.png'
    
    # Generation parameters
    DEFAULT_WIDTH = 768
    DEFAULT_HEIGHT = 1024
    DEFAULT_CFG_SCALE = 7.0
    DEFAULT_SEED = 42
    QUALITY_SETTING = 'premium'
    
    # Validation constants
    MIN_PROMPT_LENGTH = 10
    MAX_PROMPT_LENGTH = 1024
    
    def __init__(self):
        """
        Initialize the trading card generator with AWS clients and template assets
        
        Raises:
            FileNotFoundError: If template or mask files are not found
            ClientError: If AWS Bedrock client cannot be initialized
        """
        try:
            # Initialize AWS Bedrock Runtime client
            self.bedrock_runtime_client = boto3.client('bedrock-runtime')
            
            # Load template and mask assets
            self._load_template_assets()
            
            logger.info("🎴 TradingCardGenerator initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize TradingCardGenerator: {str(e)}")
            raise
    
    def _load_template_assets(self) -> None:
        """
        Load trading card template and mask images from local files
        
        Raises:
            FileNotFoundError: If template or mask files cannot be found
        """
        current_directory = os.path.dirname(os.path.abspath(__file__))
        
        # Load trading card template
        template_file_path = os.path.join(current_directory, self.TEMPLATE_FILENAME)
        self.template_base64_data = self._load_image_as_base64(template_file_path, "template")
        
        # Load coordinate-based mask for inpainting
        mask_file_path = os.path.join(current_directory, self.MASK_FILENAME)
        self.mask_base64_data = self._load_image_as_base64(mask_file_path, "mask")
        
        logger.info("✅ Template assets loaded successfully")
    
    def _load_image_as_base64(self, file_path: str, image_type: str) -> str:
        """
        Load image file and convert to base64 string
        
        Args:
            file_path: Path to the image file
            image_type: Type of image for logging purposes
            
        Returns:
            Base64 encoded string of the image
            
        Raises:
            FileNotFoundError: If the image file cannot be found
        """
        try:
            with open(file_path, 'rb') as image_file:
                image_data = image_file.read()
                base64_string = base64.b64encode(image_data).decode('utf-8')
                logger.info(f"📁 Loaded {image_type} image: {len(image_data)} bytes")
                return base64_string
                
        except FileNotFoundError:
            logger.error(f"❌ {image_type.capitalize()} file not found: {file_path}")
            raise FileNotFoundError(f"Required {image_type} file not found: {file_path}")
    
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
            logger.info(f"🎨 Generating trading card for prompt: {user_prompt[:50]}...")
            
            # Create enhanced prompt for professional trading card artwork
            enhanced_prompt = self._create_enhanced_prompt(user_prompt)
            
            # Prepare Nova Canvas request
            request_payload = self._build_generation_request(enhanced_prompt)
            
            # Call Amazon Bedrock Nova Canvas
            generated_image_data = self._call_nova_canvas(request_payload)
            
            # Process and return successful result
            return self._create_success_response(generated_image_data, user_prompt)
            
        except Exception as e:
            logger.error(f"❌ Trading card generation failed: {str(e)}")
            return self._create_error_response(f"Card generation failed: {str(e)}")
    
    def _create_enhanced_prompt(self, user_prompt: str) -> str:
        """
        Create enhanced prompt for professional trading card generation
        
        Args:
            user_prompt: Original user prompt
            
        Returns:
            Enhanced prompt optimized for Nova Canvas
        """
        return (
            f"Professional trading card featuring: {user_prompt}. "
            f"Photorealistic, high-resolution, premium quality, detailed photography style "
            f"suitable for collectible trading cards."
        )
    
    def _build_generation_request(self, enhanced_prompt: str) -> Dict[str, Any]:
        """
        Build the request payload for Nova Canvas API
        
        Args:
            enhanced_prompt: Enhanced prompt for generation
            
        Returns:
            Complete request payload for Nova Canvas
        """
        return {
            "taskType": "INPAINTING",
            "inPaintingParams": {
                "text": enhanced_prompt,
                "image": self.template_base64_data,
                "maskImage": self.mask_base64_data
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": self.QUALITY_SETTING,
                "width": self.DEFAULT_WIDTH,
                "height": self.DEFAULT_HEIGHT,
                "cfgScale": self.DEFAULT_CFG_SCALE,
                "seed": self.DEFAULT_SEED
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
        Create successful response with image data and metadata
        
        Args:
            image_base64_data: Base64 encoded image data
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
                'generation_type': 'inpainting',
                'template_used': self.TEMPLATE_FILENAME
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
