"""
SnapMagic Lambda Handler - Face Mesh Action Figure Version
Uses Rekognition face mesh data to generate accurate action figures with Nova Canvas
"""

import json
import logging
import boto3
import base64
import os
from typing import Dict, Any
from auth_simple import SnapMagicAuthSimple

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
rekognition = boto3.client('rekognition', region_name='us-east-1')

def extract_face_mesh_data(image_base64: str) -> Dict[str, Any]:
    """Extract detailed face mesh and features using Rekognition + skin tone analysis"""
    try:
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
            
        image_bytes = base64.b64decode(image_base64)
        
        response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        if not response['FaceDetails']:
            logger.warning("No face detected in image")
            return {'success': False, 'error': 'No face detected'}
        
        face = response['FaceDetails'][0]
        
        # Get comprehensive label analysis for skin tone detection
        label_response = rekognition.detect_labels(
            Image={'Bytes': image_bytes},
            MaxLabels=100,
            MinConfidence=40  # Lower threshold to catch skin tone descriptors
        )
        
        # Extract skin tone descriptors from labels
        skin_tone_descriptors = []
        complexion_hints = []
        
        for label in label_response['Labels']:
            label_name = label['Name'].lower()
            confidence = label['Confidence']
            
            # Look for skin tone and complexion descriptors
            if any(word in label_name for word in ['brown', 'tan', 'dark', 'light', 'olive', 'fair', 'medium', 'pale', 'deep']):
                if confidence > 50:
                    skin_tone_descriptors.append(f"{label['Name']}")
            
            # Look for ethnic/regional descriptors that indicate complexion
            if any(word in label_name for word in ['indian', 'south asian', 'asian', 'african', 'european', 'middle eastern', 'hispanic', 'latino']):
                if confidence > 40:
                    complexion_hints.append(f"{label['Name']}")
        
        # Extract comprehensive features
        mesh_data = {
            'gender': face.get('Gender', {}).get('Value', 'Unknown'),
            'gender_confidence': face.get('Gender', {}).get('Confidence', 0),
            'age_range': f"{face['AgeRange']['Low']}-{face['AgeRange']['High']}",
            'age_midpoint': (face['AgeRange']['Low'] + face['AgeRange']['High']) // 2,
            'has_beard': face.get('Beard', {}).get('Value', False),
            'has_mustache': face.get('Mustache', {}).get('Value', False),
            'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
            'has_smile': face.get('Smile', {}).get('Value', False),
            'eyes_open': face.get('EyesOpen', {}).get('Value', True),
            'mouth_open': face.get('MouthOpen', {}).get('Value', False),
            'landmarks_count': len(face.get('Landmarks', [])),
            'skin_tone_descriptors': skin_tone_descriptors,
            'complexion_hints': complexion_hints
        }
        
        logger.info(f"🔍 Face mesh extracted: {mesh_data['gender']} ({mesh_data['gender_confidence']:.1f}%), "
                   f"Age: {mesh_data['age_range']}, Features: {[k for k, v in mesh_data.items() if k.startswith('has_') and v]}")
        logger.info(f"🎨 Skin tone descriptors: {skin_tone_descriptors}")
        logger.info(f"🌍 Complexion hints: {complexion_hints}")
        
        return {'success': True, 'mesh_data': mesh_data}
        
    except Exception as e:
        logger.error(f"Face mesh extraction failed: {str(e)}")
        return {'success': False, 'error': str(e)}

def create_mesh_based_action_figure_prompt(mesh_data: Dict[str, Any]) -> str:
    """Create action figure prompt with blister pack packaging (1-5 variations)"""
    
    prompt_parts = ["Professional 3D action figure in blister pack packaging"]
    
    # CRITICAL: Skin tone preservation
    skin_tone_descriptors = mesh_data.get('skin_tone_descriptors', [])
    complexion_hints = mesh_data.get('complexion_hints', [])
    
    # Build skin tone preservation
    skin_preservation = []
    
    if skin_tone_descriptors:
        if skin_tone_descriptors:
            skin_preservation.append(f"maintain {skin_tone_descriptors[0].lower()} skin tone")
    
    if complexion_hints:
        if complexion_hints:
            skin_preservation.append(f"preserve {complexion_hints[0].lower()} complexion")
    
    # Essential skin preservation
    skin_preservation.extend([
        "preserve original skin color",
        "maintain natural complexion"
    ])
    
    # Add skin preservation
    prompt_parts.extend(skin_preservation)
    
    # Gender-specific styling with blister pack theme
    gender = mesh_data['gender'].lower()
    age_midpoint = mesh_data['age_midpoint']
    
    if gender == 'male':
        if age_midpoint < 30:
            prompt_parts.extend([
                "young professional businessman action figure",
                "business suit with tie",
                "professional male collectible figure"
            ])
        elif age_midpoint > 50:
            prompt_parts.extend([
                "executive businessman action figure", 
                "premium business attire",
                "senior executive collectible figure"
            ])
        else:
            prompt_parts.extend([
                "professional businessman action figure",
                "business suit with tie", 
                "corporate executive collectible figure"
            ])
            
    elif gender == 'female':
        if age_midpoint < 30:
            prompt_parts.extend([
                "young professional businesswoman action figure",
                "professional business attire",
                "female executive collectible figure"
            ])
        elif age_midpoint > 50:
            prompt_parts.extend([
                "executive businesswoman action figure",
                "premium professional attire",
                "senior female executive collectible figure"
            ])
        else:
            prompt_parts.extend([
                "professional businesswoman action figure",
                "business professional attire",
                "female corporate executive collectible figure"
            ])
    
    # Add detected facial features with cartoon styling
    if mesh_data['has_beard']:
        prompt_parts.append("with stylized facial hair")
    if mesh_data['has_mustache']:
        prompt_parts.append("with cartoon mustache")
    if mesh_data['has_glasses']:
        prompt_parts.append("wearing professional glasses")
    if mesh_data['has_smile']:
        prompt_parts.append("with confident smile")
    
    # BLISTER PACK SPECIFICATIONS (key focus)
    prompt_parts.extend([
        "sealed in clear plastic blister pack",
        "professional toy packaging",
        "collectible action figure presentation",
        "retail blister pack display",
        "transparent plastic packaging",
        "cardboard backing with branding",
        "premium collectible packaging",
        "toy store quality presentation",
        "action figure blister pack design",
        "professional product packaging"
    ])
    
    # 3D cartoon quality specifications
    prompt_parts.extend([
        "3D cartoon action figure style",
        "high-quality toy figure rendering",
        "detailed facial features matching original",
        "cartoon proportions",
        "stylized but recognizable features",
        "premium toy quality",
        "collectible figure detail",
        "professional toy photography",
        "clean studio lighting"
    ])
    
    return ", ".join(prompt_parts)

def transform_image_mesh_approach(prompt: str, image_base64: str, username: str) -> str:
    """
    SnapMagic Face Mesh Action Figure Approach
    Uses Rekognition face mesh data for accurate action figure generation
    """
    try:
        logger.info(f"🎯 Using SnapMagic Face Mesh approach for user: {username}")
        
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Step 1: Extract face mesh data
        mesh_result = extract_face_mesh_data(image_base64)
        if not mesh_result['success']:
            logger.error(f"Face mesh extraction failed: {mesh_result['error']}")
            # Fallback to simple prompt
            mesh_prompt = "Professional 3D action figure, business professional, confident pose, high-quality rendering"
        else:
            mesh_data = mesh_result['mesh_data']
            mesh_prompt = create_mesh_based_action_figure_prompt(mesh_data)
            logger.info(f"📝 Generated mesh-based prompt: {mesh_prompt[:150]}...")
        
        # Step 2: Generate with Nova Canvas using blister pack optimized settings
        request_body = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": mesh_prompt,
                "images": [image_base64],
                "similarityStrength": 0.93  # Higher similarity for sample-quality facial preservation
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "premium",
                "width": 1024,
                "height": 1024,
                "cfgScale": 8.5,  # Balanced for blister pack details + facial preservation
                "seed": 42
            }
        }
        
        logger.info("🎨 Generating mesh-based action figure with Nova Canvas...")
        
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json"
        )
        
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            result_image = response_body['images'][0]
            logger.info("✅ Mesh-based action figure generation successful!")
            return result_image
        else:
            logger.error("No images returned from Nova Canvas")
            return ""
            
    except Exception as e:
        logger.error(f"Mesh action figure transformation failed: {str(e)}")
        return ""
        
        # EXACT WINNING REQUEST BODY - DO NOT CHANGE THESE VALUES
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": winning_prompt,
                "images": [image_base64],
                "similarityStrength": 0.95  # LOCKED WINNING VALUE
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "premium",  # LOCKED WINNING VALUE
                "width": 1024,
                "height": 1024,
                "cfgScale": 9.0,  # LOCKED WINNING VALUE
                "seed": 42  # LOCKED WINNING VALUE
            }
        }
        
        logger.info(f"🎨 Transforming with WINNING config: similarity=0.95, cfg=9.0, seed=42, quality=premium")
        
        # Call Nova Canvas with winning configuration
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload),
            contentType="application/json",
            accept="application/json"
        )
        
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            logger.info("✅ SnapMagic WINNING transformation completed successfully!")
            return response_body['images'][0]
        else:
            raise Exception("No transformed image returned from Nova Canvas")
            
    except Exception as e:
        logger.error(f"❌ SnapMagic WINNING transformation failed: {str(e)}")
        raise Exception(f"Winning transformation failed: {str(e)}")


# Helper functions for response formatting
def create_success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create successful response with CORS headers"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({
            'success': True,
            'timestamp': '2025-06-22T15:00:00Z',
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
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps({
            'success': False,
            'error': message,
            'timestamp': '2025-06-22T15:00:00Z'
        })
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    SnapMagic Lambda handler using Face Mesh approach
    """
    try:
        logger.info("🎯 SnapMagic Lambda Handler - Face Mesh Configuration")
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # Health check
        if event.get('path') == '/health':
            return create_success_response({
                'service': 'SnapMagic Backend',
                'status': 'healthy',
                'blister_pack_config': {
                    'similarity': 0.93,  # Higher for sample-quality preservation
                    'cfg_scale': 8.5,    # Balanced for packaging details
                    'seed': 42,
                    'quality': 'premium',
                    'model': 'amazon.nova-canvas-v1:0',
                    'approach': 'blister_pack_action_figure_with_skin_tone_preservation',
                    'packaging': 'professional_blister_pack_1_to_5_variations'
                }
            })
        
        # Parse request body
        try:
            body = json.loads(event.get('body', '{}'))
        except json.JSONDecodeError:
            return create_error_response("Invalid JSON in request body", 400)
        
        # Handle login
        if event.get('path') == '/api/login':
            username = body.get('username', '')
            password = body.get('password', '')
            
            if username == 'demo' and password == 'demo':
                # Create simple token using the existing auth module
                auth_handler = SnapMagicAuthSimple()
                token = auth_handler.generate_token(username)
                return create_success_response({
                    'message': 'Login successful',
                    'token': token,
                    'expires_in': 86400
                })
            else:
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
        
        # Handle image transformation - NOW CREATES TIMES SQUARE BILLBOARD
        action = body.get('action', '')
        if action == 'transform_image':
            image_base64 = body.get('image_base64', '')
            prompt = body.get('prompt', '')
            
            if not image_base64:
                return create_error_response("Missing image data", 400)
            
            logger.info(f"🎯 Processing Times Square Billboard creation for user: {token_payload.get('username')}")
            
            # Import and use the simplified billboard service
            try:
                from services.billboard_generator_simple import create_times_square_billboard_simple
                result = create_times_square_billboard_simple(image_base64)
                
                return create_success_response({
                    'result': result,
                    'user': token_payload.get('username'),
                    'type': 'times_square_billboard',
                    'message': 'Your Times Square billboard is ready!',
                    'config_used': {
                        'approach': 'simplified_single_step_billboard',
                        'method': 'bedrock_nova_canvas_only',
                        'features': 'times_square_funko_pop_billboard',
                        'quality': 'premium'
                    }
                })
                
            except Exception as e:
                logger.error(f"Billboard creation failed: {str(e)}")
                return create_error_response(f"Billboard creation failed: {str(e)}", 500)
        
        return create_error_response(f"Unknown action: {action}", 400)
        
    except Exception as e:
        logger.error(f"❌ Lambda handler error: {str(e)}")
        return create_error_response(f"Internal server error: {str(e)}", 500)


if __name__ == "__main__":
    # Test the handler
    test_event = {
        'httpMethod': 'GET',
        'path': '/health',
        'headers': {},
        'body': '{}'
    }
    
    print("🧪 Testing SnapMagic WINNING Lambda Handler...")
    result = lambda_handler(test_event, None)
    print("📋 Result:")
    print(json.dumps(result, indent=2))
