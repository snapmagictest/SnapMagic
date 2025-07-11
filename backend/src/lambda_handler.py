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

def load_limits() -> Dict[str, int]:
    """Load usage limits from environment variables (set by CDK from secrets.json)"""
    try:
        cards_limit = int(os.environ.get('CARDS_PER_USER', '5'))
        videos_limit = int(os.environ.get('VIDEOS_PER_USER', '3'))
        
        logger.info(f"Usage limits loaded - Cards: {cards_limit}, Videos: {videos_limit}")
        return {
            'cards': cards_limit,
            'videos': videos_limit
        }
    except Exception as e:
        logger.error(f"Failed to load limits: {str(e)}")
        return {'cards': 5, 'videos': 3}  # Safe defaults

def get_client_ip(request_headers: Dict[str, str]) -> str:
    """Extract client IP address from request headers"""
    # Try X-Forwarded-For first (from CloudFront/API Gateway)
    x_forwarded = request_headers.get('X-Forwarded-For', request_headers.get('x-forwarded-for', ''))
    if x_forwarded:
        # X-Forwarded-For can contain multiple IPs, take the first one (original client)
        client_ip = x_forwarded.split(',')[0].strip()
        if client_ip:
            return client_ip
    
    # Fallback to other headers
    real_ip = request_headers.get('X-Real-IP', request_headers.get('x-real-ip', ''))
    if real_ip:
        return real_ip
    
    # Last resort - use a default
    return 'unknown'

def get_session_identifier(request_headers: Dict[str, str]) -> str:
    """
    Generate a more robust session identifier for shared IP scenarios
    Combines IP with basic browser info to handle incognito/shared IPs better
    """
    import hashlib
    
    # Get base IP
    client_ip = get_client_ip(request_headers)
    
    # Add minimal browser fingerprinting for shared IP disambiguation
    user_agent = request_headers.get('User-Agent', request_headers.get('user-agent', ''))[:100]  # Truncate
    accept_lang = request_headers.get('Accept-Language', request_headers.get('accept-language', ''))[:50]  # Truncate
    
    # Create a session hash (not for security, just for disambiguation)
    session_data = f"{client_ip}|{user_agent}|{accept_lang}"
    session_hash = hashlib.md5(session_data.encode()).hexdigest()[:8]  # Short hash
    
    # Return IP with session suffix for better shared IP handling
    return f"{client_ip}_{session_hash}"

def get_usage_from_s3(session_id: str) -> Dict[str, int]:
    """Count existing cards and videos for session ID by checking S3 files"""
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            logger.warning("S3_BUCKET_NAME not configured")
            return {'cards': 0, 'videos': 0}
        
        # Count cards for this session
        logger.info(f"🔍 Counting cards for session {session_id} in bucket {bucket_name}")
        cards_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'cards/{session_id}_card_'
        )
        cards_count = len(cards_response.get('Contents', []))
        
        # Count videos for this session  
        logger.info(f"🔍 Counting videos for session {session_id} in bucket {bucket_name}")
        videos_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'videos/{session_id}_video_'
        )
        videos_count = len(videos_response.get('Contents', []))
        
        logger.info(f"📊 Session {session_id} current usage: {cards_count} cards, {videos_count} videos")
        
        # Log the actual files found for debugging
        if cards_response.get('Contents'):
            logger.info(f"📁 Found card files: {[obj['Key'] for obj in cards_response['Contents']]}")
        if videos_response.get('Contents'):
            logger.info(f"📁 Found video files: {[obj['Key'] for obj in videos_response['Contents']]}")
        
        return {'cards': cards_count, 'videos': videos_count}
        
    except Exception as e:
        logger.error(f"❌ Failed to get S3 usage for session {session_id}: {str(e)}")
        return {'cards': 0, 'videos': 0}

def check_usage_limit(session_id: str, generation_type: str) -> bool:
    """Check if session has exceeded usage limits by counting S3 files"""
    limits = load_limits()
    current_usage = get_usage_from_s3(session_id)
    
    current_count = current_usage.get(generation_type, 0)
    limit = limits.get(generation_type, 5)
    
    logger.info(f"Usage check - Session: {session_id}, Type: {generation_type}, Count: {current_count}, Limit: {limit}")
    return current_count < limit

def get_remaining_usage(session_id: str) -> Dict[str, int]:
    """Get remaining usage for session by counting S3 files and subtracting from limits"""
    limits = load_limits()
    current_usage = get_usage_from_s3(session_id)
    
    # Calculate remaining: max_limit - used_count
    cards_used = current_usage.get('cards', 0)
    videos_used = current_usage.get('videos', 0)
    
    cards_remaining = max(0, limits['cards'] - cards_used)
    videos_remaining = max(0, limits['videos'] - videos_used)
    
    remaining = {
        'cards': cards_remaining,
        'videos': videos_remaining
    }
    
    logger.info(f"📊 Session {session_id} calculation:")
    logger.info(f"   Cards: {cards_used} used / {limits['cards']} max = {cards_remaining} remaining")
    logger.info(f"   Videos: {videos_used} used / {limits['videos']} max = {videos_remaining} remaining")
    
    return remaining

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
        elif '/api/transform-card' in request_path:
            # Check body for specific action (card generation vs video generation vs video status)
            body_action = body.get('action', '').lower()
            if body_action == 'generate_video':
                action = 'generate_video'
            elif body_action == 'get_video_status':
                action = 'get_video_status'
            else:
                action = 'transform_card'  # Default to card generation
        elif '/api/store-card' in request_path:
            action = 'store_final_card'
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
                
                # Get session identifier and check usage limits
                request_headers = event.get('headers', {})
                session_id = get_session_identifier(request_headers)
                client_ip = get_client_ip(request_headers)
                remaining_usage = get_remaining_usage(session_id)
                
                logger.info(f"Login successful for session {session_id} (IP: {client_ip}), remaining usage: {remaining_usage}")
                
                return create_success_response({
                    'success': True,  # Frontend expects this field
                    'message': 'Login successful',
                    'token': token,
                    'expires_in': 86400,  # 24 hours
                    'user': {'username': username},
                    'remaining': remaining_usage,  # Include usage info at login
                    'session_id': session_id,  # For debugging
                    'client_ip': client_ip  # For debugging
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
            username = token_payload.get('username', 'unknown')
            
            # Get session identifier and check usage limits
            request_headers = event.get('headers', {})
            session_id = get_session_identifier(request_headers)
            client_ip = get_client_ip(request_headers)
            
            if not check_usage_limit(session_id, 'cards'):
                remaining = get_remaining_usage(session_id)
                return create_error_response(
                    f"Card generation limit reached for your session. You have {remaining['cards']} cards and {remaining['videos']} videos remaining.", 
                    429
                )
            
            prompt = body.get('prompt', '')
            if not prompt:
                return create_error_response("Missing prompt parameter", 400)
            
            # Validate prompt
            is_valid, error_msg = card_generator.validate_prompt(prompt)
            if not is_valid:
                return create_error_response(error_msg, 400)
            
            try:
                # Generate trading card (raw Nova Canvas image)
                result = card_generator.generate_trading_card(prompt)
                
                if result['success']:
                    # Don't store here - let frontend store the final composited card
                    # This ensures we store what the user actually downloads
                    
                    # Get current remaining usage (before increment)
                    remaining = get_remaining_usage(session_id)
                    
                    # Return in format frontend expects
                    return create_success_response({
                        'success': True,
                        'message': 'Trading card generated successfully',
                        'result': result['result'],  # Base64 image data
                        'imageSrc': result.get('imageSrc'),  # Data URL for frontend
                        'metadata': result.get('metadata', {}),
                        'remaining': remaining,  # Current remaining counts
                        'session_id': session_id,  # For debugging
                        'client_ip': client_ip  # For debugging
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
            username = token_payload.get('username', 'unknown')
            invocation_arn = body.get('invocation_arn', '')
            animation_prompt = body.get('animation_prompt', '')  # Store prompt for session filename
            
            if not invocation_arn:
                logger.error("❌ Missing invocation_arn parameter")
                return create_error_response("Missing invocation_arn parameter", 400)
            
            try:
                # Get session identifier for video storage
                request_headers = event.get('headers', {})
                session_id = get_session_identifier(request_headers)
                client_ip = get_client_ip(request_headers)
                
                # Check video status using Bedrock API
                logger.info(f"🔍 Checking video status for ARN: {invocation_arn}, Session: {session_id}")
                result = video_generator.get_video_status(invocation_arn)
                
                if result['success'] and result.get('status') == 'completed':
                    # Video is completed - store it with session-based filename
                    logger.info("✅ Video completed - storing with session-based filename...")
                    
                    storage_result = video_generator.store_video_with_session_filename(
                        invocation_arn, 
                        session_id, 
                        animation_prompt, 
                        username
                    )
                    
                    if storage_result['success']:
                        logger.info(f"✅ Video stored with session filename: {storage_result['session_s3_key']}")
                    else:
                        logger.warning(f"⚠️ Failed to store video with session filename: {storage_result['error']}")
                    
                    # Get updated remaining usage after video storage
                    remaining = get_remaining_usage(session_id)
                    
                    logger.info(f"✅ Video status check successful: {result.get('status')}")
                    return create_success_response({
                        'success': True,
                        'status': result.get('status'),
                        'video_base64': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'message': result.get('message'),
                        'invocation_arn': invocation_arn,
                        'remaining': remaining,  # Updated usage counts
                        'session_stored': storage_result['success'],  # Indicate if session storage worked
                        'session_id': session_id,  # For debugging
                        'client_ip': client_ip  # For debugging
                    })
                elif result['success']:
                    # Video still processing
                    logger.info(f"⏳ Video still processing: {result.get('message')}")
                    return create_success_response({
                        'success': True,
                        'status': result.get('status', 'processing'),
                        'message': result.get('message', 'Video is still processing'),
                        'invocation_arn': invocation_arn
                    })
                else:
                    # Video failed or other error
                    logger.info(f"❌ Video status error: {result.get('message')}")
                    return create_success_response({
                        'success': True,
                        'status': 'failed',
                        'message': result.get('message', 'Video generation failed'),
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
            username = token_payload.get('username', 'unknown')
            
            # Get session identifier and check usage limits
            request_headers = event.get('headers', {})
            session_id = get_session_identifier(request_headers)
            client_ip = get_client_ip(request_headers)
            
            if not check_usage_limit(session_id, 'videos'):
                remaining = get_remaining_usage(session_id)
                return create_error_response(
                    f"Video generation limit reached for your session. You have {remaining['cards']} cards and {remaining['videos']} videos remaining.", 
                    429
                )
            
            card_image = body.get('card_image', '')
            animation_prompt = body.get('animation_prompt', '')
            
            logger.info(f"🎬 Video generation request - session: {session_id}, card_image length: {len(card_image)}, prompt: {animation_prompt[:50]}...")
            
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
                    # Get updated remaining usage (will be recalculated from S3 after video storage)
                    remaining = get_remaining_usage(session_id)
                    
                    logger.info("✅ Video generation successful")
                    return create_success_response({
                        'success': True,
                        'message': 'Video generation started successfully',
                        'result': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'remaining': remaining,  # Add remaining counts
                        'session_id': session_id,  # For debugging
                        'client_ip': client_ip,  # For debugging
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
        # NEW: STORE FINAL CARD IN S3
        # STORE COMPOSITED CARDS IN cards/ FOLDER
        # ========================================
        elif action == 'store_final_card':
            username = token_payload.get('username', 'unknown')
            
            final_card_base64 = body.get('final_card_base64', '')
            prompt = body.get('prompt', '')
            user_name = body.get('user_name', '')
            
            if not final_card_base64:
                return create_error_response("Missing final_card_base64 parameter", 400)
            
            try:
                # Get session identifier for filename
                request_headers = event.get('headers', {})
                session_id = get_session_identifier(request_headers)
                client_ip = get_client_ip(request_headers)
                
                # Store final card in S3 cards/ folder with session-based filename
                result = card_generator.store_final_card_in_s3(
                    final_card_base64, 
                    prompt, 
                    user_name, 
                    username,
                    session_id  # Pass session ID for filename generation
                )
                
                if result['success']:
                    logger.info(f"✅ Final card stored in S3: {result['s3_key']}")
                    return create_success_response({
                        'success': True,
                        'message': 'Final card stored successfully',
                        's3_key': result['s3_key'],
                        's3_url': result.get('s3_url')
                    })
                else:
                    logger.error(f"❌ Failed to store final card: {result.get('error')}")
                    return create_error_response(f"Failed to store card: {result.get('error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Store final card exception: {str(e)}")
                return create_error_response(f"Failed to store card: {str(e)}", 500)
        
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
