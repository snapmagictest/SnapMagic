"""
Funko Pop Generator Service
Clean, scalable Funko Pop generation for Lambda environment
"""

import json
import boto3
import base64
import time
import logging
from typing import Dict, Any
from PIL import Image
import io
import threading

logger = logging.getLogger(__name__)

class CleanFunkoPopGenerator:
    
    def __init__(self, region: str = "us-east-1", max_concurrent: int = 2, rate_limit_delay: float = 8.0):
        self.region = region
        self.max_concurrent = max_concurrent
        self.rate_limit_delay = rate_limit_delay
        
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
        self.rekognition = boto3.client('rekognition', region_name=region)
        
        self.processing_semaphore = threading.Semaphore(max_concurrent)
        self.last_request_time = 0
        self.request_lock = threading.Lock()
        
        logger.info(f"🎯 Clean FunkoPop Generator initialized")
        logger.info(f"⚡ Max concurrent: {max_concurrent}")
        logger.info(f"🕐 Rate limit delay: {rate_limit_delay}s")

    def resize_image_for_bedrock(self, image_bytes: bytes, max_pixels: int = 4194304) -> bytes:
        """Resize image to fit within Bedrock Nova Canvas pixel limits"""
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                width, height = img.size
                total_pixels = width * height
                
                if total_pixels <= max_pixels:
                    # Image is already within limits
                    buffer = io.BytesIO()
                    img.save(buffer, format='JPEG', quality=95)
                    return buffer.getvalue()
                
                # Calculate new dimensions
                scale_factor = (max_pixels / total_pixels) ** 0.5
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                
                # Ensure dimensions are within Bedrock limits (320-4096)
                new_width = max(320, min(4096, new_width))
                new_height = max(320, min(4096, new_height))
                
                # Resize image
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                buffer = io.BytesIO()
                resized_img.save(buffer, format='JPEG', quality=95)
                return buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Image resize failed: {str(e)}")
            raise Exception(f"Image resize failed: {str(e)}")

    def analyze_face_with_rekognition(self, image_base64: str) -> Dict[str, Any]:
        """Analyze face using Amazon Rekognition"""
        try:
            # Clean base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_bytes = base64.b64decode(image_base64)
            
            # Resize if needed
            image_bytes = self.resize_image_for_bedrock(image_bytes)
            
            response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if not response['FaceDetails']:
                return {'success': False, 'error': 'No face detected'}
            
            face = response['FaceDetails'][0]
            
            analysis = {
                'gender': face.get('Gender', {}).get('Value', 'Unknown'),
                'age_range': f"{face['AgeRange']['Low']}-{face['AgeRange']['High']}",
                'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
                'has_smile': face.get('Smile', {}).get('Value', False),
                'has_beard': face.get('Beard', {}).get('Value', False),
                'confidence': face.get('Confidence', 0)
            }
            
            logger.info(f"🔍 Face analysis: {analysis['gender']}, Age: {analysis['age_range']}")
            return {'success': True, 'analysis': analysis}
            
        except Exception as e:
            logger.error(f"Face analysis failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def create_corporate_funko_prompt(self, face_analysis: Dict[str, Any]) -> str:
        """Create corporate-styled Funko Pop prompt"""
        
        prompt_parts = ["Professional corporate Funko Pop action figure"]
        
        # Gender-specific styling
        gender = face_analysis.get('gender', 'Unknown').lower()
        if gender == 'male':
            prompt_parts.extend([
                "professional businessman",
                "black business suit with orange tie",
                "corporate executive style"
            ])
        elif gender == 'female':
            prompt_parts.extend([
                "professional businesswoman",
                "black business suit with orange accents",
                "corporate executive style"
            ])
        else:
            prompt_parts.extend([
                "professional business person",
                "black business suit with orange tie",
                "corporate executive style"
            ])
        
        # Add facial features
        if face_analysis.get('has_glasses'):
            prompt_parts.append("wearing professional glasses")
        if face_analysis.get('has_smile'):
            prompt_parts.append("with confident smile")
        if face_analysis.get('has_beard'):
            prompt_parts.append("with stylized facial hair")
        
        # Corporate and quality specifications
        prompt_parts.extend([
            "AWS corporate branding colors",
            "orange and black color scheme",
            "professional pose",
            "high-quality 3D rendering",
            "clean background",
            "Funko Pop proportions",
            "stylized cartoon features",
            "premium collectible quality",
            "corporate event styling"
        ])
        
        return ", ".join(prompt_parts)

    def generate_funko_pop(self, image_base64: str) -> str:
        """Generate corporate Funko Pop from selfie"""
        try:
            with self.processing_semaphore:
                # Rate limiting
                with self.request_lock:
                    current_time = time.time()
                    time_since_last = current_time - self.last_request_time
                    if time_since_last < self.rate_limit_delay:
                        sleep_time = self.rate_limit_delay - time_since_last
                        logger.info(f"⏱️ Rate limiting: sleeping {sleep_time:.1f}s")
                        time.sleep(sleep_time)
                    self.last_request_time = time.time()
                
                # Clean base64 data
                if ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]
                
                # Analyze face
                face_result = self.analyze_face_with_rekognition(image_base64)
                if not face_result['success']:
                    # Use default analysis if face detection fails
                    face_analysis = {
                        'gender': 'Unknown',
                        'age_range': '25-35',
                        'has_glasses': False,
                        'has_smile': True,
                        'has_beard': False
                    }
                    logger.warning("Using default face analysis")
                else:
                    face_analysis = face_result['analysis']
                
                # Create prompt
                prompt = self.create_corporate_funko_prompt(face_analysis)
                logger.info(f"📝 Funko prompt: {prompt[:100]}...")
                
                # Generate with Bedrock Nova Canvas
                request_body = {
                    "taskType": "IMAGE_VARIATION",
                    "imageVariationParams": {
                        "text": prompt,
                        "images": [image_base64],
                        "similarityStrength": 0.95
                    },
                    "imageGenerationConfig": {
                        "numberOfImages": 1,
                        "quality": "premium",
                        "width": 1024,
                        "height": 1024,
                        "cfgScale": 9.0,
                        "seed": 42
                    }
                }
                
                logger.info("🎨 Generating Funko Pop with Nova Canvas...")
                
                response = self.bedrock_runtime.invoke_model(
                    modelId="amazon.nova-canvas-v1:0",
                    body=json.dumps(request_body),
                    contentType="application/json",
                    accept="application/json"
                )
                
                response_body = json.loads(response['body'].read())
                
                if 'images' in response_body and len(response_body['images']) > 0:
                    logger.info("✅ Funko Pop generated successfully")
                    return response_body['images'][0]
                else:
                    raise Exception("No Funko Pop image returned from Nova Canvas")
                    
        except Exception as e:
            logger.error(f"Funko Pop generation failed: {str(e)}")
            raise Exception(f"Funko Pop generation failed: {str(e)}")

# Convenience function for Lambda handler
def create_funko_pop(image_base64: str, region: str = "us-east-1") -> str:
    """Create a corporate Funko Pop from a selfie"""
    generator = CleanFunkoPopGenerator(region=region)
    return generator.generate_funko_pop(image_base64)
