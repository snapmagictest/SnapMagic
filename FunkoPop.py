#!/usr/bin/env python3
"""
FunkoPop.py - Funko Pop Style Action Figure Generator
Creates Funko Pop style action figures from selfie photos
Uses Amazon Bedrock Nova Canvas with complexion preservation
"""

import json
import boto3
import base64
import os
from typing import Dict, Any
from PIL import Image
import io

class FunkoPopGenerator:
    """
    Funko Pop Style Action Figure Generator
    Creates complete full body Funko Pop style figures from selfies
    """
    
    def __init__(self, region: str = "us-east-1"):
        """Initialize with AWS clients for Funko Pop generation"""
        self.region = region
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.rekognition = boto3.client('rekognition', region_name='us-east-1')
        
        print("🎯 FunkoPop Generator - Standalone Version")
        print("✨ Creating Funko Pop style action figures from selfies")

    def resize_image_for_bedrock(self, image_bytes: bytes, max_pixels: int = 4194304) -> bytes:
        """
        Resize image to fit within Bedrock Nova Canvas pixel limits
        Max pixels: 4,194,304 (approximately 2048x2048)
        """
        try:
            # Open image with PIL
            image = Image.open(io.BytesIO(image_bytes))
            
            # Calculate current pixel count
            current_pixels = image.width * image.height
            
            print(f"📏 Original image: {image.width}x{image.height} = {current_pixels:,} pixels")
            
            # If image is within limits, return as-is
            if current_pixels <= max_pixels:
                print("✅ Image is within Bedrock limits, no resizing needed")
                return image_bytes
            
            # Calculate resize ratio to fit within pixel limit
            resize_ratio = (max_pixels / current_pixels) ** 0.5
            new_width = int(image.width * resize_ratio)
            new_height = int(image.height * resize_ratio)
            
            print(f"🔄 Resizing to: {new_width}x{new_height} = {new_width * new_height:,} pixels")
            
            # Resize image maintaining aspect ratio
            resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Convert back to bytes
            output_buffer = io.BytesIO()
            
            # Preserve original format if possible, otherwise use JPEG
            format_to_use = image.format if image.format in ['JPEG', 'PNG'] else 'JPEG'
            
            if format_to_use == 'PNG':
                resized_image.save(output_buffer, format='PNG', optimize=True)
            else:
                # Convert to RGB if necessary for JPEG
                if resized_image.mode in ('RGBA', 'LA', 'P'):
                    resized_image = resized_image.convert('RGB')
                resized_image.save(output_buffer, format='JPEG', quality=95, optimize=True)
            
            resized_bytes = output_buffer.getvalue()
            
            print(f"✅ Image successfully resized from {len(image_bytes):,} bytes to {len(resized_bytes):,} bytes")
            
            return resized_bytes
            
        except Exception as e:
            print(f"❌ Image resizing failed: {str(e)}")
            print("⚠️ Using original image (may fail if too large)")
            return image_bytes

    def extract_face_mesh_data(self, image_base64: str) -> Dict[str, Any]:
        """Extract EVERYTHING about head/face for Funko Pop customization"""
        try:
            # Clean the base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
                
            image_bytes = base64.b64decode(image_base64)
            
            # CRITICAL: Resize image to fit Bedrock limits
            image_bytes = self.resize_image_for_bedrock(image_bytes)
            
            # COMPREHENSIVE FACE ANALYSIS
            response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if not response['FaceDetails']:
                print("⚠️ No face detected in image")
                return {'success': False, 'error': 'No face detected'}
            
            face = response['FaceDetails'][0]
            
            # COMPREHENSIVE LABEL ANALYSIS - Everything about head/face
            label_response = self.rekognition.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=100,
                MinConfidence=60  # Lower threshold to catch more head/face features
            )
            
            # COMPREHENSIVE HEAD/FACE FEATURE EXTRACTION
            features = {
                # Basic demographics
                'gender': face.get('Gender', {}).get('Value', 'Unknown'),
                'age_range': f"{face['AgeRange']['Low']}-{face['AgeRange']['High']}",
                
                # FACE FEATURES (from face detection - most reliable)
                'has_beard': face.get('Beard', {}).get('Value', False),
                'has_mustache': face.get('Mustache', {}).get('Value', False),
                'has_smile': face.get('Smile', {}).get('Value', False),
                'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
                'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
                
                # COMPREHENSIVE HEAD/FACE ACCESSORIES
                'head_accessories': [],
                'hair_color': [],
                'hair_style': [],
                'facial_accessories': [],
                'head_wear': [],
                'jewelry': [],
                'skin_tone_descriptors': []
            }
            
            # COMPREHENSIVE HEAD/FACE DETECTION - Everything possible
            for label in label_response['Labels']:
                label_name = label['Name'].lower()
                confidence = label['Confidence']
                
                # HEAD WEAR - Hats, caps, helmets, etc.
                head_wear_keywords = ['hat', 'cap', 'helmet', 'headband', 'bandana', 'crown', 'tiara', 'headwrap', 'beanie', 'beret']
                for keyword in head_wear_keywords:
                    if keyword in label_name and confidence > 70:
                        features['head_wear'].append(label['Name'])
                        break
                
                # GLASSES AND EYE ACCESSORIES
                eye_accessories = ['glasses', 'sunglasses', 'eyeglasses', 'spectacles', 'goggles']
                for keyword in eye_accessories:
                    if keyword in label_name and confidence > 75:
                        features['facial_accessories'].append(label['Name'])
                        break
                
                # JEWELRY - Earrings, necklaces visible in head area
                jewelry_keywords = ['earring', 'earrings', 'necklace', 'chain', 'pendant']
                for keyword in jewelry_keywords:
                    if keyword in label_name and confidence > 70:
                        features['jewelry'].append(label['Name'])
                        break
                
                # HAIR COLOR - Specific hair colors
                hair_colors = ['black hair', 'brown hair', 'blonde hair', 'gray hair', 'grey hair', 'white hair', 'red hair', 'silver hair']
                for color in hair_colors:
                    if color in label_name and confidence > 70:
                        features['hair_color'].append(label['Name'])
                        break
                
                # HAIR STYLE - Hair styling
                hair_styles = ['curly hair', 'straight hair', 'wavy hair', 'long hair', 'short hair', 'ponytail', 'braid', 'bun']
                for style in hair_styles:
                    if style in label_name and confidence > 70:
                        features['hair_style'].append(label['Name'])
                        break
                
                # GENERAL HEAD ACCESSORIES
                general_accessories = ['mask', 'scarf', 'bow tie', 'tie']
                for keyword in general_accessories:
                    if keyword in label_name and confidence > 70:
                        features['head_accessories'].append(label['Name'])
                        break
                
                # SKIN TONE
                if 'skin' in label_name and confidence > 75:
                    features['skin_tone_descriptors'].append(label['Name'])
            
            # Remove duplicates and limit
            for key in ['head_accessories', 'hair_color', 'hair_style', 'facial_accessories', 'head_wear', 'jewelry']:
                features[key] = list(dict.fromkeys(features[key]))[:3]
            
            print(f"🎭 COMPREHENSIVE HEAD/FACE: {features['gender']}, Age: {features['age_range']}")
            print(f"😊 Face features: {[k for k, v in features.items() if k.startswith('has_') and v]}")
            print(f"👒 Head wear: {features['head_wear']}")
            print(f"👓 Facial accessories: {features['facial_accessories']}")
            print(f"💎 Jewelry: {features['jewelry']}")
            print(f"💇 Hair color: {features['hair_color']}")
            print(f"✂️ Hair style: {features['hair_style']}")
            print(f"🎯 Head accessories: {features['head_accessories']}")
            
            # Store resized image bytes
            features['resized_image_bytes'] = image_bytes
            
            return {'success': True, 'mesh_data': features}
            
        except Exception as e:
            print(f"❌ Comprehensive head/face extraction failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def create_mesh_based_action_figure_prompt(self, mesh_data: Dict[str, Any]) -> str:
        """2 Standard Bodies + ALL Head/Face Features from Rekognition"""
        
        prompt_parts = ["Full body Funko Pop figure head to toes"]
        
        # COMPLEXION PRESERVATION
        prompt_parts.extend([
            "preserve original skin color",
            "keep ethnic characteristics"
        ])
        
        # FORCE COMPLETE BODY
        prompt_parts.extend([
            "show entire figure with legs feet visible",
            "complete standing pose not cropped"
        ])
        
        # STANDARD FUNKO POP HEAD (Same for everyone)
        prompt_parts.extend([
            "standard Funko Pop head shape",
            "oversized round head",
            "large black dot eyes",
            "no nose small indentation"
        ])
        
        # STANDARDIZED BODY (2 Types Only)
        gender = mesh_data.get('gender', 'Unknown').lower()
        if gender == 'female':
            prompt_parts.extend([
                "female corporate business fitted dress",
                "professional curvy office attire"
            ])
        else:  # Default to male
            prompt_parts.extend([
                "male corporate business suit",
                "professional formal suit tie"
            ])
        
        # ALL HEAD/FACE FEATURES (Everything from Rekognition)
        
        # Face-detected features (most reliable)
        if mesh_data.get('has_beard'):
            prompt_parts.append("beard")
        if mesh_data.get('has_mustache'):
            prompt_parts.append("mustache")
        if mesh_data.get('has_smile'):
            prompt_parts.append("smile")
        
        # Glasses (from face detection)
        if mesh_data.get('has_glasses'):
            prompt_parts.append("glasses")
        if mesh_data.get('has_sunglasses'):
            prompt_parts.append("sunglasses")
        
        # ALL HEAD WEAR
        head_wear = mesh_data.get('head_wear', [])
        for item in head_wear:
            prompt_parts.append(f"{item.lower()}")
        
        # ALL FACIAL ACCESSORIES
        facial_accessories = mesh_data.get('facial_accessories', [])
        for item in facial_accessories:
            prompt_parts.append(f"{item.lower()}")
        
        # ALL JEWELRY
        jewelry = mesh_data.get('jewelry', [])
        for item in jewelry:
            prompt_parts.append(f"{item.lower()}")
        
        # ALL HAIR FEATURES
        hair_color = mesh_data.get('hair_color', [])
        for color in hair_color:
            prompt_parts.append(f"{color.lower()}")
        
        hair_style = mesh_data.get('hair_style', [])
        for style in hair_style:
            prompt_parts.append(f"{style.lower()}")
        
        # ALL OTHER HEAD ACCESSORIES
        head_accessories = mesh_data.get('head_accessories', [])
        for accessory in head_accessories:
            prompt_parts.append(f"{accessory.lower()}")
        
        # FINAL SPECIFICATIONS
        prompt_parts.extend([
            "vinyl collectible style",
            "clean white background"
        ])
        
        return ", ".join(prompt_parts)

    def transform_image_mesh_approach(self, image_base64: str, username: str = "test") -> str:
        """
        SnapMagic Face Mesh Action Figure Approach
        Uses Rekognition face mesh data for accurate action figure generation
        Simple seed fallback for reliability
        """
        try:
            print(f"🎯 Using SnapMagic Face Mesh approach for user: {username}")
            
            # Clean the base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Step 1: Extract face mesh data (includes automatic resizing)
            mesh_result = self.extract_face_mesh_data(image_base64)
            if not mesh_result['success']:
                print(f"❌ Face mesh extraction failed: {mesh_result['error']}")
                # Fallback to simple prompt
                mesh_prompt = "Professional 3D action figure, business professional, confident pose, high-quality rendering"
                # Use original image if mesh extraction failed
                if ',' in image_base64:
                    clean_image_base64 = image_base64.split(',')[1]
                else:
                    clean_image_base64 = image_base64
            else:
                mesh_data = mesh_result['mesh_data']
                mesh_prompt = self.create_mesh_based_action_figure_prompt(mesh_data)
                print(f"📝 Generated mesh-based prompt: {mesh_prompt[:150]}...")
                
                # Use the resized image bytes for Bedrock generation
                resized_image_bytes = mesh_data.get('resized_image_bytes')
                if resized_image_bytes:
                    # Convert resized bytes back to base64 for Bedrock
                    clean_image_base64 = base64.b64encode(resized_image_bytes).decode('utf-8')
                else:
                    # Fallback to original (shouldn't happen but safety first)
                    if ',' in image_base64:
                        clean_image_base64 = image_base64.split(',')[1]
                    else:
                        clean_image_base64 = image_base64
            
            # Step 2: Generate with Nova Canvas - try multiple seeds for reliability
            seeds_to_try = [42, 999, 123, 777, 555]
            
            for seed in seeds_to_try:
                try:
                    request_body = {
                        "taskType": "IMAGE_VARIATION",
                        "imageVariationParams": {
                            "text": mesh_prompt,
                            "images": [clean_image_base64],  # Use resized image
                            "similarityStrength": 0.60  # Back to working full body generation
                        },
                        "imageGenerationConfig": {
                            "numberOfImages": 1,
                            "quality": "premium",
                            "width": 1024,
                            "height": 1024,
                            "cfgScale": 9.5,  # Higher CFG for better prompt following
                            "seed": seed
                        }
                    }
                    
                    print(f"🎨 Generating with seed {seed}...")
                    
                    response = self.bedrock_runtime.invoke_model(
                        modelId="amazon.nova-canvas-v1:0",
                        body=json.dumps(request_body),
                        contentType="application/json",
                        accept="application/json"
                    )
                    
                    response_body = json.loads(response['body'].read())
                    
                    if 'images' in response_body and len(response_body['images']) > 0:
                        result_image = response_body['images'][0]
                        print(f"✅ Success with seed {seed}!")
                        return result_image
                    else:
                        print(f"⚠️ No images returned with seed {seed}, trying next...")
                        continue
                        
                except Exception as e:
                    print(f"⚠️ Seed {seed} failed: {str(e)}, trying next...")
                    continue
            
            # All seeds failed
            print("❌ All seeds failed")
            return ""
                
        except Exception as e:
            print(f"❌ Mesh action figure transformation failed: {str(e)}")
            return ""

    def test_with_image(self, image_path: str, output_path: str = "production_exact_result.jpg"):
        """Test with exact production solution"""
        try:
            print(f"🧪 Testing Production Exact Solution with {image_path}")
            
            # Read image
            with open(image_path, 'rb') as f:
                image_data = f.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Transform using exact production method
            result = self.transform_image_mesh_approach(image_base64)
            
            if result:
                # Save result
                result_data = base64.b64decode(result)
                with open(output_path, 'wb') as f:
                    f.write(result_data)
                
                print(f"✅ Production exact result saved to: {output_path}")
                return output_path
            else:
                print("❌ Generation failed")
                return None
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
            raise


def main():
    """Test the exact production solution"""
    print("🎯 SnapMagic Production Exact - Standalone Test")
    print("=" * 50)
    print("✨ Using EXACT production solution from working app")
    print("=" * 50)
    
    generator = FunkoPopGenerator()
    
    import os
    if os.path.exists('test.jpg'):
        print("🧪 Testing with test.jpg...")
        try:
            result_path = generator.test_with_image('test.jpg', 'production_exact_test.jpg')
            if result_path:
                print(f"🎉 SUCCESS! Production exact result: {result_path}")
            else:
                print("❌ Test failed")
        except Exception as e:
            print(f"❌ Test failed: {e}")
    else:
        print("❌ test.jpg not found")


if __name__ == "__main__":
    main()
# Test function for FunkoPop generator
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python FunkoPop.py <input_image> <output_image>")
        print("Example: python FunkoPop.py selfie.jpg funko_pop_result.jpg")
        sys.exit(1)
    
    input_image = sys.argv[1]
    output_image = sys.argv[2]
    
    if not os.path.exists(input_image):
        print(f"❌ Input image {input_image} not found")
        sys.exit(1)
    
    print(f"🎯 Creating Funko Pop style figure from {input_image}...")
    
    generator = FunkoPopGenerator()
    result = generator.test_with_image(input_image, output_image)
    
    if result:
        print(f"🎉 SUCCESS! Funko Pop style figure saved to: {result}")
    else:
        print("❌ Failed to generate Funko Pop style figure")
