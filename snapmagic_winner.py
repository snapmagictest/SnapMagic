#!/usr/bin/env python3
"""
SnapMagic Winner Script - Locked Configuration
This script uses the EXACT winning parameters that produced:
- advanced_balanced_result.jpg
- winning_consistency_1.jpg

WINNING CONFIG: similarity 0.95, cfg 9.0, seed 42, premium quality
"""

import argparse
import base64
import json
import boto3
import os
from pathlib import Path

class SnapMagicWinner:
    def __init__(self, region: str = "us-east-1"):
        """Initialize with winning configuration locked in"""
        self.region = region
        self.bedrock = boto3.client('bedrock-runtime', region_name=region)
        self.rekognition = boto3.client('rekognition', region_name=region)
        self.model_id = "amazon.nova-canvas-v1:0"
        
        # LOCKED WINNING PARAMETERS - DO NOT CHANGE
        self.WINNING_SIMILARITY = 0.95
        self.WINNING_CFG_SCALE = 9.0
        self.WINNING_SEED = 42
        self.WINNING_QUALITY = "premium"
    
    def encode_image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string."""
        try:
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
                base64_string = base64.b64encode(image_data).decode('utf-8')
                return base64_string
        except Exception as e:
            raise Exception(f"Error encoding image: {str(e)}")
    
    def save_base64_image(self, base64_string: str, output_path: str) -> None:
        """Save base64 string as image file."""
        try:
            image_data = base64.b64decode(base64_string)
            with open(output_path, 'wb') as output_file:
                output_file.write(image_data)
            print(f"✅ SnapMagic result saved to: {output_path}")
        except Exception as e:
            raise Exception(f"Error saving image: {str(e)}")
    
    def get_facial_landmarks(self, image_base64: str):
        """Get facial landmarks using Rekognition (exact same as winning script)"""
        try:
            image_bytes = base64.b64decode(image_base64)
            
            response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if response['FaceDetails']:
                face = response['FaceDetails'][0]
                landmarks = {}
                
                for landmark in face['Landmarks']:
                    landmarks[landmark['Type']] = {
                        'x': landmark['X'],
                        'y': landmark['Y']
                    }
                
                return landmarks, face
                
        except Exception as e:
            print(f"Landmark detection failed: {e}")
            return None, None
    
    def create_winning_prompt(self, landmarks, face_details):
        """Create the exact winning prompt structure"""
        
        prompt_elements = []
        
        # Base transformation (exact same as winning script)
        prompt_elements.append("3D cartoon action figure transformation preserving facial structure")
        
        # Add specific structural cues based on landmarks (exact same logic)
        if landmarks:
            if 'eyeLeft' in landmarks and 'eyeRight' in landmarks:
                eye_distance = abs(landmarks['eyeLeft']['x'] - landmarks['eyeRight']['x'])
                if eye_distance > 0.15:
                    prompt_elements.append("wide-set eyes")
                elif eye_distance < 0.12:
                    prompt_elements.append("close-set eyes")
            
            if 'nose' in landmarks and 'mouthUp' in landmarks:
                nose_mouth_ratio = abs(landmarks['nose']['y'] - landmarks['mouthUp']['y'])
                if nose_mouth_ratio > 0.08:
                    prompt_elements.append("longer nose-to-mouth distance")
        
        # Add face shape cues from detection (exact same logic)
        if face_details:
            if face_details.get('Smile', {}).get('Value'):
                prompt_elements.append("slight smile expression")
        
        # Essential elements (exact same as winning script)
        prompt_elements.extend([
            "maintain exact facial proportions",
            "preserve eye shape and nose structure", 
            "keep jawline definition",
            "same skin tone and complexion",
            "arms crossed pose",
            "black polo shirt"
        ])
        
        return ", ".join(prompt_elements)
    
    def transform_to_action_figure(self, input_image_base64: str) -> str:
        """Transform using EXACT winning configuration"""
        
        # Get facial analysis (same as winning script)
        print("🔍 Analyzing facial features...")
        landmarks, face_details = self.get_facial_landmarks(input_image_base64)
        
        # Create winning prompt
        if landmarks:
            prompt = self.create_winning_prompt(landmarks, face_details)
            print(f"📝 Generated structure-aware prompt")
        else:
            prompt = "3D cartoon action figure maintaining exact facial structure, eye shape, nose form, jawline, skin tone from photo. Arms crossed, black polo."
            print(f"📝 Using fallback prompt")
        
        # Ensure prompt is within limits (same as winning script)
        if len(prompt) > 1000:
            prompt = "3D cartoon figure preserving exact facial structure, eye shape, nose, jawline, skin tone. Arms crossed, black polo shirt."
        
        print(f"📝 Final prompt length: {len(prompt)} characters")
        
        # EXACT WINNING REQUEST BODY
        request_body = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": prompt,
                "images": [input_image_base64],
                "similarityStrength": self.WINNING_SIMILARITY  # 0.95
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": self.WINNING_QUALITY,  # "premium"
                "width": 1024,
                "height": 1024,
                "cfgScale": self.WINNING_CFG_SCALE,  # 9.0
                "seed": self.WINNING_SEED  # 42
            }
        }
        
        print(f"🎨 Transforming with WINNING config...")
        print(f"⚙️  Similarity: {self.WINNING_SIMILARITY}")
        print(f"⚙️  CFG Scale: {self.WINNING_CFG_SCALE}")
        print(f"⚙️  Seed: {self.WINNING_SEED}")
        print(f"⚙️  Quality: {self.WINNING_QUALITY}")
        
        # Call Nova Canvas with winning configuration
        response = self.bedrock.invoke_model(
            modelId=self.model_id,
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json"
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image_base64 = response_body['images'][0]
            print("✅ SnapMagic transformation completed!")
            return transformed_image_base64
        else:
            raise Exception("No transformed image returned from Nova Canvas")

def main():
    parser = argparse.ArgumentParser(
        description="SnapMagic Winner - Guaranteed winning results",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
🏆 SnapMagic Winner Configuration:
  This script uses the EXACT parameters that produced the best results:
  - advanced_balanced_result.jpg
  - winning_consistency_1.jpg
  
  Locked settings: similarity 0.95, cfg 9.0, seed 42, premium quality
  
🎯 Examples:
  python snapmagic_winner.py --input selfie.jpg
  python snapmagic_winner.py --input photo.png --output my_action_figure.jpg
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        required=True,
        help='Path to input image file'
    )
    
    parser.add_argument(
        '--output', '-o',
        help='Output file path (default: snapmagic_<input_name>)'
    )
    
    parser.add_argument(
        '--region', '-r',
        default='us-east-1',
        help='AWS region (default: us-east-1)'
    )
    
    args = parser.parse_args()
    
    # Validate input file exists
    if not os.path.exists(args.input):
        print(f"❌ Error: Input image '{args.input}' not found!")
        return 1
    
    # Generate output filename if not provided
    if not args.output:
        input_path = Path(args.input)
        output_filename = f"snapmagic_{input_path.stem}{input_path.suffix}"
        args.output = str(input_path.parent / output_filename)
    
    try:
        print("🏆 SnapMagic Winner - Guaranteed Best Results")
        print("=" * 60)
        print(f"📸 Input: {args.input}")
        print(f"💾 Output: {args.output}")
        print(f"🌍 Region: {args.region}")
        print("🔒 Using LOCKED winning configuration")
        print("=" * 60)
        
        # Initialize SnapMagic Winner
        snapmagic = SnapMagicWinner(region=args.region)
        
        # Encode input image
        print("📤 Encoding input image...")
        input_base64 = snapmagic.encode_image_to_base64(args.input)
        
        # Transform to action figure using winning config
        output_base64 = snapmagic.transform_to_action_figure(input_base64)
        
        # Save result
        print("💾 Saving SnapMagic result...")
        snapmagic.save_base64_image(output_base64, args.output)
        
        print("🎉 SnapMagic Winner transformation completed!")
        print(f"✨ Your guaranteed best result: {args.output}")
        print("🚀 Ready for AWS events and social media!")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
