"""
SnapMagic Lambda Handler - Trading Card Generation with Simplified Override System
STANDARD PATTERN: Always use IP_override1, IP_override2, etc. with timestamps
"""

import json
import logging
import os
from datetime import datetime
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


def get_current_card_number_for_session(client_ip: str, override_number: int) -> int:
    """
    Get the current (latest) card number for a specific override session
    This is used when creating videos to match the card that was just generated
    
    Args:
        client_ip: Client IP address
        override_number: Override session number (1, 2, 3, etc.)
        
    Returns:
        Current card number (the latest card that exists)
    """
    try:
        import boto3
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return 1
        
        # Count existing cards for this specific override session
        session_prefix = f"{client_ip}_override{override_number}_card_"
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'cards/{session_prefix}'
        )
        
        existing_count = len(response.get('Contents', []))
        current_card_number = existing_count if existing_count > 0 else 1
        
        logger.info(f"📊 Current card number for IP {client_ip} override{override_number}: {current_card_number}")
        
        return current_card_number
        
    except Exception as e:
        logger.error(f"❌ Failed to get current card number: {str(e)}")
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
    """Extract device ID from frontend for session identification"""
    # Use device ID as session identifier
    device_id = request_headers.get('X-Device-ID', request_headers.get('x-device-id', ''))
    
    if device_id:
        logger.info(f"📱 Using device ID: {device_id}")
        return device_id
    
    # If no device ID provided, generate a fallback
    logger.warning(f"⚠️ No device ID provided, generating fallback")
    import secrets
    import time
    fallback_id = f"fallback_{int(time.time())}_{secrets.token_hex(6)}"
    return fallback_id

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

def handle_generate_prompt(event):
    """Generate creative prompt using Nova Lite - exact GitHub implementation"""
    try:
        import boto3
        import json
        import random
        import os
        
        logger.info("🎨 Starting generate prompt")
        
        # Load seeds from file
        seeds_path = os.path.join(os.path.dirname(__file__), 'seeds.json')
        with open(seeds_path, 'r') as file:
            data = json.load(file)
        
        if 'seeds' not in data or not isinstance(data['seeds'], list):
            raise ValueError("Invalid seeds file format")
        
        # Pick random creative concept
        random_concept = random.choice(data['seeds'])
        logger.info(f"🎯 Selected concept: {random_concept[:50]}...")
        
        # Create enhancement prompt (exact GitHub template)
        enhancement_prompt = f"""
        Generate a creative image prompt that builds upon this concept: "{random_concept}"

        Requirements:
        - Create a new, expanded prompt without mentioning or repeating the original concept
        - Focus on vivid visual details and artistic elements
        - Keep the prompt under 1000 characters
        - Do not include any meta-instructions or seed references
        - Return only the new prompt text

        Response Format:
        [Just the new prompt text, nothing else]
        """
        
        # Use Converse API (like GitHub repo)
        bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        nova_lite_model = os.environ.get('NOVA_LITE_MODEL', 'amazon.nova-lite-v1:0')
        
        response = bedrock_client.converse(
            modelId=nova_lite_model,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": enhancement_prompt}]
                }
            ]
        )
        
        # Extract generated prompt
        generated_prompt = response['output']['message']['content'][0]['text'].strip()
        
        logger.info(f"✅ Generated prompt: {generated_prompt[:100]}...")
        
        return create_success_response({
            'success': True,
            'prompt': generated_prompt,
            'seed_used': random_concept
        })
        
    except Exception as bedrock_error:
        logger.error(f"❌ Bedrock error: {str(bedrock_error)}")
        # No fallbacks - return proper error with detailed reason
        error_message = f"AI prompt generation failed: {str(bedrock_error)}"
        if "throttling" in str(bedrock_error).lower():
            error_message += "\n\nReason: Amazon Bedrock is currently experiencing high demand. Please wait a moment and try again."
        elif "access" in str(bedrock_error).lower():
            error_message += "\n\nReason: Bedrock model access may not be properly configured. Please contact support."
        elif "quota" in str(bedrock_error).lower():
            error_message += "\n\nReason: Service quota exceeded. Please try again later or contact support."
        else:
            error_message += "\n\nReason: The AI service is temporarily unavailable. Please try again in a few moments."
        
        return create_error_response(error_message, 500)

def handle_optimize_prompt(event):
    """Optimize user's existing prompt using Nova Lite"""
    try:
        import boto3
        import json
        
        # Get request body
        body = json.loads(event.get('body', '{}'))
        user_prompt = body.get('user_prompt', '').strip()
        
        if not user_prompt:
            return create_error_response("Please provide a prompt to optimize", 400)
        
        logger.info(f"🔧 Optimizing prompt: {user_prompt[:50]}...")
        
        # Create optimization prompt template
        optimization_prompt = f"""
        Take this image prompt and enhance it to be more detailed, artistic, and visually compelling: "{user_prompt}"

        Requirements:
        - Keep the core concept and meaning intact
        - Add vivid visual details, artistic elements, and atmospheric descriptions
        - Enhance with lighting, color, texture, and composition details
        - Make it more specific and evocative
        - Keep under 1000 characters
        - Return only the enhanced prompt text

        Response Format:
        [Just the enhanced prompt text, nothing else]
        """
        
        # Use Converse API
        bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        nova_lite_model = os.environ.get('NOVA_LITE_MODEL', 'amazon.nova-lite-v1:0')
        
        response = bedrock_client.converse(
            modelId=nova_lite_model,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": optimization_prompt}]
                }
            ]
        )
        
        # Extract optimized prompt
        optimized_prompt = response['output']['message']['content'][0]['text'].strip()
        
        logger.info(f"✅ Optimized prompt: {optimized_prompt[:100]}...")
        
        return create_success_response({
            'success': True,
            'prompt': optimized_prompt,
            'original_prompt': user_prompt
        })
        
    except Exception as bedrock_error:
        logger.error(f"❌ Bedrock error: {str(bedrock_error)}")
        # No fallbacks - return proper error with detailed reason
        error_message = f"AI prompt optimization failed: {str(bedrock_error)}"
        if "throttling" in str(bedrock_error).lower():
            error_message += "\n\nReason: Amazon Bedrock is currently experiencing high demand. Please wait a moment and try again."
        elif "access" in str(bedrock_error).lower():
            error_message += "\n\nReason: Bedrock model access may not be properly configured. Please contact support."
        elif "quota" in str(bedrock_error).lower():
            error_message += "\n\nReason: Service quota exceeded. Please try again later or contact support."
        else:
            error_message += "\n\nReason: The AI optimization service is temporarily unavailable. Please try again in a few moments."
        
        return create_error_response(error_message, 500)


def handle_generate_animation_prompt(event):
    """Generate animation prompt from card image using Nova Lite"""
    try:
        import boto3
        import json
        import base64
        import os
        
        logger.info("🎬 Starting generate animation prompt from card")
        
        # Get request body
        body = json.loads(event.get('body', '{}'))
        
        # Try multiple possible field names for card image
        card_image_base64 = (
            body.get('card_image', '') or 
            body.get('image_base64', '') or 
            body.get('imageBase64', '') or 
            body.get('result', '')
        ).strip()
        
        original_prompt = body.get('original_prompt', '').strip()
        
        logger.info(f"🔍 Request body keys: {list(body.keys())}")
        logger.info(f"🖼️ Card image length: {len(card_image_base64)} characters")
        
        if not card_image_base64:
            logger.error(f"❌ No card image found in request body. Available keys: {list(body.keys())}")
            return create_error_response("Please provide a card image. Make sure you have generated a card first.", 400)
        
        logger.info(f"🔍 Analyzing card for animation prompt generation...")
        logger.info(f"📝 Original prompt: {original_prompt[:50]}...")
        
        # Create animation prompt generation template
        animation_prompt_template = """
        Analyze this trading card image and create an animation prompt for a 6-second video.

        Your task:
        1. Look at the trading card image and describe what you see
        2. Based ONLY on what you visually observe in the image, create an animation prompt
        3. Do NOT use any external context - only what is visible in the card

        CRITICAL Requirements:
        - Describe dynamic movements based on what you see in the card
        - Include visual effects that would bring this specific image to life
        - Keep the character/subject/elements consistent with what's shown in the card
        - Keep under 400 characters for video generation
        - Focus on motion and transformation of what you observe
        - Generate pure action descriptions without timing words

        Examples of good animation prompts:
        - "character steps forward with eyes glowing, magical energy swirling around them"
        - "figure emerges in 3D with dramatic lighting effects and particle bursts"
        - "eyes glow intensely while power aura expands outward with particle effects and energy waves"

        Response Format:
        [Just the action description based purely on what you see in the image, nothing else]
        """
        
        try:
            # Decode base64 image data for Nova Lite
            image_bytes = base64.b64decode(card_image_base64)
            logger.info(f"🖼️ Image decoded successfully, size: {len(image_bytes)} bytes")
            
            # Detect image format from header bytes
            image_format = "png"  # Default
            if image_bytes.startswith(b'\xff\xd8\xff'):
                image_format = "jpeg"
            elif image_bytes.startswith(b'\x89PNG'):
                image_format = "png"
            elif image_bytes.startswith(b'GIF'):
                image_format = "gif"
            elif image_bytes.startswith(b'RIFF') and b'WEBP' in image_bytes[:12]:
                image_format = "webp"
            
            logger.info(f"🎨 Detected image format: {image_format}")
            
        except Exception as decode_error:
            logger.error(f"❌ Failed to decode base64 image: {str(decode_error)}")
            logger.error(f"❌ Image data preview: {card_image_base64[:100]}...")
            return create_error_response("Invalid image data. Please ensure the card image is properly encoded.", 400)
        
        try:
            # Use Converse API with image
            bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
            nova_lite_model = os.environ.get('NOVA_LITE_MODEL', 'amazon.nova-lite-v1:0')
            
            logger.info(f"🤖 Calling Nova Lite model: {nova_lite_model}")
            logger.info(f"🖼️ Image bytes size: {len(image_bytes)}")
            
            response = bedrock_client.converse(
                modelId=nova_lite_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": animation_prompt_template
                            },
                            {
                                "image": {
                                    "format": image_format,
                                    "source": {
                                        "bytes": image_bytes
                                    }
                                }
                            }
                        ]
                    }
                ],
                inferenceConfig={
                    "maxTokens": 500,
                    "temperature": 0.7
                }
            )
            
            # Extract the animation prompt from response
            animation_prompt = response['output']['message']['content'][0]['text'].strip()
            logger.info(f"✅ Generated animation prompt: {animation_prompt[:100]}...")
            
        except Exception as bedrock_error:
            logger.error(f"❌ Bedrock error details: {str(bedrock_error)}")
            logger.error(f"❌ Error type: {type(bedrock_error).__name__}")
            
            # Check if it's a model access issue
            if "AccessDeniedException" in str(bedrock_error) or "ValidationException" in str(bedrock_error):
                logger.error("🚫 Nova Lite model access denied - check Bedrock model permissions")
                return create_error_response("Nova Lite model access not available. Please ensure Amazon Nova Lite model access is granted in AWS Bedrock console.", 400)
            
            # Fallback to simple prompt if Bedrock fails
            animation_prompt = "character steps forward with eyes glowing, magical energy swirling around them"
            logger.info("🔄 Using fallback animation prompt due to Bedrock error")
        
        return create_success_response({
            'success': True,
            'animation_prompt': animation_prompt,
            'original_prompt': original_prompt
        })
        
    except Exception as error:
        logger.error(f"❌ Animation prompt generation error: {str(error)}")
        return create_error_response("Failed to generate animation prompt. Please try again.", 500)

def handle_optimize_animation_prompt(event):
    """Optimize user's existing animation prompt using Nova Lite with card analysis"""
    try:
        import boto3
        import json
        import base64
        
        # Get request body
        body = json.loads(event.get('body', '{}'))
        user_prompt = body.get('user_prompt', '').strip()
        card_image_base64 = body.get('card_image', '').strip()
        original_prompt = body.get('original_prompt', '').strip()
        
        if not user_prompt:
            return create_error_response("Please provide an animation prompt to optimize", 400)
        
        logger.info(f"🔧 Optimizing animation prompt with card analysis...")
        logger.info(f"📝 User prompt: {user_prompt[:50]}...")
        logger.info(f"📝 Original card prompt: {original_prompt[:50]}...")
        
        # Create optimization prompt template that combines user prompt + card analysis
        if card_image_base64:
            # Decode base64 image data for Nova Lite
            try:
                image_bytes = base64.b64decode(card_image_base64)
                logger.info(f"🖼️ Image decoded for optimization, size: {len(image_bytes)} bytes")
            except Exception as decode_error:
                logger.error(f"❌ Failed to decode base64 image: {str(decode_error)}")
                raise ValueError("Invalid base64 image data")
            
            optimization_prompt = f"""
            Analyze this trading card image and optimize the user's animation idea for a 6-second video.

            User's animation idea: "{user_prompt}"

            Your task:
            1. Look at the trading card image and observe what you see
            2. Take the user's animation concept and enhance it based ONLY on what is visible in the card
            3. Do NOT use any external context - only combine the user's idea with what you observe in the image

            CRITICAL Requirements:
            - Enhance the user's animation concept with dynamic movement
            - Combines the user's animation idea with what you see in the card
            - Keeps the character/subject consistent with what's shown in the card image
            - Enhances the user's concept with specific visual details from what you observe
            - Adds dynamic visual effects, lighting, and movement details based on the card
            - Makes it more cinematic and engaging for 6-second video generation
            - Keeps under 400 characters for video generation
            - Focuses on motion and transformation
            - Generate pure action descriptions without timing words

            Response Format:
            [Just the enhanced action description based on the user's idea and what you see in the image, nothing else]
            """
            
            # Use Converse API with image
            bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
            nova_lite_model = os.environ.get('NOVA_LITE_MODEL', 'amazon.nova-lite-v1:0')
            
            logger.info(f"🤖 Calling Nova Lite for optimization with card analysis: {nova_lite_model}")
            
            response = bedrock_client.converse(
                modelId=nova_lite_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"text": optimization_prompt},
                            {
                                "image": {
                                    "format": "png",
                                    "source": {"bytes": image_bytes}
                                }
                            }
                        ]
                    }
                ]
            )
        else:
            # Text-only optimization when no image is provided
            optimization_prompt = f"""
            Take this animation prompt and enhance it for a 6-second video: "{user_prompt}"

            CRITICAL Requirements:
            - Enhance the animation concept with dynamic movement
            - Keep the core animation concept intact
            - Add visual effects, lighting, and movement details
            - Make it more cinematic and engaging for 6-second video
            - Focus on dynamic actions that work well in short video
            - Keep under 400 characters for video generation
            - Ensure it describes motion and transformation
            - Generate pure action descriptions without timing words

            Response Format:
            [Just the enhanced action description, nothing else]
            """
            
            # Use Converse API without image
            bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
            nova_lite_model = os.environ.get('NOVA_LITE_MODEL', 'amazon.nova-lite-v1:0')
            
            logger.info(f"🤖 Calling Nova Lite for text-only optimization: {nova_lite_model}")
            
            response = bedrock_client.converse(
                modelId=nova_lite_model,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": optimization_prompt}]
                    }
                ]
            )
        
        # Extract optimized animation prompt
        optimized_prompt = response['output']['message']['content'][0]['text'].strip()
        
        logger.info(f"✅ Optimized animation prompt: {optimized_prompt[:100]}...")
        
        return create_success_response({
            'success': True,
            'optimized_prompt': optimized_prompt,
            'original_prompt': user_prompt
        })
        
    except Exception as bedrock_error:
        logger.error(f"❌ Bedrock optimization error: {str(bedrock_error)}")
        logger.error(f"❌ Full error details: {repr(bedrock_error)}")
        # No fallbacks - return proper error with detailed reason
        error_message = f"AI animation prompt optimization failed: {str(bedrock_error)}"
        if "throttling" in str(bedrock_error).lower():
            error_message += "\n\nReason: Amazon Bedrock is currently experiencing high demand. Please wait a moment and try again."
        elif "access" in str(bedrock_error).lower():
            error_message += "\n\nReason: Bedrock model access may not be properly configured. Please contact support."
        elif "quota" in str(bedrock_error).lower():
            error_message += "\n\nReason: Service quota exceeded. Please try again later or contact support."
        else:
            error_message += "\n\nReason: The AI animation optimization service is temporarily unavailable. Please try again in a few moments."
        
        return create_error_response(error_message, 500)

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
            if body_action == 'login':
                action = 'login'
            elif body_action == 'generate_video':
                action = 'generate_video'
            elif body_action == 'get_video_status':
                action = 'get_video_status'
            elif body_action == 'apply_override':
                action = 'apply_override'
            elif body_action == 'enter_competition':
                action = 'enter_competition'
            elif body_action == 'load_session_cards':
                action = 'load_session_cards'
            elif body_action == 'load_card_base64':
                action = 'load_card_base64'
            elif body_action == 'load_session_videos':
                action = 'load_session_videos'
            elif body_action == 'generate_prompt':
                action = 'generate_prompt'
            elif body_action == 'optimize_prompt':
                action = 'optimize_prompt'
            elif body_action == 'generate_animation_prompt':
                action = 'generate_animation_prompt'
            elif body_action == 'optimize_animation_prompt':
                action = 'optimize_animation_prompt'
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
            try:
                username = body.get('username', '')
                password = body.get('password', '')
                
                logger.info(f"Login attempt for user: {username}")
                
                # Load event credentials from environment variables
                event_creds = load_event_credentials()
                logger.info(f"Loaded credentials for comparison")
                
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
            except Exception as login_error:
                logger.error(f"❌ Login function error: {str(login_error)}")
                logger.error(f"❌ Login error details: {repr(login_error)}")
                return create_error_response(f"Login system error: {str(login_error)}", 500)
        
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
            
            # Extract override code from request body if provided
            override_code = body.get('override_code')
            
            # Get current override number (includes pending override check)
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"🎬 Video generation request - using override session: {session_id_for_files}")
            
            # Check usage limits for current override session (SAME AS CARDS)
            allowed, _ = check_usage_limit_simplified(client_ip, 'videos', override_code)
            
            if not allowed:
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
                
                if result['success'] and result.get('status') == 'completed':
                    # Video is completed - store it with session-based filename
                    logger.info("✅ Video completed - storing with session-based filename...")
                    
                    # Get current override session for storage
                    current_override = get_current_override_number(client_ip)
                    session_id_for_files = create_standard_session_id(client_ip, current_override)
                    
                    # Get the current card number to match video to card
                    current_card_number = get_current_card_number_for_session(client_ip, current_override)
                    
                    storage_result = video_generator.store_video_with_session_filename(
                        invocation_arn, 
                        session_id_for_files, 
                        "Video generation", 
                        username,
                        current_card_number
                    )
                    
                    if storage_result['success']:
                        logger.info(f"✅ Video stored with session filename: {storage_result.get('session_s3_key')}")
                    else:
                        logger.warning(f"⚠️ Failed to store video with session filename: {storage_result.get('error')}")
                    
                    # Get updated remaining usage (same as generate_video endpoint)
                    remaining = get_remaining_usage_simplified(client_ip)
                    
                    logger.info(f"✅ Video status check successful: {result.get('status')}")
                    return create_success_response({
                        'success': True,
                        'status': result.get('status'),
                        'video_base64': result.get('video_base64'),
                        'video_url': result.get('video_url'),
                        'message': result.get('message'),
                        'remaining': remaining,  # Include remaining usage for frontend
                        'invocation_arn': invocation_arn,
                        'client_ip': client_ip,
                        'session_stored': storage_result.get('success', False),
                        'session_s3_key': storage_result.get('session_s3_key')
                    })
                elif result['success']:
                    return create_error_response(f"Video status check failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"❌ Video status check exception: {str(e)}")
                return create_error_response(f"Video status check failed: {str(e)}", 500)
        
        # ENTER COMPETITION ENDPOINT
        # ========================================
        elif action == 'enter_competition':
            username = token_payload.get('username', 'unknown')
            phone_number = body.get('phone_number', '').strip()
            card_data = body.get('card_data', {})
            
            # Validation
            if not phone_number:
                return create_error_response("Phone number is required", 400)
            
            if not card_data:
                return create_error_response("Card data is required", 400)
            
            try:
                # Check for duplicate phone number entries
                logger.info(f"🔍 Checking for duplicate phone number: {phone_number}")
                
                # Import boto3 and create S3 client
                import boto3
                s3_client = boto3.client('s3')
                bucket_name = os.environ.get('S3_BUCKET_NAME')
                
                # List all competition entries to check for duplicates
                try:
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix='competition/'
                    )
                    
                    if 'Contents' in response:
                        for obj in response['Contents']:
                            key = obj['Key']
                            # Check if phone number is in filename
                            if f"_phone_{phone_number}_" in key:
                                logger.info(f"❌ Duplicate phone number found: {phone_number}")
                                return create_error_response(
                                    "This phone number has already been entered in the competition. Please visit SnapMagic staff to re-enter.", 
                                    409
                                )
                except Exception as e:
                    logger.warning(f"⚠️ Could not check for duplicates: {str(e)}")
                
                # Get client IP using device ID system (same as other functions)
                request_headers = event.get('headers', {})
                client_ip = get_client_ip(request_headers)
                current_override = get_current_override_number(client_ip)
                current_card_number = get_current_card_number_for_session(client_ip, current_override)
                session_prefix = f"{client_ip}_override{current_override}"
                
                # Create timestamp for filename
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                
                # Extract the actual card image from card_data
                card_image_base64 = None
                
                # Try different possible locations for the card image data
                if card_data:
                    # Check for finalImageSrc (composed card with template)
                    if 'finalImageSrc' in card_data and card_data['finalImageSrc']:
                        image_src = card_data['finalImageSrc']
                        if image_src.startswith('data:image/png;base64,'):
                            card_image_base64 = image_src.split(',')[1]
                            logger.info("✅ Using finalImageSrc (composed card)")
                    
                    # Check for imageSrc (regular card image)
                    elif 'imageSrc' in card_data and card_data['imageSrc']:
                        image_src = card_data['imageSrc']
                        if image_src.startswith('data:image/png;base64,'):
                            card_image_base64 = image_src.split(',')[1]
                            logger.info("✅ Using imageSrc (regular card)")
                    
                    # Check for raw result (Nova Canvas output)
                    elif 'result' in card_data and card_data['result']:
                        card_image_base64 = card_data['result']
                        logger.info("✅ Using result (Nova Canvas output)")
                    
                    # Check nested result structure
                    elif 'result' in card_data and isinstance(card_data['result'], dict):
                        if 'image_data' in card_data['result']:
                            card_image_base64 = card_data['result']['image_data']
                            logger.info("✅ Using nested result.image_data")
                        elif 'result' in card_data['result']:
                            card_image_base64 = card_data['result']['result']
                            logger.info("✅ Using nested result.result")
                
                if not card_image_base64:
                    logger.error(f"❌ No card image found. Card data keys: {list(card_data.keys()) if card_data else 'None'}")
                    return create_error_response("No card image found to submit", 400)
                
                # Create competition filename using device ID format: device_abc123_override1_card_1_phone_1234567890_20250713_140000.png
                competition_filename = f"{session_prefix}_card_{current_card_number}_phone_{phone_number}_{timestamp}.png"
                competition_key = f"competition/{competition_filename}"
                
                # Store ONLY the card image in S3 competition folder
                import base64
                image_bytes = base64.b64decode(card_image_base64)
                
                s3_client.put_object(
                    Bucket=bucket_name,
                    Key=competition_key,
                    Body=image_bytes,
                    ContentType='image/png'
                )
                
                logger.info(f"✅ Competition card stored: {competition_key}")
                
                return create_success_response({
                    'success': True,
                    'message': 'Entry submitted successfully! Good luck in the competition!',
                    'entry_filename': competition_filename,
                    'timestamp': timestamp,
                    'phone_number': phone_number[:3] + '***' + phone_number[-2:] if len(phone_number) > 5 else '***',
                    'card_number': current_card_number,
                    'session_prefix': session_prefix
                })
                
            except Exception as e:
                logger.error(f"❌ Competition entry failed: {str(e)}")
                return create_error_response(f"Failed to submit competition entry: {str(e)}", 500)

        # ========================================
        # LOAD CARD BASE64 DATA ENDPOINT (NEW)
        # ========================================
        elif action == 'load_card_base64':
            username = token_payload.get('username', 'unknown')
            
            # Get card S3 key from request
            card_s3_key = body.get('s3_key')
            if not card_s3_key:
                return create_error_response("Missing s3_key parameter", 400)
            
            try:
                # Import boto3 and create S3 client
                import boto3
                s3_client = boto3.client('s3')
                bucket_name = os.environ.get('S3_BUCKET_NAME')
                
                if not bucket_name:
                    logger.error("❌ S3_BUCKET_NAME environment variable not set")
                    return create_error_response("S3 bucket not configured", 500)
                
                # Download the specific image from S3
                s3_object = s3_client.get_object(Bucket=bucket_name, Key=card_s3_key)
                image_data = s3_object['Body'].read()
                
                # Convert to base64
                import base64
                image_base64 = base64.b64encode(image_data).decode('utf-8')
                
                logger.info(f"✅ Loaded base64 data for {card_s3_key} ({len(image_base64)} chars)")
                
                return create_success_response({
                    'success': True,
                    'base64_data': image_base64,
                    's3_key': card_s3_key
                })
                
            except Exception as e:
                logger.error(f"❌ Error loading base64 for {card_s3_key}: {str(e)}")
                return create_error_response(f'Failed to load card base64: {str(e)}', 500)

        # ========================================
        # LOAD SESSION CARDS ENDPOINT
        # ========================================
        elif action == 'load_session_cards':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Get current override number - OUTSIDE try block so it's always available
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"📚 Loading ALL cards for device: {client_ip}")
            
            try:
                # Import boto3 and create S3 client
                import boto3
                s3_client = boto3.client('s3')
                bucket_name = os.environ.get('S3_BUCKET_NAME')
                
                if not bucket_name:
                    logger.error("❌ S3_BUCKET_NAME environment variable not set")
                    return create_error_response("S3 bucket not configured", 500)
                
                # List ALL cards for this device across ALL overrides
                cards_prefix = f"cards/{client_ip}_override"
                logger.info(f"🔍 Searching for ALL cards with prefix: {cards_prefix}")
                
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=cards_prefix
                )
                
                cards = []
                if 'Contents' in response:
                    # Sort by last modified (newest first)
                    sorted_objects = sorted(response['Contents'], key=lambda x: x['LastModified'], reverse=True)
                    
                    # SIMPLIFIED: Return all cards with URLs only, load base64 on-demand
                    max_total_cards = 20  # Increased limit since no base64 in response
                    processed_cards = 0
                    
                    for obj in sorted_objects:
                        if processed_cards >= max_total_cards:
                            break
                            
                        # Generate presigned URL for secure access (1 hour expiration)
                        try:
                            presigned_url = s3_client.generate_presigned_url(
                                'get_object',
                                Params={'Bucket': bucket_name, 'Key': obj['Key']},
                                ExpiresIn=3600  # 1 hour
                            )
                        except Exception as e:
                            logger.error(f"❌ Failed to generate presigned URL for {obj['Key']}: {str(e)}")
                            continue
                        
                        # Create card data - NO base64 data to keep response small
                        card_data = {
                            'finalImageSrc': presigned_url,
                            'imageSrc': presigned_url,
                            'result': None,  # Will be loaded on-demand
                            'novaImageBase64': None,  # Will be loaded on-demand
                            's3_key': obj['Key'],
                            'filename': obj['Key'].split('/')[-1],
                            'timestamp': obj['LastModified'].isoformat(),
                            'size': obj['Size'],
                            'needs_base64_loading': True  # Flag for frontend
                        }
                        cards.append(card_data)
                        processed_cards += 1
                
                logger.info(f"✅ Found {len(cards)} cards for session (base64 loaded on-demand for instant GIFs)")
                
                return create_success_response({
                    'success': True,
                    'cards': cards,
                    'session_id': session_id_for_files,
                    'total_cards': len(cards)
                })
                
            except Exception as e:
                logger.error(f"❌ Error loading session cards: {str(e)}")
                return create_error_response('Failed to load session cards', 500)

        # ========================================
        # LOAD SESSION VIDEOS ENDPOINT - EXACTLY LIKE CARDS
        # ========================================
        elif action == 'load_session_videos':
            username = token_payload.get('username', 'unknown')
            
            # Get client IP
            request_headers = event.get('headers', {})
            client_ip = get_client_ip(request_headers)
            
            # Get current override number
            current_override = get_current_override_number(client_ip)
            session_id_for_files = create_standard_session_id(client_ip, current_override)
            
            logger.info(f"🎬 Loading ALL videos for device: {client_ip}")
            
            try:
                # Import boto3 and create S3 client
                import boto3
                s3_client = boto3.client('s3')
                
                # Use video bucket instead of card bucket
                video_bucket_name = os.environ.get('VIDEO_BUCKET_NAME')
                
                if not video_bucket_name:
                    logger.error("❌ VIDEO_BUCKET_NAME environment variable not set")
                    return create_error_response("Video bucket not configured", 500)
                
                # List ALL videos for this device across ALL overrides (like cards)
                videos_prefix = f"videos/{client_ip}_override"
                logger.info(f"🔍 Searching for ALL videos with prefix: {videos_prefix}")
                
                response = s3_client.list_objects_v2(
                    Bucket=video_bucket_name,
                    Prefix=videos_prefix
                )
                
                videos = []
                if 'Contents' in response:
                    # Sort by last modified (newest first)
                    sorted_objects = sorted(response['Contents'], key=lambda x: x['LastModified'], reverse=True)
                    
                    for obj in sorted_objects:
                        # Generate presigned URL for secure access (1 hour expiration)
                        try:
                            presigned_url = s3_client.generate_presigned_url(
                                'get_object',
                                Params={'Bucket': video_bucket_name, 'Key': obj['Key']},
                                ExpiresIn=3600  # 1 hour
                            )
                        except Exception as e:
                            logger.error(f"❌ Failed to generate presigned URL for {obj['Key']}: {str(e)}")
                            continue
                        
                        # Extract video metadata from filename if possible
                        filename = obj['Key'].split('/')[-1]
                        
                        # Create video data compatible with frontend gallery
                        video_data = {
                            'video_url': presigned_url,
                            'videoUrl': presigned_url,  # Alias for compatibility
                            'finalVideoSrc': presigned_url,
                            's3_key': obj['Key'],
                            'filename': filename,
                            'timestamp': obj['LastModified'].isoformat(),
                            'size': obj['Size'],
                            'animation_prompt': 'Video from previous session',  # Default prompt
                            'success': True
                        }
                        videos.append(video_data)
                
                logger.info(f"✅ Found {len(videos)} videos for device across all sessions")
                
                return create_success_response({
                    'success': True,
                    'videos': videos,
                    'session_id': session_id_for_files,
                    'total': len(videos)
                })
                
            except Exception as e:
                logger.error(f"❌ Error loading videos for device: {str(e)}")
                return create_error_response('Failed to load videos', 500)

        # ========================================
        # GENERATE PROMPT ENDPOINT
        # ========================================
        elif action == 'generate_prompt':
            return handle_generate_prompt(event)

        # ========================================
        # OPTIMIZE PROMPT ENDPOINT
        # ========================================
        elif action == 'optimize_prompt':
            return handle_optimize_prompt(event)
        
        # GENERATE ANIMATION PROMPT FROM CARD
        # ========================================
        elif action == 'generate_animation_prompt':
            return handle_generate_animation_prompt(event)
        
        # OPTIMIZE ANIMATION PROMPT
        # ========================================
        elif action == 'optimize_animation_prompt':
            return handle_optimize_animation_prompt(event)

        # HEALTH CHECK ENDPOINT
        elif action == 'health':
            return create_success_response({
                'status': 'healthy',
                'service': 'SnapMagic AI - Trading Cards & Videos',
                'version': '5.0',
                'features': ['automatic_override_detection', 'dynamic_card_numbering', 'unified_logic', 'competition_entry', 'linkedin_sharing'],
                'timestamp': '2025-07-13T13:00:00Z'
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
    """Create standardized success response with comprehensive CORS headers"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token,X-Device-ID,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps(data)
    }

def create_error_response(message, status_code):
    """Create standardized error response with comprehensive CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token,X-Device-ID,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps({
            'success': False,
            'error': message,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })
    }

def create_cors_response():
    """Handle CORS preflight requests with comprehensive headers"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token,X-Device-ID,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps({'message': 'CORS preflight successful'})
    }
