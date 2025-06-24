"""
SnapMagic Lambda Handler - Clean FunkoPop Generator Integration
Integrates the CleanFunkoPopGenerator functionality with SnapMagic authentication
"""

import json
import logging
import boto3
import base64
import os
import time
from typing import Dict, Any
import threading
from auth_simple import SnapMagicAuthSimple

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class SnapMagicFunkoGenerator:
    """SnapMagic integration of CleanFunkoPopGenerator"""
    
    def __init__(self, region: str = "us-east-1", rate_limit_delay: float = 8.0):
        self.region = region
        self.rate_limit_delay = rate_limit_delay
        
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
        self.rekognition = boto3.client('rekognition', region_name=region)
        
        self.last_request_time = 0
        self.request_lock = threading.Lock()
        
        logger.info(f"🎯 SnapMagic FunkoPop Generator initialized")

    def resize_image_for_bedrock(self, image_bytes: bytes, max_pixels: int = 4194304) -> bytes:
        """Resize image to fit within Bedrock Nova Canvas pixel limits - simplified version"""
        try:
            # For now, just return the original image bytes
            # TODO: Add proper image resizing when Pillow is available
            logger.info(f"Image size: {len(image_bytes)} bytes (resize skipped - no Pillow)")
            return image_bytes
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            return image_bytes

    def comprehensive_rekognition_analysis(self, image_bytes: bytes) -> Dict[str, Any]:
        """Comprehensive Rekognition analysis"""
        try:
            image_bytes = self.resize_image_for_bedrock(image_bytes)
            
            face_response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            label_response = self.rekognition.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=100,
                MinConfidence=60
            )
            
            if not face_response['FaceDetails']:
                return {'success': False, 'error': 'No face detected'}
            
            face = face_response['FaceDetails'][0]
            
            features = {
                'gender': face.get('Gender', {}).get('Value', 'Unknown'),
                'age_range': f"{face['AgeRange']['Low']}-{face['AgeRange']['High']}",
                'has_beard': face.get('Beard', {}).get('Value', False),
                'has_mustache': face.get('Mustache', {}).get('Value', False),
                'has_smile': face.get('Smile', {}).get('Value', False),
                'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
                'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
                'head_wear': [],
                'skin_tone': [],
                'facial_hair_style': [],
                'hair_color': [],
                'hair_style': [],
                'facial_accessories': [],
                'jewelry': [],
                'head_accessories': []
            }
            
            for label in label_response['Labels']:
                label_name = label['Name'].lower()
                confidence = label['Confidence']
                
                # Comprehensive head wear detection - caps, beanies, hats, religious coverings
                head_wear_keywords = [
                    'hat', 'cap', 'baseball cap', 'beanie', 'knit cap', 'winter hat',
                    'fedora', 'cowboy hat', 'sun hat', 'bucket hat', 'snapback',
                    'hijab', 'headscarf', 'turban', 'bandana', 'headband',
                    'helmet', 'hard hat', 'beret', 'headwear', 'head covering'
                ]
                for keyword in head_wear_keywords:
                    if keyword in label_name and confidence > 70:
                        features['head_wear'].append(label['Name'])
                        break
                
                eye_accessories = ['glasses', 'sunglasses', 'eyeglasses', 'spectacles', 'goggles']
                for keyword in eye_accessories:
                    if keyword in label_name and confidence > 75:
                        features['facial_accessories'].append(label['Name'])
                        break
                
                # Gender-specific jewelry detection thresholds
                gender = features.get('gender', 'Unknown').lower()
                jewelry_confidence_threshold = 70 if gender == 'female' else 99  # Women: 70%, Men: 99%
                
                jewelry_keywords = ['earring', 'earrings', 'necklace', 'chain', 'pendant', 'bracelet', 'ring']
                for keyword in jewelry_keywords:
                    if keyword in label_name.lower() and confidence > jewelry_confidence_threshold:
                        # Additional check: avoid false positives from body parts
                        if not any(body_part in label_name.lower() for body_part in ['ear', 'face', 'head', 'neck', 'skin', 'person', 'human']):
                            features['jewelry'].append(label['Name'])
                            break
                
                # Comprehensive facial hair detection - actual texture and style
                facial_hair_types = [
                    'beard', 'mustache', 'goatee', 'soul patch', 'sideburns',
                    'full beard', 'stubble', 'five o\'clock shadow', 'clean shaven',
                    'afro beard', 'curly beard', 'straight beard', 'thick beard', 'thin beard'
                ]
                for hair_type in facial_hair_types:
                    if hair_type in label_name and confidence > 60:
                        features['facial_hair_style'].append(label['Name'])
                
                # Comprehensive skin tone detection from Rekognition labels
                skin_tones = [
                    'dark skin', 'light skin', 'fair skin', 'pale skin', 'tan skin',
                    'olive skin', 'brown skin', 'black skin', 'white skin',
                    'medium skin', 'deep skin', 'rich skin', 'golden skin'
                ]
                for tone in skin_tones:
                    if tone in label_name and confidence > 60:
                        features['skin_tone'].append(label['Name'])
                
                # Comprehensive hair color detection - what Rekognition actually sees
                hair_colors = [
                    'black hair', 'brown hair', 'blonde hair', 'blond hair', 
                    'gray hair', 'grey hair', 'white hair', 'red hair', 'ginger hair',
                    'auburn hair', 'dark hair', 'light hair', 'silver hair'
                ]
                for color in hair_colors:
                    if color in label_name and confidence > 60:  # Lower threshold for better detection
                        features['hair_color'].append(label['Name'])
                        break
                
                # Comprehensive hair style and texture detection - EXACTLY what we see
                hair_styles = [
                    # Texture types
                    'curly hair', 'straight hair', 'wavy hair', 'kinky hair', 'coily hair',
                    'afro hair', 'afro', 'natural hair', 'textured hair', 'frizzy hair',
                    # Length types  
                    'long hair', 'short hair', 'medium hair', 'shoulder length hair',
                    # Styles
                    'ponytail', 'braid', 'braids', 'bun', 'top knot', 'man bun',
                    'dreadlocks', 'locs', 'cornrows', 'twist', 'twists',
                    # Cuts and styles
                    'buzz cut', 'crew cut', 'fade', 'undercut', 'mohawk',
                    'bob', 'pixie cut', 'layers', 'bangs', 'fringe',
                    # Conditions
                    'bald', 'balding', 'receding hairline', 'thinning hair',
                    # Styling
                    'slicked back', 'combed', 'messy hair', 'tousled hair',
                    'side part', 'center part', 'no part'
                ]
                for style in hair_styles:
                    if style in label_name and confidence > 60:  # Lower threshold for better detection
                        features['hair_style'].append(label['Name'])
                        # Don't break - allow multiple hair characteristics
            
            for key in ['head_wear', 'skin_tone', 'facial_hair_style', 'hair_color', 'hair_style', 'facial_accessories', 'jewelry', 'head_accessories']:
                features[key] = list(dict.fromkeys(features[key]))[:3]
            
            features['validated_image_bytes'] = image_bytes
            
            return {'success': True, 'mesh_data': features}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def create_aws_branded_prompt(self, mesh_data: Dict[str, Any]) -> str:
        """Create AWS branded prompt"""
        
        try:
            # Try different possible paths for the config file
            config_paths = [
                '/var/task/funko_config.json',
                'funko_config.json',
                './funko_config.json'
            ]
            
            config = None
            for path in config_paths:
                try:
                    with open(path, 'r') as f:
                        config = json.load(f)
                    break
                except FileNotFoundError:
                    continue
            
            if config:
                branding = config['event_branding']
            else:
                branding = {
                    'company_name': 'AWS',
                    'primary_color': 'orange',
                    'secondary_color': 'black',
                    'logo_description': 'AWS logo'
                }
        except Exception as e:
            logger.warning(f"Config loading failed: {e}, using defaults")
            branding = {
                'company_name': 'AWS',
                'primary_color': 'orange',
                'secondary_color': 'black',
                'logo_description': 'AWS logo'
            }
        
        # SIMPLIFIED CRYSTAL CLEAR PROMPT - NO template references at all
        prompt_parts = [
            "Create a professional Funko Pop figure of the person in the reference image",
            "HAIR TEXTURE CRITICAL - Look at the reference image and identify the hair type:",
            "- If hair appears TEXTURED, KINKY, COILY, or AFRO-STYLE: Create textured afro hair on the Funko Pop",
            "- If hair appears STRAIGHT: Create straight hair on the Funko Pop", 
            "- If hair appears CURLY or WAVY: Create curly/wavy hair on the Funko Pop",
            "- If hair appears BRAIDED, LOCS, or TWISTED: Create that exact style",
            "- If person appears BALD or VERY SHORT hair: Create bald or very short hair",
            "NEVER default to slicked-back businessman hair - match the actual hair texture visible",
            "Copy the EXACT hair color shown in the photo",
            "Copy the EXACT skin tone as it appears",
            "Copy any head coverings if present (caps, beanies, hats, hijabs, etc.)",
            "Copy facial hair exactly as shown (beard, mustache, clean shaven)",
            "Copy facial expressions and features as visible"
        ]
        
        # Remove ALL template references - clean prompt
        prompt_parts.extend([
            "Full body Funko Pop figure from head to toes",
            "Oversized round head with large black dot eyes",
            "No nose, just small indentation", 
            "Complete standing pose showing legs and feet",
            "Standard Funko Pop proportions and vinyl style"
        ])
        
        # Corporate styling
        gender = mesh_data.get('gender', 'Unknown').lower()
        if gender == 'female':
            prompt_parts.extend([
                f"Female corporate business dress in {branding['primary_color']} and {branding['secondary_color']}",
                f"Professional {branding['company_name']} office attire",
                f"{branding['logo_description']} pin on dress"
            ])
        else:
            prompt_parts.extend([
                f"Male corporate business suit with {branding['primary_color']} tie",
                f"{branding['secondary_color']} suit with {branding['logo_description']} on chest",
                f"Professional {branding['company_name']} business attire"
            ])
        
        # Final requirements
        prompt_parts.extend([
            "High quality vinyl collectible appearance",
            "Clean white background",
            "Professional product photography"
        ])
        
        prompt = ", ".join(prompt_parts)
        return prompt

    def rate_limited_bedrock_call(self, request_body: Dict[str, Any]) -> Dict[str, Any]:
        """Rate limited Bedrock call"""
        
        with self.request_lock:
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.rate_limit_delay:
                sleep_time = self.rate_limit_delay - time_since_last
                logger.info(f"Rate limiting: sleeping {sleep_time:.2f}s")
                time.sleep(sleep_time)
            self.last_request_time = time.time()
        
        try:
            response = self.bedrock_runtime.invoke_model(
                modelId="amazon.nova-canvas-v1:0",
                body=json.dumps(request_body)
            )
            
            response_body = json.loads(response['body'].read())
            
            if 'images' in response_body and response_body['images']:
                return {'success': True, 'image': response_body['images'][0]}
            else:
                return {'success': False, 'error': 'No image in response'}
                
        except Exception as e:
            error_str = str(e)
            if 'throttling' in error_str.lower() or 'rate' in error_str.lower():
                time.sleep(10)
            return {'success': False, 'error': error_str}

    def generate_funko_pop(self, image_bytes: bytes) -> Dict[str, Any]:
        """Generate Funko Pop from image bytes"""
        
        analysis_result = self.comprehensive_rekognition_analysis(image_bytes)
        
        if not analysis_result['success']:
            return analysis_result
        
        mesh_data = analysis_result['mesh_data']
        prompt = self.create_aws_branded_prompt(mesh_data)
        
        # COMPLETELY REMOVE ALL TEMPLATE LOGIC - 100% template-free
        logger.info("Template system completely disabled - using only selfie reference for 100% accurate appearance")
        
        seeds = [42, 999, 123, 777, 555]
        
        for seed in seeds:
            # Use ONLY the selfie - absolutely no template interference
            reference_images = [base64.b64encode(mesh_data['validated_image_bytes']).decode('utf-8')]
            
            # ULTRA-EXPLICIT hair texture detection prompt
            detailed_prompt = f"""Create a professional Funko Pop vinyl collectible figure of the person in the reference image.

HAIR TEXTURE ANALYSIS CRITICAL:
Examine the person's hair in the reference image very carefully:
- If you see TEXTURED, KINKY, COILY, AFRO, or NATURAL BLACK HAIR: Create a Funko Pop with short textured afro-style hair
- If you see STRAIGHT hair: Create straight hair on the Funko Pop
- If you see CURLY or WAVY hair: Create curly/wavy hair on the Funko Pop
- If you see BRAIDS, LOCS, DREADLOCKS: Create that exact braided/loc style
- If the person is BALD or has VERY SHORT hair: Create bald or very short hair

ABSOLUTELY CRITICAL: Do NOT default to slicked-back businessman hair. Look at the actual hair texture in the image and match it exactly.

APPEARANCE REQUIREMENTS:
- Hair color: Copy exactly from reference image
- Skin tone: Copy exactly from reference image (brown, tan, dark, light, etc.)
- Facial hair: Copy exactly (beard, mustache, clean shaven)
- Head coverings: Include if present (caps, beanies, hats, hijabs)

FUNKO POP STRUCTURE REQUIREMENTS:
- Full body figure from head to toes (complete standing pose)
- Oversized round head (40% of total height)
- Large solid black dot eyes, no pupils
- No nose - just small indented area
- Small body with short arms and legs
- Stable standing base
- Professional vinyl collectible finish

{prompt}

FINAL REMINDER: Match the person's ACTUAL hair texture from the image - textured afro hair should look textured, not slicked back."""
- Copy the EXACT hair texture, style, and color from the reference image (afro, straight, curly, kinky, coily, braided, etc.)
- Copy the EXACT skin tone as it appears in the reference image
- Copy facial hair exactly as shown (beard, mustache, clean shaven)
- Copy any head coverings if present (caps, beanies, hats, etc.)

FUNKO POP STRUCTURE REQUIREMENTS:
- Full body figure from head to toes (complete standing pose)
- Oversized round head (approximately 40% of total figure height)
- Large solid black dot eyes (no pupils, no iris details)
- No nose - just small indented area where nose would be
- Small simple mouth (line or small opening)
- Proportionally small body compared to oversized head
- Short arms and legs in classic Funko Pop proportions
- Flat base/feet for standing stability
- Vinyl collectible toy appearance with smooth surfaces

BODY STRUCTURE DETAILS:
- Head: Large, round, slightly wider than tall
- Neck: Very short or barely visible
- Torso: Rectangular, smaller than head
- Arms: Short, positioned at sides or slightly forward
- Legs: Short, thick, stable stance
- Overall height ratio: Head 40%, Body 35%, Legs 25%

{prompt}

FINAL REQUIREMENTS:
- Complete figure visible from head to toes
- Professional vinyl toy finish
- Clean white background
- High quality collectible appearance
- Maintain person's actual appearance while using Funko Pop proportions"""
            
            request_body = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": detailed_prompt,
                    "images": reference_images,
                    "similarityStrength": 0.95
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "quality": "premium",
                    "width": 1024,
                    "height": 1024,
                    "cfgScale": 8.5,
                    "seed": seed
                }
            }
            
            result = self.rate_limited_bedrock_call(request_body)
            
            if result['success']:
                return {
                    'success': True,
                    'image_base64': result['image'],
                    'seed_used': seed,
                    'gender': mesh_data.get('gender'),
                    'age_range': mesh_data.get('age_range'),
                    'prompt_used': detailed_prompt
                }
        
        return {'success': False, 'error': 'All seeds failed'}

# Global generator instance
funko_generator = SnapMagicFunkoGenerator()

def lambda_handler(event, context):
    """
    SnapMagic Lambda Handler with CleanFunkoPopGenerator functionality
    Maintains authentication system while replacing business logic
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
        elif '/api/transform-image' in request_path:
            action = 'transform_image'
        elif '/api/generate-video' in request_path:
            action = 'generate_video'
        elif '/health' in request_path:
            action = 'health'
        else:
            action = body.get('action', '').lower()
        
        logger.info(f"🎯 Processing action: {action} from path: {request_path}")
        
        # Login endpoint (no authentication required)
        if action == 'login':
            username = body.get('username', '')
            password = body.get('password', '')
            
            logger.info(f"Login attempt for user: {username}")
            
            if username == 'demo' and password == 'demo':
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
        
        # All other endpoints require authentication
        auth_header = event.get('headers', {}).get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return create_error_response("Missing authorization header", 401)
        
        token = auth_header.replace('Bearer ', '')
        auth_handler = SnapMagicAuthSimple()
        is_valid, token_payload = auth_handler.validate_token(token)
        
        if not is_valid or not token_payload:
            return create_error_response("Invalid or expired token", 401)
        
        logger.info(f"✅ Authenticated user: {token_payload.get('username')}")
        
        # Handle FunkoPop generation
        if action == 'transform_image' or action == 'generate_funko':
            image_base64 = body.get('image_base64', '')
            if not image_base64:
                return create_error_response("Missing image_base64 parameter", 400)
            
            try:
                # Decode base64 image
                image_bytes = base64.b64decode(image_base64)
                
                # Generate FunkoPop
                result = funko_generator.generate_funko_pop(image_bytes)
                
                if result['success']:
                    # Return the image in the format the frontend expects
                    return create_success_response({
                        'success': True,
                        'message': 'FunkoPop generated successfully',
                        'result': result['image_base64'],  # Frontend expects result to be the base64 image
                        'metadata': {
                            'seed_used': result.get('seed_used'),
                            'gender': result.get('gender'),
                            'age_range': result.get('age_range')
                        }
                    })
                else:
                    return create_error_response(f"Generation failed: {result.get('error', 'Unknown error')}", 500)
                    
            except Exception as e:
                logger.error(f"Image processing error: {str(e)}")
                return create_error_response(f"Image processing failed: {str(e)}", 500)
        
        # Health check endpoint
        elif action == 'health':
            return create_success_response({
                'status': 'healthy',
                'service': 'SnapMagic FunkoPop Generator',
                'timestamp': '2025-06-24T17:00:00Z'
            })
        
        else:
            return create_error_response(f"Unknown action: {action}", 400)
            
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Internal server error: {str(e)}", 500)

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
            'timestamp': '2025-06-24T17:00:00Z'
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
