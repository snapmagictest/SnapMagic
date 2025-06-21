"""
Clean AWS Lambda handler for SnapMagic with direct Bedrock integration
"""

import json
import logging
import boto3
import random
from typing import Dict, Any
from auth_simple import auth

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Clean AWS Lambda handler for SnapMagic
    
    Args:
        event: Lambda event containing the request
        context: Lambda context
        
    Returns:
        Dict: Response with JWT authentication or AI results
    """
    try:
        logger.info(f"Received Lambda event: {json.dumps(event, default=str)}")
        
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response()
        
        # Parse request
        if 'body' in event:
            # API Gateway integration
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            # Direct Lambda invocation
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
            return create_success_response({'status': 'healthy', 'service': 'snapmagic-clean'})
        
        # All other endpoints require JWT authentication
        token = auth.extract_token_from_headers(headers)
        if not token:
            return auth.create_auth_response(False, "Missing authentication token", status_code=401)
        
        # Validate JWT token
        is_valid, payload = auth.validate_token(token)
        if not is_valid:
            return auth.create_auth_response(False, "Invalid or expired token", status_code=401)
        
        # Process authenticated AI requests
        return handle_ai_request(body, payload)
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def handle_login(body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle login request and return JWT token"""
    try:
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        
        if not username or not password:
            return auth.create_auth_response(False, "Username and password required", status_code=400)
        
        # Validate credentials
        if not auth.validate_login(username, password):
            return auth.create_auth_response(False, "Invalid credentials", status_code=401)
        
        # Generate JWT token
        token = auth.generate_token(username)
        
        return auth.create_auth_response(
            True, 
            "Login successful", 
            token=token, 
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return auth.create_auth_response(False, f"Login failed: {str(e)}", status_code=500)

def handle_ai_request(body: Dict[str, Any], token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle authenticated AI requests"""
    try:
        # Extract request parameters
        action = body.get('action', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        
        # Handle image transformation with direct Bedrock
        if action == 'transform_image':
            if not prompt or not image_base64:
                return create_error_response("Missing prompt or image data", 400)
            
            logger.info(f"🎨 Processing image transformation: {prompt}")
            result = transform_image_bedrock(prompt, image_base64, token_payload.get('username'))
            
            return create_success_response({
                'result': result,
                'user': token_payload.get('username'),
                'session': token_payload.get('session_id'),
                'message': 'Image transformation completed with direct Bedrock'
            })
            
        # Keep other actions as mock for now (focus on image first)
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
            'message': 'Mock response - focusing on image transformation first'
        })
        
    except Exception as e:
        logger.error(f"AI request error: {str(e)}")
        return create_error_response(f"AI processing failed: {str(e)}", 500)

def transform_image_bedrock(prompt: str, image_base64: str, username: str) -> str:
    """
    Transform image using direct Bedrock Nova Canvas integration
    """
    try:
        logger.info(f"🎨 Direct Bedrock transformation for user: {username}")
        
        # Clean the base64 data (remove data URL prefix if present)
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Prepare Nova Canvas payload for better face-aware transformation
        # Using TEXT_IMAGE with detailed prompt for better face preservation
        enhanced_prompt = f"A high-quality photograph of the same person {prompt}, maintaining the same facial features, face structure, and identity, photorealistic style, professional photography"
        
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": enhanced_prompt,
                "images": [image_base64],
                "similarityStrength": 0.7  # Higher value preserves more of original image
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 512,
                "height": 512,
                "numberOfImages": 1,
                "cfgScale": 8.0  # Higher CFG scale for better prompt adherence
            }
        }
        
        logger.info("🚀 Calling Bedrock Nova Canvas...")
        
        # Call Bedrock Nova Canvas
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info("✅ Direct Bedrock image transformation completed successfully")
            return transformed_image
        else:
            logger.error("No images returned from Bedrock")
            return "Error: No transformed image returned from Bedrock"
        
    except Exception as e:
        logger.error(f"Direct Bedrock transformation error: {str(e)}")
        return f"Error: Direct Bedrock transformation failed - {str(e)}"

def create_cors_response() -> Dict[str, Any]:
    """Create CORS preflight response"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
            'Access-Control-Max-Age': '86400'
        },
        'body': ''
    }

def create_success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create successful response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token'
        },
        'body': json.dumps({
            'success': True,
            'message': 'Request processed successfully',
            **data
        })
    }

def create_error_response(message: str, status_code: int = 500) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token'
        },
        'body': json.dumps({
            'success': False,
            'result': '',
            'message': message
        })
    }
