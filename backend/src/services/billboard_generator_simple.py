"""
Simplified Billboard Generator Service
Works in Lambda environment without heavy dependencies
Uses only Bedrock Nova Canvas for complete billboard generation
"""

import json
import boto3
import base64
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SimpleBillboardGenerator:
    
    def __init__(self, region: str = "us-east-1"):
        self.region = region
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
        self.rekognition = boto3.client('rekognition', region_name=region)
        
        logger.info("🎯 Simple Billboard Generator initialized")
        logger.info("🏙️ Using single-step Bedrock approach for Times Square billboard")

    def analyze_face_for_billboard(self, image_base64: str) -> Dict[str, Any]:
        """Analyze face for billboard generation"""
        try:
            # Clean base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_bytes = base64.b64decode(image_base64)
            
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
            
            logger.info(f"🔍 Face analysis for billboard: {analysis['gender']}, Age: {analysis['age_range']}")
            return {'success': True, 'analysis': analysis}
            
        except Exception as e:
            logger.error(f"Face analysis failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def create_times_square_billboard_prompt(self, face_analysis: Dict[str, Any]) -> str:
        """Create Times Square billboard prompt with Funko Pop figure"""
        
        prompt_parts = ["Times Square billboard advertisement at night featuring a professional Funko Pop action figure"]
        
        # Gender-specific styling
        gender = face_analysis.get('gender', 'Unknown').lower()
        if gender == 'male':
            prompt_parts.extend([
                "professional businessman Funko Pop figure",
                "black business suit with orange tie",
                "corporate executive style"
            ])
        elif gender == 'female':
            prompt_parts.extend([
                "professional businesswoman Funko Pop figure", 
                "black business suit with orange accents",
                "corporate executive style"
            ])
        else:
            prompt_parts.extend([
                "professional business person Funko Pop figure",
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
        
        # Times Square billboard specifications
        prompt_parts.extend([
            "displayed on large LED billboard in Times Square",
            "nighttime New York City scene",
            "bright digital billboard display",
            "professional advertising quality",
            "AWS corporate branding",
            "orange and black color scheme",
            "high-quality digital billboard",
            "Times Square atmosphere with city lights",
            "professional corporate advertisement",
            "AWS Summit Johannesburg 2025 branding text",
            "Powered by AWS logo visible",
            "dual screen billboard layout",
            "left screen with text and branding",
            "right screen with Funko Pop figure",
            "realistic Times Square integration",
            "premium brand advertising quality"
        ])
        
        # Quality specifications
        prompt_parts.extend([
            "high-resolution billboard quality",
            "professional advertising photography",
            "clean corporate presentation",
            "realistic nighttime lighting",
            "authentic Times Square billboard"
        ])
        
        return ", ".join(prompt_parts)

    def create_times_square_billboard(self, selfie_base64: str) -> str:
        """Create Times Square billboard using single-step Bedrock approach"""
        try:
            logger.info("🎯 SIMPLIFIED BILLBOARD CREATION")
            logger.info("🏙️ Using Bedrock Nova Canvas for complete billboard generation")
            
            # Clean the base64 data
            if ',' in selfie_base64:
                selfie_base64 = selfie_base64.split(',')[1]
            
            # Step 1: Analyze face
            logger.info("📦 Step 1: Analyze face...")
            face_result = self.analyze_face_for_billboard(selfie_base64)
            if face_result['success']:
                face_analysis = face_result['analysis']
                logger.info(f"✅ Face analysis: {face_analysis['gender']} ({face_analysis['age_range']} years)")
            else:
                # Use default data if face analysis fails
                face_analysis = {
                    'gender': 'Unknown', 
                    'age_range': '25-35', 
                    'has_glasses': False, 
                    'has_smile': True,
                    'has_beard': False
                }
                logger.info("⚠️ Using default face data")
            
            # Step 2: Create billboard prompt
            logger.info("🎨 Step 2: Generate Times Square billboard prompt...")
            billboard_prompt = self.create_times_square_billboard_prompt(face_analysis)
            logger.info(f"📝 Billboard prompt: {billboard_prompt[:150]}...")
            
            # Step 3: Generate complete billboard with Nova Canvas
            logger.info("🏙️ Step 3: Generate Times Square billboard...")
            
            request_body = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": billboard_prompt,
                    "images": [selfie_base64],
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
            
            response = self.bedrock_runtime.invoke_model(
                modelId="amazon.nova-canvas-v1:0",
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            
            if 'images' in response_body and len(response_body['images']) > 0:
                logger.info("🎉 TIMES SQUARE BILLBOARD COMPLETE!")
                logger.info("✅ Professional billboard with Funko Pop figure generated")
                return response_body['images'][0]
            else:
                raise Exception("No billboard image returned from Nova Canvas")
                
        except Exception as e:
            logger.error(f"Billboard creation failed: {str(e)}")
            raise Exception(f"Billboard creation failed: {str(e)}")

# Convenience function for Lambda handler
def create_times_square_billboard_simple(selfie_base64: str, region: str = "us-east-1") -> str:
    """Create a Times Square billboard from a selfie using simplified approach"""
    generator = SimpleBillboardGenerator(region=region)
    return generator.create_times_square_billboard(selfie_base64)
