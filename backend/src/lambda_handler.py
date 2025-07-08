"""
SnapMagic Lambda Handler - Trading Card Generation
PRESERVES existing authentication system, REPLACES FunkoPop with card generation
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
    """Load event credentials from environment variables (set by CDK from secrets.json)"""
    try:
        # CDK should set these environment variables from secrets.json
        username = os.environ.get('EVENT_USERNAME', 'demo')  # fallback for local testing
        password = os.environ.get('EVENT_PASSWORD', 'demo')  # fallback for local testing
        
        logger.info(f"Event credentials loaded - Username: {username}")
        return {
            'username': username,
            'password': password
        }
    except Exception as e:
        logger.error(f"Failed to load event credentials: {str(e)}")
        # Fallback to demo credentials for safety
        return {
            'username': 'demo',
            'password': 'demo'
        }

# Global instances
card_generator = CardGenerator()
video_generator = VideoGenerator()

def lambda_handler(event, context):
    """
    SnapMagic Lambda Handler with Trading Card Generation
    MAINTAINS EXACT SAME AUTHENTICATION SYSTEM - DO NOT CHANGE
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
        
        # Extract action from path or body
        if '/api/login' in request_path:
            action = 'login'
        elif '/api/template-config' in request_path:
            action = 'get_template_config'
        elif '/api/transform-card' in request_path:
            # Check body for specific action (card generation vs video generation vs video status)
            body_action = body.get('action', '').lower()
            if body_action == 'generate_video':
                action = 'generate_video'
            elif body_action == 'get_video_status':
                action = 'get_video_status'
            else:
                action = 'transform_card'  # Default to card generation
        elif '/api/transform-image' in request_path:  # Keep old endpoint for compatibility
            action = 'transform_card'
        elif '/health' in request_path:
            action = 'health'
        else:
            action = body.get('action', '').lower()
        
        logger.info(f"🎯 Processing action: {action} from path: {request_path}")
        
        # ========================================
        # LOGIN ENDPOINT (NO AUTHENTICATION REQUIRED)
        # EXACT SAME AS BEFORE - DO NOT CHANGE
        # ========================================
        if action == 'login':
            username = body.get('username', '')
            password = body.get('password', '')
            
            logger.info(f"Login attempt for user: {username}")
            
            # Load event credentials from environment variables
            event_creds = load_event_credentials()
            
            if username == event_creds['username'] and password == event_creds['password']:
                # Create token using the existing auth module
                auth_handler = SnapMagicAuthSimple()
                token = auth_handler.generate_token(username)
                logger.info("Login successful, token generated")
                return create_success_response({
                    'success': True,  # Frontend expects this field
                    'message': 'Login successful',
                    'token': token,
                    'expires_in': 86400,  # 24 hours
                    'user': {'username': username}
                })
            else:
                logger.warning(f"Invalid login attempt: {username}")
                return create_error_response("Invalid credentials", 401)
        
        # ========================================
        # ALL OTHER ENDPOINTS REQUIRE AUTHENTICATION
        # EXACT SAME PATTERN AS BEFORE - DO NOT CHANGE
        # ========================================
        auth_header = event.get('headers', {}).get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return create_error_response("Missing authorization header", 401)
        
        token = auth_header.replace('Bearer ', '')
        auth_handler = SnapMagicAuthSimple()
        is_valid, token_payload = auth_handler.validate_token(token)
        
        if not is_valid or not token_payload:
            return create_error_response("Invalid or expired token", 401)
        
        logger.info(f"✅ Authenticated user: {token_payload.get('username')}")
        
        # ========================================
        # NEW: TRADING CARD GENERATION
        # REPLACES OLD FUNKOPOP FUNCTIONALITY
        # ========================================
        if action == 'transform_card':
            prompt = body.get('prompt', '')
            if not prompt:
                return create_error_response("Missing prompt parameter", 400)
            
            # Validate prompt
            is_valid, error_msg = card_generator.validate_prompt(prompt)
            if not is_valid:
                return create_error_response(error_msg, 400)
            
            try:
                # Generate trading card
                result = card_generator.generate_trading_card(prompt)
                
                if result['success']:
                    # Return in format frontend expects
                    return create_success_response({
                        'success': True,
                        'message': 'Trading card generated successfully',
                        'result': result['result'],  # Base64 image data
                        'imageSrc': result.get('imageSrc'),  # Data URL for frontend
                        'metadata': result.get('metadata', {})
                    })
                else:
                    return create_error_response(f"Generation failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"Card generation error: {str(e)}")
                return create_error_response(f"Card generation failed: {str(e)}", 500)
        
        # ========================================
        # NEW: VIDEO STATUS CHECK
        # CHECK S3 FOR COMPLETED VIDEOS
        # ========================================
        elif action == 'get_video_status':
            invocation_arn = body.get('invocation_arn', '')
            
            if not invocation_arn:
                logger.error("❌ Missing invocation_arn parameter")
                return create_error_response("Missing invocation_arn parameter", 400)
            
            try:
                # Check video status using Bedrock API
                logger.info(f"🔍 Checking video status for ARN: {invocation_arn}")
                result = video_generator.get_video_status(invocation_arn)
                
                if result['success']:
                    logger.info(f"✅ Video status check successful: {result.get('status')}")
                    return create_success_response({
                        'success': True,
                        'status': result.get('status'),
                        'video_base64': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'message': result.get('message'),
                        'invocation_arn': invocation_arn
                    })
                else:
                    logger.info(f"⏳ Video not ready yet: {result.get('message')}")
                    return create_success_response({
                        'success': True,
                        'status': 'processing',
                        'message': result.get('message', 'Video is still processing'),
                        'invocation_arn': invocation_arn
                    })
                    
            except Exception as e:
                logger.error(f"❌ Video status check exception: {str(e)}")
                return create_error_response(f"Video status check failed: {str(e)}", 500)
        
        # ========================================
        # NEW: NOVA REEL VIDEO GENERATION
        # ANIMATE TRADING CARDS WITH S3 STORAGE
        # ========================================
        elif action == 'generate_video':
            card_image = body.get('card_image', '')
            animation_prompt = body.get('animation_prompt', '')
            
            logger.info(f"🎬 Video generation request - card_image length: {len(card_image)}, prompt: {animation_prompt[:50]}...")
            
            if not card_image:
                logger.error("❌ Missing card_image parameter")
                return create_error_response("Missing card_image parameter", 400)
            
            # Simple validation - frontend already validates
            if not animation_prompt or len(animation_prompt.strip()) < 5:
                logger.error("❌ Animation prompt too short")
                return create_error_response("Animation prompt must be at least 5 characters", 400)
            
            # Validate base64 image
            try:
                import base64
                base64.b64decode(card_image)
                logger.info("✅ Card image base64 validation passed")
            except Exception as e:
                logger.error(f"❌ Invalid base64 image data: {str(e)}")
                return create_error_response("Invalid card image data - must be valid base64", 400)
            
            try:
                # Generate video using video generator
                logger.info("🎬 Starting video generation with VideoGenerator...")
                result = video_generator.generate_video_from_card(card_image, animation_prompt)
                logger.info(f"🎬 Video generation result: {result.get('success', False)}")
                
                if result['success']:
                    logger.info("✅ Video generation successful")
                    return create_success_response({
                        'success': True,
                        'message': 'Video generation started successfully',
                        'result': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'metadata': {
                            'video_id': result.get('video_id'),
                            'invocation_arn': result.get('invocation_arn'),
                            'animation_prompt': animation_prompt,
                            'status': result.get('status'),
                            'estimated_time': result.get('estimated_time'),
                            'timestamp': result.get('timestamp')
                        }
                    })
                else:
                    error_msg = result.get('error', 'Video generation failed')
                    logger.error(f"❌ Video generation failed: {error_msg}")
                    return create_error_response(error_msg, 500)
                    
            except Exception as e:
                logger.error(f"❌ Video generation exception: {str(e)}")
                return create_error_response(f"Video generation failed: {str(e)}", 500)
        
        # ========================================
        # HEALTH CHECK ENDPOINT
        # UPDATED FOR CARD GENERATION
        # ========================================
        elif action == 'health':
            return create_success_response({
                'status': 'healthy',
                'service': 'SnapMagic AI - Trading Cards & Videos',
                'version': '4.0',
                'features': ['trading_cards', 'video_generation', 'exact_coordinate_masking', 'nova_reel'],
                'timestamp': '2025-06-26T09:00:00Z'
            })
        
        # ========================================
        # TEMPLATE CONFIGURATION ENDPOINT
        # ========================================
        elif action == 'get_template_config':
            return get_template_configuration()
        
        else:
            return create_error_response(f"Unknown action: {action}", 400)
            
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Internal server error: {str(e)}", 500)

def get_template_configuration():
    """
    Load template configuration from environment variables (set by CDK from secrets.json)
    Returns template settings for frontend card composition
    """
    try:
        template_config = {
            'eventName': os.environ.get('TEMPLATE_EVENT_NAME', 'AWS Event'),
            'customerLogo': {
                'enabled': os.environ.get('TEMPLATE_CUSTOMER_LOGO_ENABLED', 'false').lower() == 'true',
                'url': os.environ.get('TEMPLATE_CUSTOMER_LOGO_URL', ''),
                'alt': os.environ.get('TEMPLATE_CUSTOMER_LOGO_ALT', 'Customer')
            },
            'partnerLogo': {
                'enabled': os.environ.get('TEMPLATE_PARTNER_LOGO_ENABLED', 'false').lower() == 'true',
                'url': os.environ.get('TEMPLATE_PARTNER_LOGO_URL', ''),
                'alt': os.environ.get('TEMPLATE_PARTNER_LOGO_ALT', 'Partner')
            },
            'awsLogo': {
                'enabled': os.environ.get('TEMPLATE_AWS_LOGO_ENABLED', 'true').lower() == 'true',
                'text': os.environ.get('TEMPLATE_AWS_LOGO_TEXT', 'Powered by AWS')
            }
        }
        
        logger.info(f"Template configuration loaded: {json.dumps(template_config)}")
        return create_success_response(template_config)
        
    except Exception as e:
        logger.error(f"Failed to load template configuration: {str(e)}")
        return create_error_response(f"Template configuration error: {str(e)}", 500)

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
