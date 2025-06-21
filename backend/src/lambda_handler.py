"""
Rekognition-Based Action Figure Generation
Analyze selfie with Rekognition → Create descriptive prompt → Generate action figure that looks like the person
"""

import json
import logging
import boto3
import random
import base64
import os
from typing import Dict, Any
from auth_simple import auth

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
rekognition = boto3.client('rekognition', region_name='us-east-1')

def transform_image_rekognition_approach(prompt: str, image_base64: str, username: str) -> str:
    """
    Use Rekognition to analyze selfie, then create action figure using Titan Image Generator G1 V2
    """
    try:
        logger.info(f"🔄 Back to TEXT_IMAGE approach with detailed Rekognition for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Deep analysis with Rekognition
        person_analysis = analyze_person_with_rekognition(image_base64)
        
        # Step 2: Create descriptive prompt based on analysis
        descriptive_prompt = create_descriptive_action_figure_prompt(person_analysis, username)
        
        # Use TEXT_IMAGE with detailed Rekognition description for better results
        payload = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": descriptive_prompt
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 2147483647),
                "quality": "premium",
                "width": 1024,
                "height": 1024,
                "numberOfImages": 1,
                "cfgScale": 8.0  # Higher CFG for text-to-image
            }
        }
        
        logger.info("🔄 Back to TEXT_IMAGE with detailed Rekognition description...")
        logger.info(f"📝 Detailed action figure prompt: {descriptive_prompt}")
        
        # Call Titan Image Generator G1 V2
        response = bedrock_runtime.invoke_model(
            modelId="amazon.titan-image-generator-v2:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Titan-generated action figure created: {len(transformed_image)} characters")
            return transformed_image
        else:
            logger.error("❌ No images returned from Titan Image Generator")
            return "Error: No action figure returned from Titan"
            
    except Exception as e:
        logger.error(f"❌ Titan generation error: {str(e)}")
        return f"Error: Titan generation failed - {str(e)}"

def analyze_person_with_rekognition(image_base64: str) -> Dict[str, Any]:
    """
    Deep analysis of person using Rekognition to create detailed description
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64)
        
        # Comprehensive Rekognition analysis
        face_response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        # Also detect labels for additional context
        labels_response = rekognition.detect_labels(
            Image={'Bytes': image_bytes},
            MaxLabels=20,
            MinConfidence=70
        )
        
        analysis = {
            'faces': face_response.get('FaceDetails', []),
            'labels': labels_response.get('Labels', [])
        }
        
        # Extract detailed characteristics
        characteristics = extract_detailed_characteristics(analysis)
        
        logger.info(f"🔍 Rekognition detected: {characteristics}")
        logger.info(f"📝 Generated prompt will use: {list(characteristics.keys())}")
        return characteristics
        
    except Exception as e:
        logger.error(f"Rekognition analysis failed: {e}")
        return get_default_characteristics()

def extract_detailed_characteristics(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract ALL actual characteristics detected by Rekognition (not hardcoded)
    """
    characteristics = {
        'gender': 'person',
        'age_description': 'adult',
        'facial_features': [],
        'accessories': [],
        'expression': 'neutral',
        'complexion': 'natural',
        'hair_color': None,
        'clothing_context': []
    }
    
    # Analyze face details - use ACTUAL Rekognition detection
    if analysis['faces']:
        face = analysis['faces'][0]
        
        # Gender (actual detection)
        gender_info = face.get('Gender', {})
        if gender_info.get('Confidence', 0) > 80:
            characteristics['gender'] = gender_info.get('Value', 'person').lower()
        
        # Age range (actual detection)
        age_range = face.get('AgeRange', {})
        if age_range:
            low = age_range.get('Low', 25)
            if low < 25:
                characteristics['age_description'] = 'young adult'
            elif low > 45:
                characteristics['age_description'] = 'mature adult'
            else:
                characteristics['age_description'] = 'adult'
        
        # Facial features (only if actually detected)
        if face.get('Beard', {}).get('Value', False) and face.get('Beard', {}).get('Confidence', 0) > 80:
            characteristics['facial_features'].append('beard')
        if face.get('Mustache', {}).get('Value', False) and face.get('Mustache', {}).get('Confidence', 0) > 80:
            characteristics['facial_features'].append('mustache')
        
        # Accessories (only if actually detected)
        if face.get('Eyeglasses', {}).get('Value', False) and face.get('Eyeglasses', {}).get('Confidence', 0) > 80:
            characteristics['accessories'].append('glasses')
        if face.get('Sunglasses', {}).get('Value', False) and face.get('Sunglasses', {}).get('Confidence', 0) > 80:
            characteristics['accessories'].append('sunglasses')
        
        # Expression (actual emotion detection)
        emotions = face.get('Emotions', [])
        if emotions:
            dominant_emotion = max(emotions, key=lambda x: x.get('Confidence', 0))
            emotion_type = dominant_emotion.get('Type', 'CALM')
            if emotion_type == 'HAPPY' and dominant_emotion.get('Confidence', 0) > 70:
                characteristics['expression'] = 'smiling'
            elif emotion_type == 'CALM':
                characteristics['expression'] = 'calm'
            else:
                characteristics['expression'] = 'neutral'
        
        # Complexion/Skin tone detection from labels and face analysis
        # Check labels for skin tone indicators
        skin_tone_detected = False
        for label in analysis['labels']:
            label_name = label.get('Name', '').lower()
            confidence = label.get('Confidence', 0)
            
            if confidence > 70:
                # Look for skin tone indicators in labels
                if any(tone in label_name for tone in ['dark', 'brown', 'black', 'african', 'indian', 'asian', 'latino', 'hispanic']):
                    characteristics['complexion'] = 'dark'
                    skin_tone_detected = True
                    break
                elif any(tone in label_name for tone in ['light', 'fair', 'pale', 'caucasian', 'white']):
                    characteristics['complexion'] = 'light'
                    skin_tone_detected = True
                    break
                elif any(tone in label_name for tone in ['medium', 'olive', 'tan', 'brown']):
                    characteristics['complexion'] = 'medium'
                    skin_tone_detected = True
                    break
        
        # If no skin tone detected from labels, try ethnicity from face analysis
        if not skin_tone_detected:
            ethnicity = face.get('Ethnicity', [])
            if ethnicity:
                top_ethnicity = max(ethnicity, key=lambda x: x.get('Confidence', 0))
                if top_ethnicity.get('Confidence', 0) > 70:
                    ethnicity_value = top_ethnicity.get('Value', '').lower()
                    characteristics['complexion'] = ethnicity_value
    
    # Analyze labels for hair color and additional context
    for label in analysis['labels']:
        label_name = label.get('Name', '').lower()
        confidence = label.get('Confidence', 0)
        
        if confidence > 80:
            # Hair color detection
            if any(hair_word in label_name for hair_word in ['blonde', 'brunette', 'black hair', 'brown hair', 'gray hair', 'white hair']):
                characteristics['hair_color'] = label_name.replace(' hair', '')
            
            # Clothing context
            if any(clothing_word in label_name for clothing_word in ['shirt', 'suit', 'formal', 'casual', 'clothing']):
                characteristics['clothing_context'].append(label_name)
    
    return characteristics

def create_descriptive_action_figure_prompt(characteristics: Dict[str, Any], username: str) -> str:
    """
    Create prompt with CONSISTENT packaging but personalized figure
    """
    
    # Build description using ONLY detected characteristics
    description_parts = []
    
    # Gender (only if detected with confidence)
    gender = characteristics.get('gender', '')
    if gender and gender != 'person':
        description_parts.append(gender)
    
    # Age (only if detected)
    age_desc = characteristics.get('age_description', '')
    if age_desc and age_desc != 'adult':
        description_parts.append(age_desc)
    
    # Complexion (CRITICAL - must be included for accurate representation)
    complexion = characteristics.get('complexion', 'natural')
    if complexion and complexion != 'natural':
        description_parts.append(f"{complexion} skin tone")
    else:
        # If no specific complexion detected, still specify to avoid default white
        description_parts.append("natural skin tone")
    
    # Hair color (only if detected)
    hair_color = characteristics.get('hair_color')
    if hair_color:
        description_parts.append(f"{hair_color} hair")
    
    # Facial features (only what's actually detected)
    facial_features = characteristics.get('facial_features', [])
    for feature in facial_features:
        description_parts.append(f"with {feature}")
    
    # Accessories (only what's actually detected)
    accessories = characteristics.get('accessories', [])
    for accessory in accessories:
        description_parts.append(f"wearing {accessory}")
    
    # Expression (only if detected)
    expression = characteristics.get('expression', 'neutral')
    if expression != 'neutral':
        description_parts.append(expression)
    
    # Create natural person description from detected features
    if description_parts:
        person_description = ' '.join(description_parts)
    else:
        person_description = 'person'
    
    # Gender-appropriate attire (based on detected gender)
    if gender == 'male':
        attire = 'business suit'
    elif gender == 'female':
        attire = 'professional business attire'
    else:
        attire = 'professional business clothing'
    
    # DETAILED ACTION FIGURE DESCRIPTION - shortened but emphasizes actual appearance
    detailed_prompt = f"""3D action figure toy of {person_description} in {attire}, in transparent blister packaging on orange backing. Figure accurately represents this person's appearance and skin tone. White text "{username}" and "AWS Professional". Right side: camera, laptop, phone. AWS logo top right. Realistic sculpting matching described features."""
    
    logger.info(f"📝 Generated detailed prompt: {detailed_prompt}")
    return detailed_prompt

def get_default_characteristics() -> Dict[str, Any]:
    """Default characteristics when analysis fails"""
    return {
        'gender': 'person',
        'age_description': 'adult',
        'hair_description': 'hair',
        'facial_features': [],
        'accessories': [],
        'clothing_context': [],
        'overall_appearance': 'professional',
        'expression': 'neutral'
    }

# Lambda handler would use this function instead of the image variation approach
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler using Rekognition approach
    """
    try:
        logger.info(f"Received Lambda event: {json.dumps(event, default=str)}")
        
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response()
        
        # Parse request
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        # Get request path to determine endpoint
        path = event.get('path', '').rstrip('/')
        method = event.get('httpMethod', 'POST')
        headers = event.get('headers', {})
        
        # Handle login endpoint (no authentication required)
        if path == '/api/login' and method == 'POST':
            return handle_login(body)
        
        # Handle health check (no authentication required)
        if path == '/health' or path == '/api/health':
            return create_success_response({'status': 'healthy', 'service': 'snapmagic-titan-g1-v2'})
        
        # All other endpoints require JWT authentication
        token = auth.extract_token_from_headers(headers)
        if not token:
            return auth.create_auth_response(False, "Missing authentication token", status_code=401)
        
        # Validate JWT token
        is_valid, payload = auth.validate_token(token)
        if not is_valid:
            return auth.create_auth_response(False, "Invalid or expired token", status_code=401)
        
        # Process authenticated AI requests with Rekognition approach
        return handle_ai_request_rekognition(body, payload)
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def handle_ai_request_rekognition(body: Dict[str, Any], token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle authenticated AI requests with Rekognition approach"""
    try:
        # Extract request parameters
        action = body.get('action', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        
        # Handle image transformation with Rekognition approach
        if action == 'transform_image':
            if not image_base64:
                return create_error_response("Missing image data", 400)
            
            logger.info(f"🤖 Processing Rekognition-based action figure")
            result = transform_image_rekognition_approach(prompt, image_base64, token_payload.get('username'))
            
            return create_success_response({
                'result': result,
                'user': token_payload.get('username'),
                'session': token_payload.get('session_id'),
                'message': 'Personalized figure with consistent packaging created!'
            })
            
        else:
            return create_error_response("Invalid action", 400)
        
    except Exception as e:
        logger.error(f"AI request error: {str(e)}")
        return create_error_response(f"AI processing failed: {str(e)}", 500)

def handle_login(body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle login request and return JWT token"""
    try:
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        
        logger.info(f"Login attempt for user: {username}")
        
        # Get credentials from environment variables (set by CDK from secrets.json)
        expected_username = os.environ.get('SNAPMAGIC_USERNAME', 'demo')
        expected_password = os.environ.get('SNAPMAGIC_PASSWORD', 'demo')
        
        logger.info(f"Expected username: {expected_username}")
        
        # Authenticate using environment variables
        if username == expected_username and password == expected_password:
            # Generate JWT token
            token = auth.generate_token(username)
            
            return auth.create_auth_response(
                success=True,
                message="Login successful",
                token=token,
                status_code=200
            )
        else:
            return auth.create_auth_response(
                success=False,
                message="Invalid credentials",
                status_code=401
            )
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return auth.create_auth_response(False, f"Login failed: {str(e)}", status_code=500)

def create_success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create successful response with CORS headers"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        'body': json.dumps({
            'success': True,
            **data
        })
    }

def create_error_response(message: str, status_code: int = 500) -> Dict[str, Any]:
    """Create error response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        'body': json.dumps({
            'success': False,
            'message': message
        })
    }

def create_cors_response() -> Dict[str, Any]:
    """Create CORS preflight response"""
    return {
        'statusCode': 204,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
        },
        'body': ''
    }
