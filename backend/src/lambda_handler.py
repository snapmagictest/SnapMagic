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

def get_next_video_number_for_session(client_ip: str, override_number: int) -> int:
    """
    Get the next video number for a specific override session
    Count existing video files to get next video number
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Count existing video files for this override session
        session_prefix = f"{client_ip}_override{override_number}_card_"
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'videos/{session_prefix}'
        )
        
        # Count files that contain "_video_" to get video number
        video_count = 0
        for obj in response.get('Contents', []):
            if '_video_' in obj['Key']:
                video_count += 1
        
        next_video_number = video_count + 1
        
        logger.info(f"🎬 IP {client_ip} override{override_number}: {video_count} videos exist, next video #{next_video_number}")
        
        return next_video_number
        
    except Exception as e:
        logger.error(f"❌ Failed to get next video number: {str(e)}")
        return 1

def get_next_print_queue_number() -> int:
    """
    Simple: Count all files in print-queue folder + 1
    No complex logic - just total print queue position
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Count ALL files in print-queue folder
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='print-queue/'
        )
        
        total_prints = len(response.get('Contents', []))
        next_print_number = total_prints + 1
        
        logger.info(f"🖨️ Total prints in queue: {total_prints}, next print number: #{next_print_number}")
        
        return next_print_number
        
    except Exception as e:
        logger.error(f"❌ Failed to get print queue number: {str(e)}")
        return 1

def get_pending_override_number(client_ip: str) -> int:
    """
    Check if there's a pending override increment for this IP
    This handles the gap between staff clicking override and first card being generated
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 0
        
        # Check for pending override marker
        try:
            response = s3_client.get_object(
                Bucket=bucket_name,
                Key=f'pending-overrides/{client_ip}_pending.txt'
            )
            
            content = response['Body'].read().decode('utf-8')
            pending_override = int(content.strip())
            logger.info(f"🔍 Found pending override for IP {client_ip}: override{pending_override}")
            return pending_override
            
        except s3_client.exceptions.NoSuchKey:
            # No pending override
            return 0
        except Exception as e:
            logger.warning(f"⚠️ Error checking pending override: {str(e)}")
            return 0
            
    except Exception as e:
        logger.error(f"❌ Failed to check pending override: {str(e)}")
        return 0

def clear_pending_override(client_ip: str):
    """Clear pending override marker after first card is generated"""
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if bucket_name:
            s3_client.delete_object(
                Bucket=bucket_name,
                Key=f'pending-overrides/{client_ip}_pending.txt'
            )
            logger.info(f"🗑️ Cleared pending override for IP {client_ip}")
            
    except Exception as e:
        logger.warning(f"⚠️ Failed to clear pending override: {str(e)}")

def get_current_override_number(client_ip: str) -> int:
    """
    Get current override number for IP
    First checks for pending override, then existing files
    """
    # Check if there's a pending override first
    pending = get_pending_override_number(client_ip)
    if pending > 0:
        logger.info(f"🎯 Using pending override for IP {client_ip}: override{pending}")
        return pending
    
    # Otherwise check existing files
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Check all folders for this IP to find HIGHEST override number
        max_override = 0
        
        logger.info(f"🔍 Establishing base override for IP {client_ip}")
        
        # Check actual files in cards, videos, print-queue folders
        for prefix in ['cards', 'videos', 'print-queue']:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=f'{prefix}/{client_ip}_override'
            )
            
            for obj in response.get('Contents', []):
                filename = obj['Key']
                logger.info(f"📁 Found file: {filename}")
                
                if '_override' in filename:
                    try:
                        parts = filename.split('_override')[1]
                        override_num = int(parts.split('_')[0])
                        max_override = max(max_override, override_num)
                        logger.info(f"📊 Extracted override number: {override_num}, current max: {max_override}")
                    except (ValueError, IndexError) as e:
                        logger.warning(f"⚠️ Could not parse override number from {filename}: {e}")
                        continue
        
        # The current base is the highest override found, or 1 if none exist
        current_base = max(1, max_override)
        logger.info(f"✅ Established base override for IP {client_ip}: override{current_base}")
        
        return current_base
        
    except Exception as e:
        logger.error(f"❌ Failed to establish base override for IP {client_ip}: {str(e)}")
        return 1



def get_next_card_number_for_session(client_ip: str, override_number: int, file_type: str) -> int:
    """
    Get the next card number for a specific override session by counting existing files
    NO HARDCODING - Always count actual files in S3
    
    Args:
        client_ip: Client IP address
        override_number: Override session number (1, 2, 3, etc.)
        file_type: 'card', 'print', 'video'
        
    Returns:
        Next card number (1, 2, 3, etc.)
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Determine folder based on file type
        folder_map = {
            'card': 'cards',
            'print': 'print-queue', 
            'video': 'videos'
        }
        folder = folder_map.get(file_type, 'cards')
        
        # Count existing files for this specific override session
        session_prefix = f"{client_ip}_override{override_number}_card_"
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'{folder}/{session_prefix}'
        )
        
        existing_count = len(response.get('Contents', []))
        next_card_number = existing_count + 1
        
        logger.info(f"📊 IP {client_ip} override{override_number} {file_type}: {existing_count} existing, next card #{next_card_number}")
        
        # Log existing files for debugging
        if response.get('Contents'):
            existing_files = [obj['Key'] for obj in response['Contents']]
            logger.info(f"📁 Existing files: {existing_files}")
        
        return next_card_number
        
    except Exception as e:
        logger.error(f"❌ Failed to get next card number: {str(e)}")
        return 1

def create_standard_filename(session_id: str, file_type: str, extension: str) -> tuple[str, str]:
    """
    Create standardized filename with DYNAMIC card numbering - NO HARDCODING
    
    Args:
        session_id: IP_override1, IP_override2, etc.
        file_type: 'card', 'print', 'video'  
        extension: 'png', 'mp4', etc.
        
    Returns:
        tuple: (filename, s3_key)
    """
    from datetime import datetime
    
    # Extract IP and override number from session_id
    parts = session_id.split('_override')
    if len(parts) != 2:
        logger.error(f"❌ Invalid session_id format: {session_id}")
        return f"error_{session_id}.{extension}", f"error/error_{session_id}.{extension}"
    
    client_ip = parts[0]
    override_number = int(parts[1])
    
    # Get next card number dynamically - NO HARDCODING
    next_card_number = get_next_card_number_for_session(client_ip, override_number, file_type)
    
    # Create filename with dynamic card number
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{session_id}_card_{next_card_number}_{timestamp}.{extension}"
    
    # Determine folder based on file type
    folder_map = {
        'card': 'cards',
        'print': 'print-queue', 
        'video': 'videos'
    }
    folder = folder_map.get(file_type, 'cards')
    
    s3_key = f"{folder}/{filename}"
    
    logger.info(f"📝 Created filename: {filename} (card #{next_card_number})")
    
    return filename, s3_key

def check_usage_limit_simplified(client_ip: str, generation_type: str, override_code: str = None) -> tuple[bool, str]:
    """
    Simplified usage check with proper base establishment
    
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
        current_base = get_current_override_number(client_ip)
        new_override_number = current_base + 1
        session_id = create_standard_session_id(client_ip, new_override_number)
        logger.info(f"🎁 Staff override applied - IP {client_ip}: override{current_base} → override{new_override_number}")
        logger.info(f"📝 New session ID: {session_id}")
        return True, session_id
    
    # Normal usage - establish correct base first
    current_base = get_current_override_number(client_ip)
    session_id = create_standard_session_id(client_ip, current_base)
    
    logger.info(f"🎯 Using established base for IP {client_ip}: override{current_base}")
    logger.info(f"📝 Session ID: {session_id}")
    
    # Check normal usage limits for the current base override session
    limits = load_limits()
    current_usage = get_usage_for_override_session(client_ip, current_base)
    current_count = current_usage.get(generation_type, 0)
    limit = limits.get(generation_type, 5)
    
    logger.info(f"📊 Usage check - IP: {client_ip}, Base: override{current_base}, Type: {generation_type}")
    logger.info(f"📊 Current count: {current_count}, Limit: {limit}, Allowed: {current_count < limit}")
    
    return current_count < limit, session_id

def get_usage_for_override_session(client_ip: str, override_number: int) -> Dict[str, int]:
    """Count files ONLY for specific override session - NOT all files for IP"""
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return {'cards': 0, 'videos': 0, 'prints': 0}
        
        # CRITICAL: Only count files for THIS specific override session
        session_prefix = f"{client_ip}_override{override_number}_"
        usage = {'cards': 0, 'videos': 0, 'prints': 0}
        
        logger.info(f"🔍 Counting usage ONLY for session: {session_prefix}")
        
        # Count cards ONLY for this override session
        cards_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'cards/{session_prefix}'
        )
        cards_count = len(cards_response.get('Contents', []))
        usage['cards'] = cards_count
        
        # Count videos ONLY for this override session
        videos_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'videos/{session_prefix}'
        )
        videos_count = len(videos_response.get('Contents', []))
        usage['videos'] = videos_count
        
        # Count prints ONLY for this override session
        prints_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'print-queue/{session_prefix}'
        )
        prints_count = len(prints_response.get('Contents', []))
        usage['prints'] = prints_count
        
        logger.info(f"📊 IP {client_ip} override{override_number} ISOLATED usage: {usage}")
        logger.info(f"🔍 Searched for prefix: {session_prefix}")
        
        # Log actual files found for debugging
        if cards_response.get('Contents'):
            logger.info(f"📁 Found cards: {[obj['Key'] for obj in cards_response['Contents']]}")
        if videos_response.get('Contents'):
            logger.info(f"📁 Found videos: {[obj['Key'] for obj in videos_response['Contents']]}")
        if prints_response.get('Contents'):
            logger.info(f"📁 Found prints: {[obj['Key'] for obj in prints_response['Contents']]}")
        
        return usage
        
    except Exception as e:
        logger.error(f"❌ Failed to get usage for IP {client_ip} override{override_number}: {str(e)}")
        return {'cards': 0, 'videos': 0, 'prints': 0}

def get_remaining_usage_simplified(client_ip: str) -> Dict[str, int]:
    """Get remaining usage for current base override session"""
    limits = load_limits()
    
    # Establish correct base first
    current_base = get_current_override_number(client_ip)
    current_usage = get_usage_for_override_session(client_ip, current_base)
    
    logger.info(f"🎯 Calculating remaining usage for IP {client_ip} base override{current_base}")
    
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
    
    logger.info(f"📊 IP {client_ip} override{current_base} remaining: {remaining}")
    logger.info(f"📊 Used: cards={cards_used}, videos={videos_used}, prints={prints_used}")
    
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
        # TRADING CARD GENERATION WITH AUTOMATIC OVERRIDE DETECTION
        # ========================================
        if action == 'transform_card':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            logger.info(f"🎴 Card generation request - IP: {client_ip}")
            
            # Extract override code from request body if provided
            override_code = body.get('override_code')
            
            # ALWAYS use the current highest override number for this IP
            # This ensures after staff override, cards automatically use new override session
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"🎯 Using current override session: {session_id_for_files}")
            
            # Check usage limits for the current override session
            allowed, _ = check_usage_limit_simplified(client_ip, 'cards', override_code)
            
            if not allowed:
                return create_error_response(
                    f"Limit reached. Please visit the event staff at SnapMagic to assist.", 
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
                        'session_id': session_id_for_files,  # Current override session
                        'client_ip': client_ip  # For debugging
                    })
                else:
                    return create_error_response(f"Generation failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"Card generation error: {str(e)}")
                return create_error_response(f"Card generation failed: {str(e)}", 500)
        
        # ========================================
        # STORE FINAL CARD - USE CURRENT OVERRIDE AND CLEAR PENDING
        # ========================================
        elif action == 'store_final_card':
            username = token_payload.get('username', 'unknown')
            
            final_card_base64 = body.get('final_card_base64', '')
            prompt = body.get('prompt', '')
            user_name = body.get('user_name', '')
            
            if not final_card_base64:
                return create_error_response("Missing final_card_base64 parameter", 400)
            
            try:
                # Get client IP
                request_headers = event.get('headers', {})
                client_ip = get_client_ip(request_headers)
                
                # Get current override number (includes pending override check)
                current_override = get_current_override_number(client_ip)
                session_id_for_files = create_standard_session_id(client_ip, current_override)
                
                logger.info(f"📁 Storing card in override session: {session_id_for_files}")
                
                # Clear pending override marker since we're now using it
                clear_pending_override(client_ip)
                
                # Decode and store using current override session
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
        # PRINT CARD WITH AUTOMATIC OVERRIDE DETECTION
        # ========================================
        elif action == 'print_card':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Get current override number (includes pending override check)
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"🖨️ Print request - using override session: {session_id_for_files}")
            
            # Check usage limits for current override session
            limits = load_limits()
            current_usage = get_usage_for_override_session(client_ip, current_override)
            current_count = current_usage.get('prints', 0)
            limit = limits.get('prints', 1)
            
            if current_count >= limit:
                return create_error_response(
                    f"Print limit reached. Please visit the event staff at SnapMagic to assist.", 
                    429
                )
            
            card_prompt = body.get('card_prompt', '')
            card_image_base64 = body.get('card_image', '')
            
            if not card_prompt:
                logger.error("❌ Missing card_prompt parameter")
                return create_error_response("Missing card_prompt parameter", 400)
                
            if not card_image_base64:
                logger.error("❌ Missing card_image parameter")
                return create_error_response("Missing card_image parameter - card image required for print queue", 400)
            
            try:
                # Store print record using current override session
                logger.info(f"🖨️ Print queue request - session: {session_id_for_files}, prompt: {card_prompt[:50]}...")
                
                # Clear pending override marker since we're now using it
                clear_pending_override(client_ip)
                
                # Get print queue number BEFORE storing (so it's accurate)
                print_queue_number = get_next_print_queue_number()
                
                # Create custom print filename with queue number
                import base64
                from datetime import datetime
                
                image_data = base64.b64decode(card_image_base64)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                
                # Extract card number from session_id if possible
                card_number = "1"  # Default
                try:
                    # If we can determine which card this is, use it
                    # For now, use default card_1 format
                    pass
                except:
                    pass
                
                # Create filename: IP_override1_card_1_print_3_TIMESTAMP.png
                print_filename = f"{session_id_for_files}_card_{card_number}_print_{print_queue_number}_{timestamp}.png"
                s3_key = f"print-queue/{print_filename}"
                
                # Store directly in S3 with custom filename
                import boto3
                s3_client = boto3.client('s3')
                bucket_name = os.environ.get('S3_BUCKET_NAME')
                
                if bucket_name:
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=s3_key,
                        Body=image_data,
                        ContentType='image/png',
                        Metadata={
                            'session_id': session_id_for_files,
                            'username': username,
                            'prompt': card_prompt[:100],
                            'print_queue_number': str(print_queue_number),
                            'card_number': card_number,
                            'file_type': 'print'
                        }
                    )
                    
                    result = {
                        'success': True,
                        'filename': print_filename,
                        's3_key': s3_key
                    }
                else:
                    result = {'success': False, 'error': 'S3 bucket not configured'}
                
                if result['success']:
                    # Get updated remaining usage
                    remaining = get_remaining_usage_simplified(client_ip)
                    
                    logger.info("✅ Card print stored successfully")
                    return create_success_response({
                        'success': True,
                        'message': f'Card saved for printing',
                        'print_filename': print_filename,
                        'print_number': str(print_queue_number),  # Queue position
                        'remaining': remaining,
                        'session_id': session_id_for_files,
                        'client_ip': client_ip,
                        'print_s3_key': s3_key
                    })
                else:
                    logger.error(f"❌ Failed to add card to print queue: {result.get('error')}")
                    return create_error_response(f"Print queue failed: {result.get('error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Print queue request exception: {str(e)}")
                return create_error_response(f"Print queue request failed: {str(e)}", 500)
        
        # ========================================
        # APPLY OVERRIDE - CREATE PENDING OVERRIDE MARKER
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
            
            logger.info(f"🔓 Staff override request from IP {client_ip}")
            
            # Get current highest override and increment
            current_base = get_current_override_number(client_ip)
            new_override_number = current_base + 1
            new_session_id = create_standard_session_id(client_ip, new_override_number)
            
            logger.info(f"🎁 Staff override applied for IP {client_ip}: override{current_base} → override{new_override_number}")
            
            # Create pending override marker so next card uses new override number
            try:
                import boto3
                s3_client = boto3.client('s3')
                bucket_name = os.environ.get('S3_BUCKET_NAME')
                
                if bucket_name:
                    # Create pending override marker
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=f'pending-overrides/{client_ip}_pending.txt',
                        Body=str(new_override_number).encode('utf-8'),
                        ContentType='text/plain',
                        Metadata={
                            'client_ip': client_ip,
                            'override_number': str(new_override_number),
                            'created_by': 'staff_override'
                        }
                    )
                    
                    logger.info(f"📝 Created pending override marker: override{new_override_number}")
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to create pending override marker: {str(e)}")
            
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
        
        # ========================================
        # VIDEO GENERATION WITH AUTOMATIC OVERRIDE DETECTION
        # ========================================
        elif action == 'generate_video':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Get current override number (includes pending override check)
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"🎬 Video generation request - using override session: {session_id_for_files}")
            
            # Check usage limits for current override session
            limits = load_limits()
            current_usage = get_usage_for_override_session(client_ip, current_override)
            current_count = current_usage.get('videos', 0)
            limit = limits.get('videos', 3)
            
            if current_count >= limit:
                return create_error_response(
                    f"Video limit reached. Please visit the event staff at SnapMagic to assist.", 
                    429
                )
            
            # Video generation parameters
            card_image_base64 = body.get('card_image', '')  # The generated card image
            prompt = body.get('animation_prompt', '')        # Frontend sends animation_prompt
            
            if not card_image_base64:
                return create_error_response("Missing card_image parameter - card image required for video generation", 400)
            
            if not prompt:
                return create_error_response("Missing animation_prompt parameter - video prompt required", 400)
            
            try:
                # Generate video using Nova Reel with card image + video prompt
                logger.info(f"🎬 Generating video from card image with prompt: {prompt[:50]}...")
                
                result = video_generator.generate_video_from_card(card_image_base64, prompt)
                
                if result['success']:
                    # Clear pending override marker since we're now using it
                    clear_pending_override(client_ip)
                    
                    # Store video in S3 with proper override naming if video data is available
                    video_base64 = result.get('video_base64')
                    if video_base64:
                        try:
                            # Get video number for this override session
                            parts = session_id_for_files.split('_override')
                            client_ip = parts[0]
                            override_number = int(parts[1])
                            video_number = get_next_video_number_for_session(client_ip, override_number)
                            
                            # Create video filename: IP_override1_card_1_video_2_TIMESTAMP.mp4
                            from datetime import datetime
                            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                            video_filename = f"{session_id_for_files}_card_1_video_{video_number}_{timestamp}.mp4"
                            s3_key = f"videos/{video_filename}"
                            
                            # Store video file directly in S3
                            import base64, boto3
                            video_bytes = base64.b64decode(video_base64)
                            s3_client = boto3.client('s3')
                            bucket_name = os.environ.get('S3_BUCKET_NAME')
                            
                            if bucket_name:
                                s3_client.put_object(
                                    Bucket=bucket_name,
                                    Key=s3_key,
                                    Body=video_bytes,
                                    ContentType='video/mp4',
                                    Metadata={
                                        'session_id': session_id_for_files,
                                        'username': username,
                                        'prompt': prompt[:100],
                                        'video_number': str(video_number),
                                        'file_type': 'video'
                                    }
                                )
                                
                                video_result = {'success': True, 's3_key': s3_key, 'filename': video_filename}
                                logger.info(f"✅ Video stored in S3: {s3_key}")
                            else:
                                video_result = {'success': False, 'error': 'S3 bucket not configured'}
                        except Exception as e:
                            logger.warning(f"⚠️ Video storage exception: {str(e)}")
                            video_result = {'success': False, 'error': str(e)}
                    
                    # Get updated remaining usage
                    remaining = get_remaining_usage_simplified(client_ip)
                    
                    logger.info("✅ Video generation successful")
                    return create_success_response({
                        'success': True,
                        'message': 'Video generation started successfully',
                        'result': result.get('video_base64'),  # Frontend expects this
                        'video_url': result.get('video_url'),  # Frontend expects this
                        'remaining': remaining,
                        'session_id': session_id_for_files,
                        'client_ip': client_ip,
                        'video_stored': video_result.get('success', False) if video_base64 else False,
                        'video_s3_key': video_result.get('s3_key') if video_base64 and video_result.get('success') else None,
                        'metadata': {
                            'video_id': result.get('video_id'),
                            'invocation_arn': result.get('invocation_arn'),
                            'animation_prompt': prompt,
                            'status': result.get('status'),
                            'estimated_time': result.get('estimated_time'),
                            'timestamp': result.get('timestamp')
                        }
                    })
                else:
                    return create_error_response(f"Video generation failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Video generation exception: {str(e)}")
                return create_error_response(f"Video generation failed: {str(e)}", 500)
        
        # ========================================
        # GET VIDEO STATUS (ASYNC VIDEO CHECKING)
        # ========================================
        elif action == 'get_video_status':
            username = token_payload.get('username', 'unknown')
            invocation_arn = body.get('invocation_arn', '')
            
            if not invocation_arn:
                logger.error("❌ Missing invocation_arn parameter")
                return create_error_response("Missing invocation_arn parameter", 400)
            
            try:
                # Get client IP for tracking
                request_headers = event.get('headers', {})
                client_ip = get_client_ip(request_headers)
                
                # Check video status using video generator
                logger.info(f"🔍 Checking video status for ARN: {invocation_arn}")
                result = video_generator.get_video_status(invocation_arn)
                
                if result['success']:
                    # Store video in S3 with proper override naming if completed and has video data
                    video_base64 = result.get('video_base64')
                    if result.get('status') == 'completed' and video_base64:
                        try:
                            # Get current override session for storage
                            current_override = get_current_override_number(client_ip)
                            session_id_for_files = create_standard_session_id(client_ip, current_override)
                            
                            # Get video number for this override session
                            video_number = get_next_video_number_for_session(client_ip, current_override)
                            
                            # Create video filename: IP_override1_card_1_video_2_TIMESTAMP.mp4
                            from datetime import datetime
                            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                            video_filename = f"{session_id_for_files}_card_1_video_{video_number}_{timestamp}.mp4"
                            s3_key = f"videos/{video_filename}"
                            
                            # Store video file directly in S3
                            import base64, boto3
                            video_bytes = base64.b64decode(video_base64)
                            s3_client = boto3.client('s3')
                            bucket_name = os.environ.get('S3_BUCKET_NAME')
                            
                            if bucket_name:
                                s3_client.put_object(
                                    Bucket=bucket_name,
                                    Key=s3_key,
                                    Body=video_bytes,
                                    ContentType='video/mp4',
                                    Metadata={
                                        'session_id': session_id_for_files,
                                        'username': username,
                                        'video_number': str(video_number),
                                        'file_type': 'video'
                                    }
                                )
                                
                                video_result = {'success': True, 's3_key': s3_key}
                                logger.info(f"✅ Completed video stored in S3: {s3_key}")
                            else:
                                video_result = {'success': False, 'error': 'S3 bucket not configured'}
                        except Exception as e:
                            logger.warning(f"⚠️ Video storage exception in status check: {str(e)}")
                            video_result = {'success': False, 'error': str(e)}
                    
                    logger.info(f"✅ Video status check successful: {result.get('status')}")
                    return create_success_response({
                        'success': True,
                        'status': result.get('status'),
                        'video_base64': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'message': result.get('message'),
                        'invocation_arn': invocation_arn,
                        'client_ip': client_ip,
                        'video_stored': video_result.get('success', False) if video_base64 and result.get('status') == 'completed' else False
                    })
                else:
                    return create_error_response(f"Video status check failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Video status check exception: {str(e)}")
                return create_error_response(f"Video status check failed: {str(e)}", 500)
        
        # HEALTH CHECK ENDPOINT
        elif action == 'health':
            return create_success_response({
                'status': 'healthy',
                'service': 'SnapMagic AI - Trading Cards & Videos',
                'version': '5.0',
                'features': ['automatic_override_detection', 'dynamic_card_numbering', 'unified_logic'],
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
