"""
Perfect Blister Pack Figurine Generator
Based on detailed target analysis - creates professional tech figurine with accessories
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

def transform_image_bedrock_perfect(prompt: str, image_base64: str, username: str) -> str:
    """
    Create perfect blister pack figurine matching the target specification
    """
    try:
        logger.info(f"🎨 Creating perfect blister pack figurine for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Analyze person features with Rekognition
        person_features = analyze_person_features(image_base64)
        
        # Step 2: Create the PERFECT prompt based on target analysis
        perfect_prompt = create_perfect_blister_pack_prompt(person_features, username)
        
        # Step 3: Generate with optimized settings for photorealistic result
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": perfect_prompt,
                "images": [image_base64],
                "similarityStrength": 0.88  # High similarity for face preservation
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 585,    # Exact target dimensions
                "height": 876,   # Portrait orientation like target
                "numberOfImages": 1,
                "cfgScale": 7.0  # Higher CFG for detailed photorealistic result
            }
        }
        
        logger.info("🚀 Calling Nova Canvas for Perfect Blister Pack...")
        logger.info(f"📝 Perfect prompt: {perfect_prompt}")
        
        # Call Bedrock Nova Canvas
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Perfect blister pack figurine created: {len(transformed_image)} characters")
            return transformed_image
        else:
            logger.error("❌ No images returned from Nova Canvas")
            return "Error: No perfect figurine returned from Bedrock"
            
    except Exception as e:
        logger.error(f"❌ Perfect figurine creation error: {str(e)}")
        return f"Error: Perfect generation failed - {str(e)}"

def analyze_person_features(image_base64: str) -> Dict[str, Any]:
    """
    Enhanced Rekognition analysis for perfect figurine creation
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
        
        # Extract comprehensive features for perfect replication
        features = {
            'gender': face.get('Gender', {}).get('Value', 'Person'),
            'age_range': face.get('AgeRange', {}),
            'has_beard': face.get('Beard', {}).get('Value', False),
            'has_mustache': face.get('Mustache', {}).get('Value', False),
            'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
            'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
            'smile': face.get('Smile', {}).get('Value', False),
            'emotions': face.get('Emotions', []),
            'hair_color': 'brown',  # Default - could be enhanced
            'skin_tone': 'medium'   # Default - could be enhanced
        }
        
        logger.info(f"👤 Enhanced person features detected: {features}")
        return features
        
    except Exception as e:
        logger.error(f"Rekognition analysis failed: {e}")
        return get_default_features()

def get_default_features() -> Dict[str, Any]:
    """Enhanced default features"""
    return {
        'gender': 'Person',
        'has_beard': False,
        'has_mustache': False,
        'has_glasses': False,
        'has_sunglasses': False,
        'smile': True,
        'hair_color': 'brown',
        'skin_tone': 'medium'
    }

def create_perfect_blister_pack_prompt(person_features: Dict[str, Any], username: str) -> str:
    """
    Create the PERFECT prompt based on detailed target analysis - NO HOODIE, PROFESSIONAL ATTIRE
    """
    
    # Build detailed person description
    person_desc = build_detailed_person_description(person_features)
    
    # Create the EXACT prompt structure matching the target - PROFESSIONAL ATTIRE ONLY
    perfect_prompt = f"""Create a photorealistic action figure in professional blister pack packaging. 

FIGURE: {person_desc} in modern professional business attire, standing upright and centered, facing forward with slight smile, realistic detailed features.

PACKAGING: Clear plastic blister molded to hold figure and accessories, attached to rectangular cardboard backing card.

BACKING CARD: Solid bright orange background with large bold rounded serif font '{username}' at top center in light beige/tan color, smaller sans-serif 'FROM {username}' text below.

ACCESSORIES arranged symmetrically in separate molded compartments around central figure:
- Left side: DSLR camera, tablet, smartphone (3 items)
- Right side: video game controller, small robot figure, bicycle (3 items)  
- Bottom: four pairs of various sneaker/shoe styles in individual compartments

LIGHTING: Even direct product photography lighting, no harsh shadows, clean professional presentation.

STYLE: Photorealistic modern tech professional collectible toy, high detail, resembling classic action figure packaging, portrait orientation."""
    
    return perfect_prompt

def build_detailed_person_description(features: Dict[str, Any]) -> str:
    """Build comprehensive person description for perfect replication"""
    
    desc_parts = []
    
    # Gender and basic description
    if features['gender'].lower() == 'male':
        desc_parts.append("a man")
    elif features['gender'].lower() == 'female':
        desc_parts.append("a woman")
    else:
        desc_parts.append("a person")
    
    # Physical features
    if features['has_glasses']:
        desc_parts.append("wearing glasses")
    if features['has_beard']:
        desc_parts.append("with beard")
    if features['has_mustache']:
        desc_parts.append("with mustache")
    
    # Add professional appearance
    desc_parts.append("with professional modern appearance")
    
    return " ".join(desc_parts)

# Updated Lambda handler for perfect figurine
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Perfect Blister Pack Figurine Lambda handler
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
            return create_success_response({'status': 'healthy', 'service': 'snapmagic-perfect'})
        
        # All other endpoints require JWT authentication
        token = auth.extract_token_from_headers(headers)
        if not token:
            return auth.create_auth_response(False, "Missing authentication token", status_code=401)
        
        # Validate JWT token
        is_valid, payload = auth.validate_token(token)
        if not is_valid:
            return auth.create_auth_response(False, "Invalid or expired token", status_code=401)
        
        # Process authenticated AI requests with perfect generation
        return handle_ai_request_perfect(body, payload)
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def handle_ai_request_perfect(body: Dict[str, Any], token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle authenticated AI requests with perfect blister pack generation"""
    try:
        # Extract request parameters
        action = body.get('action', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        
        # Handle image transformation with perfect generation
        if action == 'transform_image':
            if not image_base64:
                return create_error_response("Missing image data", 400)
            
            logger.info(f"🎨 Processing perfect blister pack figurine")
            result = transform_image_bedrock_perfect(prompt, image_base64, token_payload.get('username'))
            
            return create_success_response({
                'result': result,
                'user': token_payload.get('username'),
                'session': token_payload.get('session_id'),
                'message': 'Perfect blister pack figurine created with Nova Canvas'
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
            'message': 'Mock response - focusing on perfect blister pack figurines'
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
