"""
SnapMagic Lambda Handler - Trading Card Generation with Simplified Override System
STANDARD PATTERN: Always use IP_override1, IP_override2, etc. with timestamps
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
        prints_limit = int(os.environ.get('PRINTS_PER_USER', '1'))
        
        logger.info(f"Usage limits loaded - Cards: {cards_limit}, Videos: {videos_limit}, Prints: {prints_limit}")
        return {
            'cards': cards_limit,
            'videos': videos_limit,
            'prints': prints_limit
        }
    except Exception as e:
        logger.error(f"Failed to load limits: {str(e)}")
        return {'cards': 5, 'videos': 3, 'prints': 1}  # Safe defaults

def create_standard_session_id(client_ip: str, override_number: int = 1) -> str:
    """
    Create standard session ID - ALWAYS uses override pattern starting from 1
    
    Args:
        client_ip: Client IP address
        override_number: Override number (starts at 1, increments when staff presses button)
        
    Returns:
        Standard session ID: IP_override1, IP_override2, etc.
    """
    session_id = f"{client_ip}_override{override_number}"
    logger.info(f"📝 Created standard session ID: {session_id}")
    return session_id

def get_current_override_number(client_ip: str) -> int:
    """
    Get current override number for IP by checking S3 files
    Returns the highest override number found, or 1 if none exist
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Check all folders for this IP to find highest override number
        max_override = 0
        
        for prefix in ['cards', 'videos', 'print-queue']:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=f'{prefix}/{client_ip}_override'
            )
            for obj in response.get('Contents', []):
                filename = obj['Key']
                if '_override' in filename:
                    # Extract override number from filename like: IP_override1_card_1_timestamp.png
                    try:
                        parts = filename.split('_override')[1]
                        override_num = int(parts.split('_')[0])
                        max_override = max(max_override, override_num)
                    except (ValueError, IndexError):
                        continue
        
        # Return current override number (starts at 1 if none found)
        current_override = max(1, max_override)
        logger.info(f"📊 IP {client_ip} current override number: {current_override}")
        return current_override
        
    except Exception as e:
        logger.error(f"❌ Failed to get override number for IP {client_ip}: {str(e)}")
        return 1

def increment_override_number(client_ip: str) -> int:
    """
    Increment override number when staff presses override button
    Returns the NEW override number to use
    """
    current = get_current_override_number(client_ip)
    new_override = current + 1
    logger.info(f"🔓 Staff override pressed - IP {client_ip}: override{current} → override{new_override}")
    return new_override

def create_standard_filename(session_id: str, file_type: str, extension: str) -> tuple[str, str]:
    """
    Create standardized filename with timestamp for ALL files
    
    Args:
        session_id: IP_override1, IP_override2, etc.
        file_type: 'card', 'print', 'video'  
        extension: 'png', 'mp4', etc.
        
    Returns:
        tuple: (filename, s3_key)
    """
    from datetime import datetime
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{session_id}_card_1_{timestamp}.{extension}"
    
    # Determine folder based on file type
    folder_map = {
        'card': 'cards',
        'print': 'print-queue', 
        'video': 'videos'
    }
    folder = folder_map.get(file_type, 'cards')
    
    s3_key = f"{folder}/{filename}"
    return filename, s3_key

def check_usage_limit_simplified(client_ip: str, generation_type: str, override_code: str = None) -> tuple[bool, str]:
    """
    Simplified usage check - ALWAYS uses standard override pattern
    
    Args:
        client_ip: Client IP address
        generation_type: 'cards', 'videos', 'prints'
        override_code: If provided, increment override number
        
    Returns:
        tuple: (allowed: bool, session_id_to_use: str)
    """
    
    # Check if staff override button was pressed
    valid_override_code = os.environ.get('OVERRIDE_CODE', 'snap')
    if override_code and override_code == valid_override_code:
        # Staff pressed override - increment to next override number
        new_override_number = increment_override_number(client_ip)
        session_id = create_standard_session_id(client_ip, new_override_number)
        logger.info(f"🎁 Staff override applied - using {session_id}")
        return True, session_id
    
    # Normal usage - use current override number (starts at 1)
    current_override = get_current_override_number(client_ip)
    session_id = create_standard_session_id(client_ip, current_override)
    
    # Check normal usage limits (simplified - just check total files for this override)
    limits = load_limits()
    current_usage = get_usage_for_override_session(client_ip, current_override)
    current_count = current_usage.get(generation_type, 0)
    limit = limits.get(generation_type, 5)
    
    logger.info(f"Usage check - IP: {client_ip}, Override: {current_override}, Type: {generation_type}, Count: {current_count}, Limit: {limit}")
    
    return current_count < limit, session_id

def get_usage_for_override_session(client_ip: str, override_number: int) -> Dict[str, int]:
    """Count files for specific override session"""
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return {'cards': 0, 'videos': 0, 'prints': 0}
        
        session_prefix = f"{client_ip}_override{override_number}_"
        usage = {'cards': 0, 'videos': 0, 'prints': 0}
        
        # Count cards
        cards_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'cards/{session_prefix}'
        )
        usage['cards'] = len(cards_response.get('Contents', []))
        
        # Count videos
        videos_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'videos/{session_prefix}'
        )
        usage['videos'] = len(videos_response.get('Contents', []))
        
        # Count prints
        prints_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'print-queue/{session_prefix}'
        )
        usage['prints'] = len(prints_response.get('Contents', []))
        
        logger.info(f"📊 IP {client_ip} override{override_number} usage: {usage}")
        return usage
        
    except Exception as e:
        logger.error(f"❌ Failed to get usage for IP {client_ip} override{override_number}: {str(e)}")
        return {'cards': 0, 'videos': 0, 'prints': 0}

def get_remaining_usage_simplified(client_ip: str) -> Dict[str, int]:
    """Get remaining usage for current override session"""
    limits = load_limits()
    current_override = get_current_override_number(client_ip)
    current_usage = get_usage_for_override_session(client_ip, current_override)
    
    # Calculate remaining: max_limit - used_count
    cards_used = current_usage.get('cards', 0)
    videos_used = current_usage.get('videos', 0)
    prints_used = current_usage.get('prints', 0)
    
    cards_remaining = max(0, limits['cards'] - cards_used)
    videos_remaining = max(0, limits['videos'] - videos_used)
    prints_remaining = max(0, limits['prints'] - prints_used)
    
    remaining = {
        'cards': cards_remaining,
        'videos': videos_remaining,
        'prints': prints_remaining
    }
    
    logger.info(f"📊 IP {client_ip} override{current_override} remaining: {remaining}")
    return remaining

def store_file_with_standard_pattern(session_id: str, username: str, prompt: str, file_data: bytes, file_type: str, extension: str, content_type: str) -> Dict[str, Any]:
    """
    Universal file storage method using standard override pattern for ALL files
    
    Args:
        session_id: IP_override1, IP_override2, etc.
        username: Authenticated username
        prompt: User prompt
        file_data: Binary file data
        file_type: 'card', 'print', 'video'
        extension: 'png', 'mp4', etc.
        content_type: 'image/png', 'video/mp4', etc.
        
    Returns:
        Dictionary with success status and file info
    """
    try:
        import boto3
        from datetime import datetime
        
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return {'success': False, 'error': 'S3 bucket not configured'}
        
        # Create standardized filename with timestamp
        filename, s3_key = create_standard_filename(session_id, file_type, extension)
        
        # Store in S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=file_data,
            ContentType=content_type,
            Metadata={
                'username': username,
                'prompt': prompt[:100],
                'session_id': session_id,
                'file_type': file_type,
                'created_at': datetime.now().isoformat()
            }
        )
        
        logger.info(f"📁 {file_type.title()} stored with standard pattern: {s3_key}")
        return {'success': True, 's3_key': s3_key, 'filename': filename}
        
    except Exception as e:
        logger.error(f"❌ Failed to store {file_type}: {str(e)}")
        return {'success': False, 'error': str(e)}

def store_print_record_simple(session_id: str, username: str, prompt: str, image_base64: str) -> Dict[str, Any]:
    """Store print record using standard pattern"""
    try:
        import base64
        
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Use universal storage method with standard pattern
        result = store_file_with_standard_pattern(
            session_id=session_id,
            username=username, 
            prompt=prompt,
            file_data=image_data,
            file_type='print',
            extension='png',
            content_type='image/png'
        )
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Failed to store print record: {str(e)}")
        return {'success': False, 'error': str(e)}

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
    SnapMagic Lambda Handler with Simplified Override System
    STANDARD PATTERN: Always IP_override1, IP_override2, etc. with timestamps
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
            # Check body for specific action (card generation vs video generation vs video status vs override)
            body_action = body.get('action', '').lower()
            if body_action == 'generate_video':
                action = 'generate_video'
            elif body_action == 'get_video_status':
                action = 'get_video_status'
            elif body_action == 'apply_override':
                action = 'apply_override'
            else:
                action = 'transform_card'  # Default to card generation
        elif '/api/store-card' in request_path:
            action = 'store_final_card'
        elif '/api/print-card' in request_path:
            action = 'print_card'
        elif '/health' in request_path:
            action = 'health'
        else:
            action = body.get('action', '').lower()
        
        logger.info(f"🎯 Processing action: {action} from path: {request_path}")
        
        # ========================================
        # LOGIN ENDPOINT (NO AUTHENTICATION REQUIRED)
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
                
                # Get client IP for simplified tracking
                request_headers = event.get('headers', {})
                client_ip = get_client_ip(request_headers)
                remaining_usage = get_remaining_usage_simplified(client_ip)
                
                logger.info(f"Login successful for IP: {client_ip}, remaining usage: {remaining_usage}")
                
                return create_success_response({
                    'success': True,  # Frontend expects this field
                    'message': 'Login successful',
                    'token': token,
                    'expires_in': 86400,  # 24 hours
                    'user': {'username': username},
                    'remaining': remaining_usage,  # Include usage info at login
                    'client_ip': client_ip  # For debugging - IP only, no session ID
                })
            else:
                logger.warning(f"Invalid login attempt: {username}")
                return create_error_response("Invalid credentials", 401)
        
        # ========================================
        # ALL OTHER ENDPOINTS REQUIRE AUTHENTICATION
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
        # TRADING CARD GENERATION WITH STANDARD PATTERN
        # ========================================
        if action == 'transform_card':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP for standard pattern
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            logger.info(f"🎴 Card generation request - IP: {client_ip}")
            
            # Extract override code from request body if provided
            override_code = body.get('override_code')
            
            # Check usage limits and get session_id using standard pattern
            allowed, session_id_for_files = check_usage_limit_simplified(client_ip, 'cards', override_code)
            
            if not allowed:
                return create_error_response(
                    f"Limit reached. Please visit the event staff at SnapMagic to assist.", 
                    429
                )
            
            logger.info(f"📝 Using standard session ID: {session_id_for_files}")
            
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
                    # Get current remaining usage
                    remaining = get_remaining_usage_simplified(client_ip)
                    
                    # Return in format frontend expects
                    return create_success_response({
                        'success': True,
                        'message': 'Trading card generated successfully',
                        'result': result['result'],  # Base64 image data
                        'imageSrc': result.get('imageSrc'),  # Data URL for frontend
                        'metadata': result.get('metadata', {}),
                        'remaining': remaining,  # Current remaining counts
                        'session_id': session_id_for_files,  # For debugging
                        'client_ip': client_ip  # For debugging
                    })
                else:
                    return create_error_response(f"Generation failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"Card generation error: {str(e)}")
                return create_error_response(f"Card generation failed: {str(e)}", 500)
        
        # ========================================
        # STORE FINAL CARD IN S3 WITH STANDARD PATTERN
        # ========================================
        elif action == 'store_final_card':
            username = token_payload.get('username', 'unknown')
            
            final_card_base64 = body.get('final_card_base64', '')
            prompt = body.get('prompt', '')
            user_name = body.get('user_name', '')
            
            if not final_card_base64:
                return create_error_response("Missing final_card_base64 parameter", 400)
            
            try:
                # Get client IP and current override number
                request_headers = event.get('headers', {})
                client_ip = get_client_ip(request_headers)
                current_override = get_current_override_number(client_ip)
                session_id_for_files = create_standard_session_id(client_ip, current_override)
                
                logger.info(f"📁 Storing final card with standard session ID: {session_id_for_files}")
                
                # Decode and store using standard pattern
                import base64
                image_data = base64.b64decode(final_card_base64)
                
                result = store_file_with_standard_pattern(
                    session_id=session_id_for_files,
                    username=username,
                    prompt=prompt,
                    file_data=image_data,
                    file_type='card',
                    extension='png',
                    content_type='image/png'
                )
                
                if result['success']:
                    logger.info(f"✅ Final card stored in S3: {result['s3_key']}")
                    return create_success_response({
                        'success': True,
                        'message': 'Final card stored successfully',
                        's3_key': result['s3_key'],
                        'filename': result['filename']
                    })
                else:
                    logger.error(f"❌ Failed to store final card: {result.get('error')}")
                    return create_error_response(f"Failed to store card: {result.get('error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Store final card exception: {str(e)}")
                return create_error_response(f"Failed to store card: {str(e)}", 500)
        
        # ========================================
        # PRINT CARD WITH STANDARD PATTERN
        # ========================================
        elif action == 'print_card':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP and check print limits
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Extract override code from request body if provided
            override_code = body.get('override_code')
            
            # Check usage limits and get session_id using standard pattern
            allowed, session_id_for_files = check_usage_limit_simplified(client_ip, 'prints', override_code)
            
            if not allowed:
                return create_error_response(
                    f"Limit reached. Please visit the event staff at SnapMagic to assist.", 
                    429
                )
            
            logger.info(f"📝 Using standard session ID for print: {session_id_for_files}")
            
            card_prompt = body.get('card_prompt', '')
            card_image_base64 = body.get('card_image', '')
            
            if not card_prompt:
                logger.error("❌ Missing card_prompt parameter")
                return create_error_response("Missing card_prompt parameter", 400)
                
            if not card_image_base64:
                logger.error("❌ Missing card_image parameter")
                return create_error_response("Missing card_image parameter - card image required for print queue", 400)
            
            try:
                # Store print record using standard pattern
                logger.info(f"🖨️ Print queue request - session: {session_id_for_files}, prompt: {card_prompt[:50]}...")
                
                result = store_print_record_simple(session_id_for_files, username, card_prompt, card_image_base64)
                
                if result['success']:
                    # Get updated remaining usage
                    remaining = get_remaining_usage_simplified(client_ip)
                    
                    logger.info("✅ Card print stored successfully")
                    return create_success_response({
                        'success': True,
                        'message': f'Card saved for printing',
                        'print_filename': result.get('filename', 'unknown'),
                        'remaining': remaining,  # Updated usage counts
                        'session_id': session_id_for_files,  # For debugging
                        'client_ip': client_ip,  # For debugging
                        'print_s3_key': result.get('s3_key', 'unknown')
                    })
                else:
                    logger.error(f"❌ Failed to add card to print queue: {result.get('error')}")
                    return create_error_response(f"Print queue failed: {result.get('error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Print queue request exception: {str(e)}")
                return create_error_response(f"Print queue request failed: {str(e)}", 500)
        
        # ========================================
        # APPLY OVERRIDE - SIMPLIFIED
        # ========================================
        elif action == 'apply_override':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Extract override code from request body
            override_code = body.get('override_code')
            
            if not override_code or override_code != 'snap':
                return create_error_response("Invalid override code", 400)
            
            logger.info(f"🔓 Override request from IP {client_ip}")
            
            # Increment to next override number
            new_override_number = increment_override_number(client_ip)
            new_session_id = create_standard_session_id(client_ip, new_override_number)
            
            logger.info(f"🎁 Override #{new_override_number} applied for IP {client_ip}")
            logger.info(f"📝 New session ID: {new_session_id}")
            
            # Return success with new session info
            return create_success_response({
                'success': True,
                'message': f'Override #{new_override_number} applied successfully',
                'override_number': new_override_number,
                'session_id': new_session_id,
                'client_ip': client_ip,
                'remaining': {
                    'cards': 5,
                    'videos': 3,
                    'prints': 1
                }
            })
        
        # HEALTH CHECK ENDPOINT
        elif action == 'health':
            return create_success_response({
                'status': 'healthy',
                'service': 'SnapMagic AI - Trading Cards & Videos',
                'version': '5.0',
                'features': ['standard_override_pattern', 'timestamp_filenames', 'simplified_logic'],
                'timestamp': '2025-07-12T18:30:00Z'
            })
        
        else:
            return create_error_response(f"Unknown action: {action}", 400)
            
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Internal server error: {str(e)}", 500)

# ========================================
# RESPONSE HELPERS
# ========================================

def create_success_response(data):
    """Create standardized success response"""
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
    """Create standardized error response"""
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
            'timestamp': '2025-07-12T18:30:00Z'
        })
    }

def create_cors_response():
    """Handle CORS preflight requests"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({'message': 'CORS preflight successful'})
    }
