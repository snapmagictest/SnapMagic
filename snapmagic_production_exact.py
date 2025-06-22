#!/usr/bin/env python3
"""
SnapMagic Production Exact - Standalone Script
EXACT copy of the working production solution from the app
"""

import json
import boto3
import base64
from typing import Dict, Any

class SnapMagicProductionExact:
    """
    EXACT copy of the production solution that's working in the app
    """
    
    def __init__(self, region: str = "us-east-1"):
        """Initialize with AWS clients - exact same as production"""
        self.region = region
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.rekognition = boto3.client('rekognition', region_name='us-east-1')
        
        print("🎯 SnapMagic Production Exact - Standalone Version")
        print("✨ Using EXACT production solution from working app")

    def extract_face_mesh_data(self, image_base64: str) -> Dict[str, Any]:
        """Extract detailed face mesh and features using Rekognition + skin tone analysis"""
        try:
            # Clean the base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
                
            image_bytes = base64.b64decode(image_base64)
            
            response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if not response['FaceDetails']:
                print("⚠️ No face detected in image")
                return {'success': False, 'error': 'No face detected'}
            
            face = response['FaceDetails'][0]
            
            # Get comprehensive label analysis for skin tone detection
            label_response = self.rekognition.detect_labels(
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
            
            print(f"🔍 Face mesh extracted: {mesh_data['gender']} ({mesh_data['gender_confidence']:.1f}%), "
                       f"Age: {mesh_data['age_range']}, Features: {[k for k, v in mesh_data.items() if k.startswith('has_') and v]}")
            print(f"🎨 Skin tone descriptors: {skin_tone_descriptors}")
            print(f"🌍 Complexion hints: {complexion_hints}")
            
            return {'success': True, 'mesh_data': mesh_data}
            
        except Exception as e:
            print(f"❌ Face mesh extraction failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def create_mesh_based_action_figure_prompt(self, mesh_data: Dict[str, Any]) -> str:
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

    def transform_image_mesh_approach(self, image_base64: str, username: str = "test") -> str:
        """
        SnapMagic Face Mesh Action Figure Approach
        Uses Rekognition face mesh data for accurate action figure generation
        """
        try:
            print(f"🎯 Using SnapMagic Face Mesh approach for user: {username}")
            
            # Clean the base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Step 1: Extract face mesh data
            mesh_result = self.extract_face_mesh_data(image_base64)
            if not mesh_result['success']:
                print(f"❌ Face mesh extraction failed: {mesh_result['error']}")
                # Fallback to simple prompt
                mesh_prompt = "Professional 3D action figure, business professional, confident pose, high-quality rendering"
            else:
                mesh_data = mesh_result['mesh_data']
                mesh_prompt = self.create_mesh_based_action_figure_prompt(mesh_data)
                print(f"📝 Generated mesh-based prompt: {mesh_prompt[:150]}...")
            
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
            
            print("🎨 Generating mesh-based action figure with Nova Canvas...")
            
            response = self.bedrock_runtime.invoke_model(
                modelId="amazon.nova-canvas-v1:0",
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            
            if 'images' in response_body and len(response_body['images']) > 0:
                result_image = response_body['images'][0]
                print("✅ Mesh-based action figure generation successful!")
                return result_image
            else:
                print("❌ No images returned from Nova Canvas")
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
    
    generator = SnapMagicProductionExact()
    
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
