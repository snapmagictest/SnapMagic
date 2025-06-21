"""
Titan Image Generator Version - Better Face Preservation
"""

import json
import logging
import boto3
import random
import base64
from typing import Dict, Any
from auth_simple import auth

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
rekognition = boto3.client('rekognition', region_name='us-east-1')

def transform_image_bedrock_titan(prompt: str, image_base64: str, username: str) -> str:
    """
    Create perfect blister pack figurine using Titan Image Generator for better face preservation
    """
    try:
        logger.info(f"🎨 Creating figurine with Titan Image Generator for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Analyze person features with Rekognition
        person_features = analyze_person_features(image_base64)
        
        # Step 2: Create detailed prompt for better face preservation
        detailed_prompt = create_face_preserving_prompt(person_features, username)
        
        # Step 3: Generate with Titan Image Generator (better face preservation)
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": detailed_prompt,
                "images": [image_base64],
                "similarityStrength": 0.95,  # Maximum face preservation
                "cfgScale": 3.0  # Lower for more natural, less distorted results
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 768,
                "height": 1024,
                "numberOfImages": 1
            }
        }
        
        logger.info("🚀 Calling Titan Image Generator for better face preservation...")
        logger.info(f"📝 Face-preserving prompt: {detailed_prompt}")
        
        # Call Bedrock Titan Image Generator
        response = bedrock_runtime.invoke_model(
            modelId="amazon.titan-image-generator-v2:0",  # Better for face preservation
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Titan figurine created with better face preservation: {len(transformed_image)} characters")
            return transformed_image
        else:
            logger.error("❌ No images returned from Titan Image Generator")
            return "Error: No figurine returned from Titan"
            
    except Exception as e:
        logger.error(f"❌ Titan figurine creation error: {str(e)}")
        return f"Error: Titan generation failed - {str(e)}"

def create_face_preserving_prompt(person_features: Dict[str, Any], username: str) -> str:
    """
    Create prompt optimized for face preservation with Titan
    """
    
    # Build detailed person description for face preservation
    person_desc = build_detailed_face_description(person_features)
    
    # Simplified prompt focused on face preservation
    face_preserving_prompt = f"""Professional action figure of {person_desc}, maintaining exact facial features and skin tone. Figure in business attire standing in clear blister packaging on orange cardboard backing. Name '{username}' on package. Tech accessories: camera, tablet, phone, controller, robot, bicycle, sneakers. Preserve original face completely."""
    
    return face_preserving_prompt

def build_detailed_face_description(features: Dict[str, Any]) -> str:
    """Build detailed face description for better preservation"""
    
    desc_parts = []
    
    # Start with person
    if features['gender'].lower() == 'male':
        desc_parts.append("a man")
    elif features['gender'].lower() == 'female':
        desc_parts.append("a woman")
    else:
        desc_parts.append("a person")
    
    # Add specific facial features for preservation
    if features['has_glasses']:
        desc_parts.append("wearing glasses")
    if features['has_beard']:
        desc_parts.append("with beard")
    if features['has_mustache']:
        desc_parts.append("with mustache")
    
    # Add emphasis on face preservation
    desc_parts.append("with exact same facial features, skin tone, and appearance")
    
    return " ".join(desc_parts)

def analyze_person_features(image_base64: str) -> Dict[str, Any]:
    """Enhanced Rekognition analysis for face preservation"""
    try:
        image_bytes = base64.b64decode(image_base64)
        
        response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        if not response['FaceDetails']:
            return get_default_features()
        
        face = response['FaceDetails'][0]
        
        # Extract comprehensive features for face preservation
        features = {
            'gender': face.get('Gender', {}).get('Value', 'Person'),
            'age_range': face.get('AgeRange', {}),
            'has_beard': face.get('Beard', {}).get('Value', False),
            'has_mustache': face.get('Mustache', {}).get('Value', False),
            'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
            'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
            'smile': face.get('Smile', {}).get('Value', False),
            'emotions': face.get('Emotions', [])
        }
        
        logger.info(f"👤 Face features for preservation: {features}")
        return features
        
    except Exception as e:
        logger.error(f"Rekognition analysis failed: {e}")
        return get_default_features()

def get_default_features() -> Dict[str, Any]:
    """Default features when analysis fails"""
    return {
        'gender': 'Person',
        'has_beard': False,
        'has_mustache': False,
        'has_glasses': False,
        'has_sunglasses': False,
        'smile': True
    }

# Rest of the Lambda handler code would be the same...
