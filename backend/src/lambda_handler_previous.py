"""
Professional Action Figure Lambda Handler
Based on successful ChatGPT/DALL-E techniques adapted for AWS Bedrock Nova Canvas
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

def transform_image_bedrock_professional(prompt: str, image_base64: str, username: str) -> str:
    """
    Professional action figure creation using proven techniques from successful blog post
    """
    try:
        logger.info(f"🎨 Creating professional action figure for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Analyze person features with Rekognition
        person_features = analyze_person_features(image_base64)
        
        # Step 2: Create detailed professional prompt
        detailed_prompt = create_professional_prompt(prompt, person_features, username)
        
        # Step 3: Generate with optimized Nova Canvas settings
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": detailed_prompt,
                "images": [image_base64],
                "similarityStrength": 0.85  # Balanced for face preservation + creativity
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 1024,   # High resolution for professional look
                "height": 1024,  # Square format for packaging
                "numberOfImages": 1,
                "cfgScale": 6.0  # Optimal for detailed prompts
            }
        }
        
        logger.info("🚀 Calling Professional Nova Canvas...")
        logger.info(f"📝 Professional prompt: {detailed_prompt}")
        
        # Call Bedrock Nova Canvas
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Professional action figure created: {len(transformed_image)} characters")
            return transformed_image
        else:
            logger.error("❌ No images returned from Nova Canvas")
            return "Error: No professional action figure returned from Bedrock"
            
    except Exception as e:
        logger.error(f"❌ Professional action figure error: {str(e)}")
        return f"Error: Professional generation failed - {str(e)}"

def analyze_person_features(image_base64: str) -> Dict[str, Any]:
    """
    Use Rekognition to analyze person features for better prompting
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64)
        
        # Analyze with Rekognition
        response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        if not response['FaceDetails']:
            return get_default_features()
        
        face = response['FaceDetails'][0]
        
        # Extract key features
        features = {
            'gender': face.get('Gender', {}).get('Value', 'Person'),
            'age_range': face.get('AgeRange', {}),
            'has_beard': face.get('Beard', {}).get('Value', False),
            'has_mustache': face.get('Mustache', {}).get('Value', False),
            'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
            'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
            'smile': face.get('Smile', {}).get('Value', False)
        }
        
        logger.info(f"👤 Person features detected: {features}")
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

def create_professional_prompt(figure_type: str, person_features: Dict[str, Any], username: str) -> str:
    """
    Create detailed prompt based on successful blog post techniques
    """
    
    # Build person description from features
    person_desc = build_person_description(person_features)
    
    # Get figure type specific details
    figure_details = get_figure_type_details(figure_type)
    
    # Create the winning prompt structure from the successful blog post
    prompt = f"""Create a photorealistic action figure set in a toy-style plastic blister box. 
Include 1 person: {person_desc} {figure_details['outfit']}. 
Place accessories next to them: {figure_details['accessories']}. 
The box should be {figure_details['box_color']} with a {figure_details['logo']}. 
Add text: '{figure_details['main_title']}' at the top, and '{username} {figure_details['subtitle']}' below. 
Make the packaging look shiny and realistic with a hanging hook."""
    
    return prompt

def build_person_description(features: Dict[str, Any]) -> str:
    """Build person description from Rekognition features"""
    
    desc_parts = []
    
    # Gender
    if features['gender'].lower() == 'male':
        desc_parts.append("a man")
    elif features['gender'].lower() == 'female':
        desc_parts.append("a woman")
    else:
        desc_parts.append("a person")
    
    # Facial features
    if features['has_glasses']:
        desc_parts.append("wearing glasses")
    if features['has_beard']:
        desc_parts.append("with a beard")
    if features['has_mustache']:
        desc_parts.append("with a mustache")
    
    return " ".join(desc_parts)

def get_figure_type_details(figure_type: str) -> Dict[str, str]:
    """
    Get detailed specifications for each figure type
    Based on successful action figure creation techniques
    """
    
    figure_specs = {
        'construction-worker': {
            'outfit': 'in construction worker outfit with hard hat, safety vest, work boots, and tool belt',
            'accessories': 'hammer, wrench, measuring tape, safety goggles, and a small ladder',
            'box_color': 'bright orange',
            'logo': 'construction helmet logo',
            'main_title': 'CONSTRUCTION HERO',
            'subtitle': 'Builder Edition'
        },
        'superhero': {
            'outfit': 'in superhero costume with cape, mask, and heroic pose',
            'accessories': 'shield, utility belt, communication device, and power symbol',
            'box_color': 'electric blue',
            'logo': 'lightning bolt logo',
            'main_title': 'SUPER HERO',
            'subtitle': 'Action Figure'
        },
        'chef': {
            'outfit': 'in chef uniform with white hat, apron, and professional attire',
            'accessories': 'spatula, whisk, chef knife, mixing bowl, and recipe book',
            'box_color': 'warm red',
            'logo': 'chef hat logo',
            'main_title': 'MASTER CHEF',
            'subtitle': 'Culinary Expert'
        },
        'doctor': {
            'outfit': 'in medical scrubs with stethoscope and professional appearance',
            'accessories': 'medical bag, clipboard, thermometer, and prescription pad',
            'box_color': 'medical white',
            'logo': 'medical cross logo',
            'main_title': 'DOCTOR HERO',
            'subtitle': 'Medical Professional'
        },
        'firefighter': {
            'outfit': 'in firefighter uniform with helmet, protective gear, and boots',
            'accessories': 'fire hose, axe, oxygen tank, and emergency radio',
            'box_color': 'fire engine red',
            'logo': 'fire department badge',
            'main_title': 'FIRE RESCUE',
            'subtitle': 'Emergency Hero'
        },
        'police': {
            'outfit': 'in police uniform with badge, hat, and professional appearance',
            'accessories': 'radio, handcuffs, notepad, and police car keys',
            'box_color': 'police blue',
            'logo': 'police badge logo',
            'main_title': 'POLICE OFFICER',
            'subtitle': 'Law Enforcement'
        },
        'astronaut': {
            'outfit': 'in space suit with helmet, life support system, and space boots',
            'accessories': 'space helmet, communication device, space tools, and mission patch',
            'box_color': 'space black',
            'logo': 'NASA-style logo',
            'main_title': 'SPACE EXPLORER',
            'subtitle': 'Astronaut Mission'
        },
        'pilot': {
            'outfit': 'in pilot uniform with captain hat, wings badge, and professional attire',
            'accessories': 'flight manual, headset, aviator sunglasses, and flight bag',
            'box_color': 'sky blue',
            'logo': 'pilot wings logo',
            'main_title': 'CAPTAIN PILOT',
            'subtitle': 'Aviation Professional'
        }
    }
    
    return figure_specs.get(figure_type, figure_specs['construction-worker'])

# Updated Lambda handler function
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Enhanced Lambda handler with professional action figure generation
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
            return create_success_response({'status': 'healthy', 'service': 'snapmagic-professional'})
        
        # All other endpoints require JWT authentication
        token = auth.extract_token_from_headers(headers)
        if not token:
            return auth.create_auth_response(False, "Missing authentication token", status_code=401)
        
        # Validate JWT token
        is_valid, payload = auth.validate_token(token)
        if not is_valid:
            return auth.create_auth_response(False, "Invalid or expired token", status_code=401)
        
        # Process authenticated AI requests with professional generation
        return handle_ai_request_professional(body, payload)
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def handle_ai_request_professional(body: Dict[str, Any], token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle authenticated AI requests with professional action figure generation"""
    try:
        # Extract request parameters
        action = body.get('action', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        
        # Handle image transformation with professional generation
        if action == 'transform_image':
            if not prompt or not image_base64:
                return create_error_response("Missing prompt or image data", 400)
            
            logger.info(f"🎨 Processing professional action figure: {prompt}")
            result = transform_image_bedrock_professional(prompt, image_base64, token_payload.get('username'))
            
            return create_success_response({
                'result': result,
                'user': token_payload.get('username'),
                'session': token_payload.get('session_id'),
                'message': 'Professional action figure created with Bedrock Nova Canvas'
            })
            
        # Keep other actions as mock for now
        elif action == 'generate_video':
            mock_result = f"🎬 Mock: Video generation coming next"
        elif action == 'detect_gesture':
            mock_result = f"👍 Mock: Gesture detection coming next"
        elif action == 'transcribe_audio':
            mock_result = f"🎤 Mock: Audio transcription coming next"
        else:
            return create_error_response("Invalid action", 400)
        
        # Return mock response for non-image actions
        return create_success_response({
            'result': mock_result,
            'user': token_payload.get('username'),
            'session': token_payload.get('session_id'),
            'message': 'Mock response - focusing on professional action figures'
        })
        
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
