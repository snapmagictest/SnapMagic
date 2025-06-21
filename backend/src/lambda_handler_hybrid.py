"""
Hybrid Approach: Enhanced Rekognition + Image Influence for Better Resemblance
- Detailed Rekognition analysis with nuanced characteristics
- Image-to-image with very high similarity for face influence
- Improved packaging layout (figure left, 3 items right)
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

def transform_image_hybrid_approach(prompt: str, image_base64: str, username: str) -> str:
    """
    Hybrid approach: Enhanced Rekognition analysis + Image influence for better resemblance
    """
    try:
        logger.info(f"🔄 Using hybrid approach for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Enhanced Rekognition analysis with nuanced characteristics
        detailed_analysis = enhanced_rekognition_analysis(image_base64)
        
        # Step 2: Create nuanced prompt with improved packaging layout
        hybrid_prompt = create_hybrid_prompt(detailed_analysis, username)
        
        # Step 3: Use IMAGE_VARIATION with very high similarity + enhanced prompt
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": hybrid_prompt,
                "images": [image_base64],
                "similarityStrength": 0.95  # High similarity for face influence
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 768,
                "height": 1024,
                "numberOfImages": 1,
                "cfgScale": 4.0  # Balanced for detail + resemblance
            }
        }
        
        logger.info("🔄 Generating hybrid action figure with image influence...")
        logger.info(f"📝 Hybrid prompt: {hybrid_prompt}")
        
        # Call Nova Canvas with image influence
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Hybrid action figure created: {len(transformed_image)} characters")
            return transformed_image
        else:
            logger.error("❌ No images returned from hybrid approach")
            return "Error: No hybrid action figure returned"
            
    except Exception as e:
        logger.error(f"❌ Hybrid approach error: {str(e)}")
        return f"Error: Hybrid generation failed - {str(e)}"

def enhanced_rekognition_analysis(image_base64: str) -> Dict[str, Any]:
    """
    Enhanced Rekognition analysis with nuanced characteristic detection
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64)
        
        # Comprehensive analysis
        face_response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        labels_response = rekognition.detect_labels(
            Image={'Bytes': image_bytes},
            MaxLabels=30,
            MinConfidence=60
        )
        
        # Extract nuanced characteristics
        analysis = extract_nuanced_characteristics(face_response, labels_response)
        
        logger.info(f"🔍 Enhanced analysis: {analysis}")
        return analysis
        
    except Exception as e:
        logger.error(f"Enhanced Rekognition analysis failed: {e}")
        return get_default_analysis()

def extract_nuanced_characteristics(face_response: Dict, labels_response: Dict) -> Dict[str, Any]:
    """
    Extract nuanced characteristics with confidence-based decisions
    """
    characteristics = {
        'gender': 'person',
        'age_description': 'adult',
        'facial_hair': 'clean-shaven',
        'accessories': [],
        'build': 'average build',
        'complexion': 'medium complexion',
        'expression': 'neutral',
        'hair_style': 'hair'
    }
    
    # Analyze face details with confidence thresholds
    if face_response.get('FaceDetails'):
        face = face_response['FaceDetails'][0]
        
        # Gender (high confidence only)
        gender_info = face.get('Gender', {})
        if gender_info.get('Confidence', 0) > 90:
            characteristics['gender'] = gender_info.get('Value', 'person').lower()
        
        # Age range
        age_range = face.get('AgeRange', {})
        if age_range:
            low = age_range.get('Low', 25)
            if low < 25:
                characteristics['age_description'] = 'young adult'
            elif low > 50:
                characteristics['age_description'] = 'mature adult'
            else:
                characteristics['age_description'] = 'adult'
        
        # Facial hair (nuanced detection)
        beard_info = face.get('Beard', {})
        mustache_info = face.get('Mustache', {})
        
        if beard_info.get('Confidence', 0) > 85 and beard_info.get('Value', False):
            characteristics['facial_hair'] = 'beard'
        elif mustache_info.get('Confidence', 0) > 85 and mustache_info.get('Value', False):
            characteristics['facial_hair'] = 'mustache'
        elif beard_info.get('Confidence', 0) > 70 and beard_info.get('Value', False):
            characteristics['facial_hair'] = 'light facial hair'
        else:
            characteristics['facial_hair'] = 'clean-shaven'
        
        # Accessories (high confidence only)
        if face.get('Eyeglasses', {}).get('Confidence', 0) > 85:
            characteristics['accessories'].append('glasses')
        if face.get('Sunglasses', {}).get('Confidence', 0) > 85:
            characteristics['accessories'].append('sunglasses')
        
        # Expression
        emotions = face.get('Emotions', [])
        if emotions:
            dominant_emotion = max(emotions, key=lambda x: x.get('Confidence', 0))
            if dominant_emotion.get('Confidence', 0) > 70:
                if dominant_emotion.get('Type') == 'HAPPY':
                    characteristics['expression'] = 'smiling'
                elif dominant_emotion.get('Type') == 'SURPRISED':
                    characteristics['expression'] = 'surprised'
    
    # Analyze labels for additional context
    for label in labels_response.get('Labels', []):
        label_name = label.get('Name', '').lower()
        confidence = label.get('Confidence', 0)
        
        if confidence > 75:
            # Build/body type (respectful detection)
            if 'person' in label_name and confidence > 80:
                # Look for additional context without being offensive
                if any(build_word in label_name for build_word in ['athletic', 'fit']):
                    characteristics['build'] = 'athletic build'
                elif any(build_word in label_name for build_word in ['slim', 'lean']):
                    characteristics['build'] = 'lean build'
                # Default to average build for respectful representation
            
            # Hair context
            if any(hair_word in label_name for hair_word in ['hair', 'hairstyle']):
                characteristics['hair_style'] = label_name
    
    return characteristics

def create_hybrid_prompt(analysis: Dict[str, Any], username: str) -> str:
    """
    Create hybrid prompt with improved packaging layout and nuanced characteristics
    """
    
    # Build nuanced person description
    person_parts = []
    
    # Basic description
    gender = analysis.get('gender', 'person')
    age_desc = analysis.get('age_description', 'adult')
    person_parts.append(f"{age_desc} {gender}")
    
    # Build description (respectful)
    build = analysis.get('build', 'average build')
    person_parts.append(f"with {build}")
    
    # Complexion (general)
    complexion = analysis.get('complexion', 'natural complexion')
    person_parts.append(f"and {complexion}")
    
    # Facial hair (nuanced)
    facial_hair = analysis.get('facial_hair', 'clean-shaven')
    if facial_hair != 'clean-shaven':
        person_parts.append(f"with {facial_hair}")
    
    # Accessories
    accessories = analysis.get('accessories', [])
    if accessories:
        person_parts.extend([f"wearing {acc}" for acc in accessories])
    
    # Expression
    expression = analysis.get('expression', 'neutral')
    person_parts.append(f"with {expression} expression")
    
    person_description = ", ".join(person_parts)
    
    # Create improved packaging layout prompt
    hybrid_prompt = f"""Professional action figure of {person_description} in modern business attire. Figure positioned on LEFT side of clear blister packaging on bright orange cardboard backing. Large '{username}' text at top center in beige. On RIGHT side: 3 tech accessories arranged vertically - smartphone at top, tablet in middle, DSLR camera at bottom. Clean product photography lighting, detailed figure in blister pack, commercial toy packaging."""
    
    return hybrid_prompt

def get_default_analysis() -> Dict[str, Any]:
    """Default analysis when detection fails"""
    return {
        'gender': 'person',
        'age_description': 'adult',
        'facial_hair': 'clean-shaven',
        'accessories': [],
        'build': 'average build',
        'complexion': 'natural complexion',
        'expression': 'neutral',
        'hair_style': 'hair'
    }

# Lambda handler would use this hybrid approach
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler using hybrid approach
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
            return create_success_response({'status': 'healthy', 'service': 'snapmagic-hybrid'})
        
        # All other endpoints require JWT authentication
        token = auth.extract_token_from_headers(headers)
        if not token:
            return auth.create_auth_response(False, "Missing authentication token", status_code=401)
        
        # Validate JWT token
        is_valid, payload = auth.validate_token(token)
        if not is_valid:
            return auth.create_auth_response(False, "Invalid or expired token", status_code=401)
        
        # Process authenticated AI requests with hybrid approach
        return handle_ai_request_hybrid(body, payload)
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def handle_ai_request_hybrid(body: Dict[str, Any], token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle authenticated AI requests with hybrid approach"""
    try:
        # Extract request parameters
        action = body.get('action', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        
        # Handle image transformation with hybrid approach
        if action == 'transform_image':
            if not image_base64:
                return create_error_response("Missing image data", 400)
            
            logger.info(f"🔄 Processing hybrid action figure")
            result = transform_image_hybrid_approach(prompt, image_base64, token_payload.get('username'))
            
            return create_success_response({
                'result': result,
                'user': token_payload.get('username'),
                'session': token_payload.get('session_id'),
                'message': 'Hybrid action figure created - enhanced resemblance with improved packaging!'
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
        
        # Simple authentication (d/d for demo)
        if username == 'd' and password == 'd':
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
