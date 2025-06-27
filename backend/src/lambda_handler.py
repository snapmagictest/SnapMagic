"""
SnapMagic Lambda Handler - AI-Powered Trading Card Generation & Animation
Handles trading card creation using Amazon Bedrock Nova Canvas and video animation using Nova Reel
"""

import json
import logging
import os
from typing import Dict, Any
from auth_simple import SnapMagicAuthSimple
from card_generator import CardGenerator
from video_generator import VideoGenerator

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def load_event_credentials() -> Dict[str, str]:
    """
    Load event credentials from environment variables (set by CDK from secrets.json)
    
    Returns:
        Dict containing username and password for event authentication
    """
    try:
        # CDK sets these environment variables from secrets.json
        event_username = os.environ.get('EVENT_USERNAME', 'demo')  # fallback for local testing
        event_password = os.environ.get('EVENT_PASSWORD', 'demo')  # fallback for local testing
        
        logger.info(f"Event credentials loaded - Username: {event_username}")
        return {
            'username': event_username,
            'password': event_password
        }
    except Exception as e:
        logger.error(f"Failed to load event credentials: {str(e)}")
        # Fallback to demo credentials for safety
        return {
            'username': 'demo',
            'password': 'demo'
        }

# Initialize global instances for reuse across Lambda invocations
trading_card_generator = CardGenerator()
trading_card_video_generator = VideoGenerator()

def lambda_handler(event, context):
    """
    SnapMagic Lambda Handler - Main entry point for trading card operations
    
    Handles:
    - User authentication
    - Trading card generation (Nova Canvas)
    - Video animation generation (Nova Reel)
    - Video status polling and retrieval
    
    Args:
        event: AWS Lambda event object
        context: AWS Lambda context object
        
    Returns:
        HTTP response with CORS headers
    """
    try:
        logger.info(f"Received event: {json.dumps(event, default=str)}")
        
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response()
        
        # Parse request body safely
        try:
            body = json.loads(event.get('body', '{}'))
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in request body: {e}")
            return create_error_response("Invalid JSON in request body", 400)
        
        # Determine action from URL path or body
        resource_path = event.get('resource', '')
        path_info = event.get('pathInfo', '')
        request_path = resource_path or path_info or ''
        
        # Extract action using helper function
        action = determine_action(request_path, body)
        
        logger.info(f"🎯 Processing action: {action} from path: {request_path}")
        
        # ========================================
        # AUTHENTICATION ENDPOINT
        # ========================================
        if action == 'login':
            return handle_login(body)
        
        # ========================================
        # TRADING CARD OPERATIONS (REQUIRE AUTHENTICATION)
        # ========================================
        # Validate authentication token for all other operations
        auth_token = extract_auth_token(event)
        if not is_authenticated(auth_token):
            return create_error_response('Unauthorized', 401)
        
        # Route to appropriate handler
        if action == 'transform_card':
            return handle_card_generation(body)
        elif action == 'generate_video':
            return handle_video_generation(body)
        elif action == 'get_video_status':
            return handle_video_status_check(body)
        elif action == 'health':
            return handle_health_check()
        else:
            return create_error_response(f'Unknown action: {action}', 400)
            
    except Exception as e:
        logger.error(f"❌ Lambda handler error: {str(e)}")
        return create_error_response(f'Internal server error: {str(e)}', 500)
                'service': 'SnapMagic AI - Trading Cards & Videos',
                'version': '4.0',
                'features': ['trading_cards', 'video_generation', 'exact_coordinate_masking', 'nova_reel'],
                'timestamp': '2025-06-26T09:00:00Z'
            })
        
        else:
            return create_error_response(f"Unknown action: {action}", 400)
            
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Internal server error: {str(e)}", 500)

# ========================================
# RESPONSE HELPERS - EXACT SAME AS BEFORE
# DO NOT CHANGE - AUTHENTICATION DEPENDS ON THESE
# ========================================

def create_success_response(data):
    """Create standardized success response - EXACT SAME AS BEFORE"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(data)
    }

def create_error_response(message, status_code):
    """Create standardized error response - EXACT SAME AS BEFORE"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({
            'success': False,
            'error': message,
            'timestamp': '2025-06-25T21:00:00Z'
        })
    }

def create_cors_response():
    """Handle CORS preflight requests - EXACT SAME AS BEFORE"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({'message': 'CORS preflight successful'})
    }


# ========================================
# HELPER FUNCTIONS FOR CLEAN CODE ORGANIZATION
# ========================================

def determine_action(request_path: str, body: Dict[str, Any]) -> str:
    """
    Determine the action to perform based on request path and body
    
    Args:
        request_path: The API endpoint path
        body: Request body containing potential action
        
    Returns:
        Action string to be processed
    """
    if '/api/login' in request_path:
        return 'login'
    elif '/api/transform-card' in request_path:
        # Check body for specific action (card generation vs video generation vs video status)
        body_action = body.get('action', '').lower()
        if body_action == 'generate_video':
            return 'generate_video'
        elif body_action == 'get_video_status':
            return 'get_video_status'
        else:
            return 'transform_card'  # Default to card generation
    elif '/api/transform-image' in request_path:  # Keep old endpoint for compatibility
        return 'transform_card'
    elif '/health' in request_path:
        return 'health'
    else:
        return body.get('action', '').lower()


def extract_auth_token(event: Dict[str, Any]) -> str:
    """
    Extract authentication token from request headers
    
    Args:
        event: Lambda event object
        
    Returns:
        Authentication token string or empty string if not found
    """
    headers = event.get('headers', {}) or {}
    
    # Check for Authorization header with Bearer token
    auth_header = headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.replace('Bearer ', '')
    
    # Check for X-Auth-Token header (alternative format)
    return headers.get('X-Auth-Token', '')


def is_authenticated(auth_token: str) -> bool:
    """
    Validate authentication token
    
    Args:
        auth_token: Token to validate
        
    Returns:
        True if token is valid, False otherwise
    """
    if not auth_token:
        logger.warning("❌ No authentication token provided")
        return False
    
    try:
        auth_handler = SnapMagicAuthSimple()
        is_valid, token_payload = auth_handler.validate_token(auth_token)
        
        if is_valid and token_payload:
            logger.info(f"✅ Authenticated user: {token_payload.get('username')}")
            return True
        else:
            logger.warning("❌ Invalid or expired token")
            return False
            
    except Exception as e:
        logger.error(f"❌ Authentication validation error: {str(e)}")
        return False


def handle_login(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle user login authentication
    
    Args:
        body: Request body containing username and password
        
    Returns:
        HTTP response with authentication result
    """
    username = body.get('username', '')
    password = body.get('password', '')
    
    logger.info(f"Login attempt for user: {username}")
    
    # Load event credentials from environment variables
    event_credentials = load_event_credentials()
    
    if username == event_credentials['username'] and password == event_credentials['password']:
        # Create token using the existing auth module
        auth_handler = SnapMagicAuthSimple()
        auth_token = auth_handler.generate_token(username)
        
        logger.info(f"✅ Login successful for user: {username}")
        return create_success_response({
            'success': True,  # Frontend expects this field
            'message': 'Login successful',
            'token': auth_token,
            'expires_in': 86400,  # 24 hours
            'user': {'username': username}
        })
    else:
        logger.warning(f"❌ Login failed for user: {username}")
        return create_error_response('Invalid credentials', 401)


def handle_card_generation(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle trading card generation request
    
    Args:
        body: Request body containing card generation parameters
        
    Returns:
        HTTP response with generated card or error
    """
    try:
        user_prompt = body.get('prompt', '').strip()
        if not user_prompt:
            return create_error_response('Prompt is required for card generation', 400)
        
        # Validate prompt using card generator
        is_valid, error_message = trading_card_generator.validate_prompt(user_prompt)
        if not is_valid:
            return create_error_response(error_message, 400)
        
        logger.info(f"🎴 Generating trading card for prompt: {user_prompt[:50]}...")
        
        # Generate trading card using Nova Canvas
        card_result = trading_card_generator.generate_trading_card(user_prompt)
        
        if card_result.get('success'):
            logger.info("✅ Trading card generated successfully")
            return create_success_response({
                'success': True,
                'message': 'Trading card generated successfully',
                'result': card_result['result'],  # Base64 image data
                'imageSrc': card_result.get('imageSrc'),  # Data URL for frontend
                'metadata': card_result.get('metadata', {})
            })
        else:
            error_message = card_result.get('error', 'Unknown error during card generation')
            logger.error(f"❌ Card generation failed: {error_message}")
            return create_error_response(f"Generation failed: {error_message}", 500)
            
    except Exception as e:
        logger.error(f"❌ Card generation error: {str(e)}")
        return create_error_response(f'Card generation failed: {str(e)}', 500)


def handle_video_generation(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle video animation generation request
    
    Args:
        body: Request body containing video generation parameters
        
    Returns:
        HTTP response with video generation status
    """
    try:
        # Extract parameters (support both parameter names for compatibility)
        card_image_base64 = body.get('image_base64', '') or body.get('card_image', '')
        animation_prompt = body.get('animation_prompt', '').strip()
        
        if not card_image_base64:
            return create_error_response('Card image is required for video generation', 400)
        
        if not animation_prompt:
            return create_error_response('Animation prompt is required for video generation', 400)
        
        # Simple validation - frontend already validates
        if len(animation_prompt.strip()) < 5:
            return create_error_response('Animation prompt must be at least 5 characters', 400)
        
        # Validate base64 image
        try:
            import base64
            base64.b64decode(card_image_base64)
            logger.info("✅ Card image base64 validation passed")
        except Exception as e:
            logger.error(f"❌ Invalid base64 image data: {str(e)}")
            return create_error_response("Invalid card image data - must be valid base64", 400)
        
        logger.info(f"🎬 Generating video animation: {animation_prompt[:50]}...")
        
        # Generate video using Nova Reel
        video_result = trading_card_video_generator.generate_video_from_card(card_image_base64, animation_prompt)
        
        if video_result.get('success'):
            logger.info("✅ Video generation initiated successfully")
            return create_success_response({
                'success': True,
                'message': 'Video generation started successfully',
                'result': video_result.get('video_base64'),
                'video_url': video_result.get('video_url'),
                'metadata': {
                    'video_id': video_result.get('video_id'),
                    'invocation_arn': video_result.get('invocation_arn'),
                    'animation_prompt': animation_prompt,
                    'status': video_result.get('status'),
                    'estimated_time': video_result.get('estimated_time'),
                    'timestamp': video_result.get('timestamp')
                }
            })
        else:
            error_message = video_result.get('error', 'Unknown error during video generation')
            logger.error(f"❌ Video generation failed: {error_message}")
            return create_error_response(error_message, 500)
            
    except Exception as e:
        logger.error(f"❌ Video generation error: {str(e)}")
        return create_error_response(f'Video generation failed: {str(e)}', 500)


def handle_video_status_check(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle video generation status check request
    
    Args:
        body: Request body containing invocation ARN
        
    Returns:
        HTTP response with video status and data if ready
    """
    try:
        invocation_arn = body.get('invocation_arn', '').strip()
        
        if not invocation_arn:
            return create_error_response('Invocation ARN is required for status check', 400)
        
        logger.info(f"🔍 Checking video status for ARN: {invocation_arn}")
        
        # Check video status using Bedrock API
        status_result = trading_card_video_generator.get_video_status(invocation_arn)
        
        if status_result.get('success'):
            logger.info(f"✅ Video status check successful: {status_result.get('status')}")
            return create_success_response({
                'success': True,
                'status': status_result.get('status'),
                'video_base64': status_result.get('video_base64'),
                'video_url': status_result.get('video_url'),
                'video_size': status_result.get('video_size'),
                'message': status_result.get('message'),
                'invocation_arn': invocation_arn
            })
        else:
            # Video not ready yet - return processing status
            logger.info(f"⏳ Video not ready yet: {status_result.get('message')}")
            return create_success_response({
                'success': True,
                'status': 'processing',
                'message': status_result.get('message', 'Video is still processing'),
                'invocation_arn': invocation_arn
            })
            
    except Exception as e:
        logger.error(f"❌ Video status check error: {str(e)}")
        return create_error_response(f'Video status check failed: {str(e)}', 500)


def handle_health_check() -> Dict[str, Any]:
    """
    Handle health check request
    
    Returns:
        HTTP response with system health status
    """
    return create_success_response({
        'status': 'healthy',
        'service': 'SnapMagic Trading Card System',
        'features': ['card_generation', 'video_animation'],
        'timestamp': str(context.aws_request_id) if 'context' in globals() else 'unknown'
    })


def create_success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create standardized success response with CORS headers
    
    Args:
        data: Response data to return
        
    Returns:
        Formatted HTTP response
    """
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(data, default=str)
    }


def create_error_response(error_message: str, status_code: int = 500) -> Dict[str, Any]:
    """
    Create standardized error response with CORS headers
    
    Args:
        error_message: Error message to return
        status_code: HTTP status code
        
    Returns:
        Formatted HTTP error response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'error': error_message,
            'success': False
        })
    }
