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
                'hair_color': [],
                'hair_style': [],
                'facial_accessories': [],
                'jewelry': [],
                'head_accessories': []
            }
            
            for label in label_response['Labels']:
                label_name = label['Name'].lower()
                confidence = label['Confidence']
                
                head_wear_keywords = ['hat', 'cap', 'helmet', 'headband', 'bandana', 'beanie', 'beret']
                for keyword in head_wear_keywords:
                    if keyword in label_name and confidence > 70:
                        features['head_wear'].append(label['Name'])
                        break
                
                eye_accessories = ['glasses', 'sunglasses', 'eyeglasses', 'spectacles', 'goggles']
                for keyword in eye_accessories:
                    if keyword in label_name and confidence > 75:
                        features['facial_accessories'].append(label['Name'])
                        break
                
                jewelry_keywords = ['earring', 'earrings', 'necklace', 'chain', 'pendant']
                for keyword in jewelry_keywords:
                    if keyword in label_name and confidence > 70:
                        features['jewelry'].append(label['Name'])
                        break
                
                hair_colors = ['black hair', 'brown hair', 'blonde hair', 'gray hair', 'grey hair', 'white hair', 'red hair']
                for color in hair_colors:
                    if color in label_name and confidence > 70:
                        features['hair_color'].append(label['Name'])
                        break
                
                hair_styles = ['curly hair', 'straight hair', 'wavy hair', 'long hair', 'short hair', 'ponytail', 'braid', 'bun']
                for style in hair_styles:
                    if style in label_name and confidence > 70:
                        features['hair_style'].append(label['Name'])
                        break
            
            for key in ['head_wear', 'hair_color', 'hair_style', 'facial_accessories', 'jewelry', 'head_accessories']:
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
        
        prompt_parts = ["Full body Funko Pop figure head to toes"]
        
        prompt_parts.extend([
            "preserve original skin color",
            "keep ethnic characteristics"
        ])
        
        prompt_parts.extend([
            "show entire figure with legs feet visible",
            "complete standing pose not cropped"
        ])
        
        prompt_parts.extend([
            "standard Funko Pop head shape",
            "oversized round head",
            "large black dot eyes",
            "no nose small indentation"
        ])
        
        gender = mesh_data.get('gender', 'Unknown').lower()
        if gender == 'female':
            prompt_parts.extend([
                f"female corporate business dress in {branding['primary_color']} and {branding['secondary_color']} colors",
                f"professional {branding['company_name']} branded office attire",
                f"{branding['logo_description']} pin on dress lapel"
            ])
        else:
            prompt_parts.extend([
                f"male corporate business suit with {branding['primary_color']} tie",
                f"{branding['secondary_color']} suit jacket with {branding['logo_description']} on chest pocket",
                f"professional {branding['company_name']} branded formal attire"
            ])
        
        if gender == 'male':
            if mesh_data.get('has_beard'):
                prompt_parts.append("beard")
            if mesh_data.get('has_mustache'):
                prompt_parts.append("mustache")
        
        if mesh_data.get('has_smile'):
            prompt_parts.append("smile")
        
        if mesh_data.get('has_glasses'):
            prompt_parts.append("glasses")
        
        head_wear = mesh_data.get('head_wear', [])
        for item in head_wear:
            prompt_parts.append(f"{item.lower()}")
        
        facial_accessories = mesh_data.get('facial_accessories', [])
        for item in facial_accessories:
            prompt_parts.append(f"{item.lower()}")
        
        jewelry = mesh_data.get('jewelry', [])
        for item in jewelry:
            prompt_parts.append(f"{item.lower()}")
        
        hair_color = mesh_data.get('hair_color', [])
        for color in hair_color:
            prompt_parts.append(f"{color.lower()}")
        
        hair_style = mesh_data.get('hair_style', [])
        for style in hair_style:
            prompt_parts.append(f"{style.lower()}")
        
        prompt_parts.extend([
            "vinyl collectible style",
            "clean white background"
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
        
        # Load template image based on gender
        gender = mesh_data.get('gender', 'Unknown').lower()
        template_paths = []
        
        if gender == 'male':
            template_paths = [
                '/var/task/model/male.PNG',
                'model/male.PNG',
                './model/male.PNG'
            ]
        else:
            template_paths = [
                '/var/task/model/female.PNG',
                'model/female.PNG', 
                './model/female.PNG'
            ]
        
        # Try to load template image
        template_base64 = None
        for template_path in template_paths:
            try:
                with open(template_path, 'rb') as f:
                    template_bytes = f.read()
                template_bytes = self.resize_image_for_bedrock(template_bytes)
                template_base64 = base64.b64encode(template_bytes).decode('utf-8')
                logger.info(f"Template loaded from: {template_path}")
                break
            except Exception as e:
                logger.debug(f"Template path {template_path} failed: {e}")
                continue
        
        if not template_base64:
            logger.warning("No template found, continuing without template")
        
        seeds = [42, 999, 123, 777, 555]
        
        for seed in seeds:
            # Prioritize selfie for details, template for body structure
            reference_images = [base64.b64encode(mesh_data['validated_image_bytes']).decode('utf-8')]
            if template_base64:
                reference_images.append(template_base64)
            
            # Enhanced prompt to prioritize selfie details
            detailed_prompt = f"use first image for all facial details complexion makeup features, use second image only for complete body structure, {prompt}"
            
            request_body = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": detailed_prompt,
                    "images": reference_images,
                    "similarityStrength": 0.90
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
