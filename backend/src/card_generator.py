"""
Amazon Bedrock Nova Canvas Trading Card Generation Module
Handles trading card generation using coordinate-based content replacement
"""

import json
import logging
import os
import base64
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import boto3

# Configure logging
logger = logging.getLogger(__name__)

class CardGenerator:
    """Handles trading card generation using Amazon Bedrock Nova Canvas"""
    
    def __init__(self):
        """Initialize the card generator with AWS clients and template assets"""
        self.bedrock_runtime = boto3.client('bedrock-runtime')
        
        # Load template and mask from the same directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load trading card template
        template_path = os.path.join(current_dir, 'finalpink.png')
        with open(template_path, 'rb') as f:
            self.template_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        # Load exact coordinate mask
        mask_path = os.path.join(current_dir, 'exact_mask.png')
        with open(mask_path, 'rb') as f:
            self.mask_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        logger.info("🎴 CardGenerator initialized")
    
    def validate_prompt(self, prompt: str) -> tuple[bool, Optional[str]]:
        """Validate the prompt for card generation"""
        if not prompt or not prompt.strip():
            return False, "Prompt cannot be empty"
        
        if len(prompt.strip()) < 10:
            return False, "Prompt must be at least 10 characters"
        
        if len(prompt) > 1024:
            return False, "Prompt must be less than 1024 characters"
        
        return True, None
    
    def generate_trading_card(self, prompt: str) -> Dict[str, Any]:
        """
        Generate a trading card using Amazon Bedrock Nova Canvas
        
        Args:
            prompt: Text description of the desired card content
            
        Returns:
            Dictionary with success status and image data
        """
        try:
            logger.info(f"🎨 Generating trading card for prompt: {prompt[:50]}...")
            
            # Prepare the request for Nova Canvas
            request_body = {
                "taskType": "INPAINTING",
                "inPaintingParams": {
                    "text": f"Professional trading card artwork: {prompt}. High quality, detailed illustration suitable for a collectible trading card.",
                    "image": self.template_base64,
                    "maskImage": self.mask_base64
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "quality": "premium",
                    "width": 768,
                    "height": 1024,
                    "cfgScale": 7.0,
                    "seed": 42
                }
            }
            
            # Call Nova Canvas
            logger.info("📡 Calling Amazon Bedrock Nova Canvas...")
            response = self.bedrock_runtime.invoke_model(
                modelId='amazon.nova-canvas-v1:0',
                body=json.dumps(request_body),
                contentType='application/json'
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            logger.info("✅ Nova Canvas response received")
            
            if 'images' in response_body and len(response_body['images']) > 0:
                image_base64 = response_body['images'][0]
                
                # Create data URL for frontend
                image_src = f"data:image/png;base64,{image_base64}"
                
                return {
                    'success': True,
                    'result': image_base64,
                    'imageSrc': image_src,
                    'metadata': {
                        'prompt': prompt,
                        'model': 'amazon.nova-canvas-v1:0',
                        'quality': 'premium',
                        'dimensions': '768x1024',
                        'generated_at': datetime.now().isoformat()
                    }
                }
            else:
                logger.error("❌ No image data in Nova Canvas response")
                return {
                    'success': False,
                    'error': 'No image data received from Nova Canvas'
                }
                
        except Exception as e:
            logger.error(f"❌ Trading card generation failed: {str(e)}")
            return {
                'success': False,
                'error': f"Card generation failed: {str(e)}"
            }
