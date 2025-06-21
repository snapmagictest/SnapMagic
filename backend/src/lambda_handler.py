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
        logger.info(f"🤖 Using Rekognition + Titan Image Generator G1 V2 for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Deep analysis with Rekognition
        person_analysis = analyze_person_with_rekognition(image_base64)
        
        # Step 2: Create descriptive prompt based on analysis
        descriptive_prompt = create_descriptive_action_figure_prompt(person_analysis, username)
        
        # Step 3: Generate action figure using Titan Image Generator G1 V2
        payload = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": descriptive_prompt
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 2147483647),
                "quality": "premium",
                "width": 1024,  # Titan G1 V2 supported dimensions
                "height": 1024, # Square format for Titan
                "numberOfImages": 1,
                "cfgScale": 8.0  # Titan works well with higher CFG
            }
        }
        
        logger.info("🚀 Generating action figure with Titan G1 V2 + Engineered Prompt...")
        logger.info(f"📝 Engineered prompt: {descriptive_prompt}")
        
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
        
        logger.info(f"🔍 Rekognition analysis: {characteristics}")
        return characteristics
        
    except Exception as e:
        logger.error(f"Rekognition analysis failed: {e}")
        return get_default_characteristics()

def extract_detailed_characteristics(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract detailed visual characteristics from Rekognition analysis
    """
    characteristics = {
        'gender': 'person',
        'age_description': 'adult',
        'hair_description': 'hair',
        'facial_features': [],
        'accessories': [],
        'clothing_context': [],
        'overall_appearance': 'professional'
    }
    
    # Analyze face details
    if analysis['faces']:
        face = analysis['faces'][0]
        
        # Gender
        gender_info = face.get('Gender', {})
        if gender_info.get('Confidence', 0) > 80:
            characteristics['gender'] = gender_info.get('Value', 'person').lower()
        
        # Age range
        age_range = face.get('AgeRange', {})
        if age_range:
            low = age_range.get('Low', 25)
            high = age_range.get('High', 35)
            if low < 25:
                characteristics['age_description'] = 'young adult'
            elif low > 45:
                characteristics['age_description'] = 'mature adult'
            else:
                characteristics['age_description'] = 'adult'
        
        # Facial features
        if face.get('Beard', {}).get('Value', False):
            characteristics['facial_features'].append('beard')
        if face.get('Mustache', {}).get('Value', False):
            characteristics['facial_features'].append('mustache')
        if face.get('Eyeglasses', {}).get('Value', False):
            characteristics['accessories'].append('glasses')
        if face.get('Sunglasses', {}).get('Value', False):
            characteristics['accessories'].append('sunglasses')
        
        # Emotions for expression
        emotions = face.get('Emotions', [])
        if emotions:
            dominant_emotion = max(emotions, key=lambda x: x.get('Confidence', 0))
            if dominant_emotion.get('Type') == 'HAPPY':
                characteristics['expression'] = 'smiling'
            else:
                characteristics['expression'] = 'neutral'
    
    # Analyze labels for additional context
    for label in analysis['labels']:
        label_name = label.get('Name', '').lower()
        confidence = label.get('Confidence', 0)
        
        if confidence > 80:
            # Hair-related
            if any(hair_word in label_name for hair_word in ['hair', 'blonde', 'brunette', 'black hair', 'brown hair']):
                characteristics['hair_description'] = label_name
            
            # Clothing context
            if any(clothing_word in label_name for clothing_word in ['shirt', 'suit', 'formal', 'casual', 'clothing']):
                characteristics['clothing_context'].append(label_name)
    
    return characteristics

def create_descriptive_action_figure_prompt(characteristics: Dict[str, Any], username: str) -> str:
    """
    Create shortened engineered prompt for Titan G1 V2 (512 char limit)
    """
    
    # Extract Rekognition features efficiently
    gender = characteristics.get('gender', 'person')
    gender_style = 'male' if gender.lower() == 'male' else 'female' if gender.lower() == 'female' else 'person'
    
    # Build concise professional features
    features = []
    if 'beard' in characteristics.get('facial_features', []):
        features.append('beard')
    if 'glasses' in characteristics.get('accessories', []):
        features.append('glasses')
    
    feature_text = f"with {', '.join(features)}" if features else "professional"
    
    # Determine attire
    attire = 'business suit' if gender_style == 'male' else 'business attire'
    
    # Create shortened engineered prompt (under 512 characters)
    engineered_prompt = f"""3D action figure toy "{username}" in transparent blister packaging. {gender_style.capitalize()} {feature_text}, dressed in {attire}. Package shows "{username}" and "AWS Professional" text. Right side has camera, laptop, phone. Minimalist design, cartoonish cute style, AWS logo top right. Professional toy packaging."""
    
    return engineered_prompt

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
                'message': 'Professional action figure created with Titan G1 V2 + Engineered Prompt!'
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
