#!/usr/bin/env python3
"""
FunkoPop_Clean.py - Clean scalable version based on working FunkoPop.py
"""

import json
import boto3
import base64
import os
import time
from typing import Dict, Any, List
from PIL import Image
import io
from concurrent.futures import ThreadPoolExecutor
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CleanFunkoPopGenerator:
    
    def __init__(self, region: str = "us-east-1", max_concurrent: int = 2, rate_limit_delay: float = 8.0):
        self.region = region
        self.max_concurrent = max_concurrent
        self.rate_limit_delay = rate_limit_delay
        
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
        self.rekognition = boto3.client('rekognition', region_name=region)
        
        self.processing_semaphore = threading.Semaphore(max_concurrent)
        self.last_request_time = 0
        self.request_lock = threading.Lock()
        
        self.stats = {
            'total_requests': 0,
            'successful': 0,
            'failed': 0,
            'rate_limited': 0
        }
        
        print(f"🎯 Clean FunkoPop Generator")
        print(f"⚡ Max concurrent: {max_concurrent}")
        print(f"🕐 Rate limit delay: {rate_limit_delay}s")

    def resize_image_for_bedrock(self, image_bytes: bytes, max_pixels: int = 4194304) -> bytes:
        """Resize image to fit within Bedrock Nova Canvas pixel limits"""
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                width, height = img.size
                total_pixels = width * height
                
                if total_pixels > max_pixels:
                    scale_factor = (max_pixels / total_pixels) ** 0.5
                    new_width = int(width * scale_factor)
                    new_height = int(height * scale_factor)
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                if width < 320 or height < 320:
                    scale_factor = max(320 / width, 320 / height)
                    new_width = int(width * scale_factor)
                    new_height = int(height * scale_factor)
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                output_buffer = io.BytesIO()
                img.save(output_buffer, format='JPEG', quality=95, optimize=True)
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Image resize failed: {e}")
            return image_bytes

    def comprehensive_rekognition_analysis(self, image_path: str) -> Dict[str, Any]:
        """Comprehensive Rekognition analysis"""
        try:
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            
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
            with open('funko_config.json', 'r') as f:
                config = json.load(f)
            branding = config['event_branding']
        except:
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
        
        with self.processing_semaphore:
            with self.request_lock:
                current_time = time.time()
                time_since_last = current_time - self.last_request_time
                if time_since_last < self.rate_limit_delay:
                    sleep_time = self.rate_limit_delay - time_since_last
                    logger.info(f"Rate limiting: sleeping {sleep_time:.2f}s")
                    time.sleep(sleep_time)
                self.last_request_time = time.time()
            
            try:
                self.stats['total_requests'] += 1
                
                response = self.bedrock_runtime.invoke_model(
                    modelId="amazon.nova-canvas-v1:0",
                    body=json.dumps(request_body)
                )
                
                response_body = json.loads(response['body'].read())
                
                if 'images' in response_body and response_body['images']:
                    self.stats['successful'] += 1
                    return {'success': True, 'image': response_body['images'][0]}
                else:
                    self.stats['failed'] += 1
                    return {'success': False, 'error': 'No image in response'}
                    
            except Exception as e:
                error_str = str(e)
                if 'throttling' in error_str.lower() or 'rate' in error_str.lower():
                    self.stats['rate_limited'] += 1
                    time.sleep(10)
                self.stats['failed'] += 1
                return {'success': False, 'error': error_str}

    def generate_funko_pop(self, image_path: str, output_path: str) -> Dict[str, Any]:
        """Generate Funko Pop"""
        
        analysis_result = self.comprehensive_rekognition_analysis(image_path)
        
        if not analysis_result['success']:
            return analysis_result
        
        mesh_data = analysis_result['mesh_data']
        prompt = self.create_aws_branded_prompt(mesh_data)
        
        # ADD MODEL TEMPLATE AS SECOND REFERENCE IMAGE
        gender = mesh_data.get('gender', 'Unknown').lower()
        if gender == 'male':
            template_path = 'model/male.PNG'
        else:
            template_path = 'model/female.PNG'
        
        # Load template image
        try:
            with open(template_path, 'rb') as f:
                template_bytes = f.read()
            template_bytes = self.resize_image_for_bedrock(template_bytes)
            template_base64 = base64.b64encode(template_bytes).decode('utf-8')
        except Exception as e:
            print(f"⚠️ Template loading failed: {e}, continuing without template")
            template_base64 = None
        
        seeds = [42, 999, 123, 777, 555]
        
        for seed in seeds:
            # PRIORITIZE SELFIE FOR DETAILS, TEMPLATE FOR BODY STRUCTURE
            reference_images = [base64.b64encode(mesh_data['validated_image_bytes']).decode('utf-8')]
            if template_base64:
                reference_images.append(template_base64)
            
            # ENHANCED PROMPT TO PRIORITIZE SELFIE DETAILS
            detailed_prompt = f"use first image for all facial details complexion makeup features, use second image only for complete body structure, {prompt}"
            
            request_body = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": detailed_prompt,  # Enhanced prompt
                    "images": reference_images,  # Selfie first, template second
                    "similarityStrength": 0.90  # CHANGED to 0.90 for better balance
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
                with open(output_path, 'wb') as f:
                    f.write(base64.b64decode(result['image']))
                
                return {
                    'success': True,
                    'output_path': output_path,
                    'seed_used': seed,
                    'gender': mesh_data.get('gender'),
                    'age_range': mesh_data.get('age_range')
                }
        
        return {'success': False, 'error': 'All seeds failed'}

    def process_batch(self, image_paths: List[str], output_dir: str = "clean_results") -> Dict[str, Any]:
        """Process batch"""
        
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"🚀 Processing {len(image_paths)} images")
        
        start_time = time.time()
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_concurrent) as executor:
            future_to_path = {}
            for image_path in image_paths:
                filename = os.path.basename(image_path)
                name, ext = os.path.splitext(filename)
                output_path = os.path.join(output_dir, f"clean_{name}.jpg")
                
                future = executor.submit(self.generate_funko_pop, image_path, output_path)
                future_to_path[future] = image_path
            
            for future in future_to_path:
                try:
                    result = future.result(timeout=300)
                    results.append(result)
                    
                    if result['success']:
                        logger.info(f"✅ Completed: {result.get('output_path', 'unknown')}")
                    else:
                        logger.error(f"❌ Failed: {future_to_path[future]}")
                        
                except Exception as e:
                    path = future_to_path[future]
                    logger.error(f"❌ Exception processing {path}: {e}")
                    results.append({'success': False, 'error': str(e), 'input_path': path})
        
        end_time = time.time()
        total_time = end_time - start_time
        successful = sum(1 for r in results if r['success'])
        
        summary = {
            'total_processed': len(results),
            'successful': successful,
            'failed': len(results) - successful,
            'success_rate': (successful / len(results)) * 100 if results else 0,
            'total_time': total_time,
            'avg_time_per_image': total_time / len(results) if results else 0,
            'bedrock_stats': self.stats.copy(),
            'results': results
        }
        
        logger.info(f"🎉 BATCH COMPLETE!")
        logger.info(f"📊 Success rate: {summary['success_rate']:.1f}% ({successful}/{len(results)})")
        logger.info(f"⏱️ Total time: {total_time:.1f}s")
        
        return summary

def main():
    """Main function"""
    
    if len(os.sys.argv) < 2:
        print("Usage: python FunkoPop_Clean.py <test_directory> [max_concurrent] [rate_limit_delay]")
        print("Example: python FunkoPop_Clean.py othertest/ 2 8.0")
        return
    
    test_dir = os.sys.argv[1]
    max_concurrent = int(os.sys.argv[2]) if len(os.sys.argv) > 2 else 2
    rate_limit_delay = float(os.sys.argv[3]) if len(os.sys.argv) > 3 else 8.0
    
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    image_paths = []
    
    for filename in os.listdir(test_dir):
        if any(filename.lower().endswith(ext) for ext in image_extensions):
            image_paths.append(os.path.join(test_dir, filename))
    
    if not image_paths:
        print(f"❌ No image files found in {test_dir}")
        return
    
    print(f"📁 Found {len(image_paths)} images in {test_dir}")
    
    generator = CleanFunkoPopGenerator(
        max_concurrent=max_concurrent,
        rate_limit_delay=rate_limit_delay
    )
    
    summary = generator.process_batch(image_paths)
    
    with open('clean_results/clean_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"📄 Summary saved to clean_results/clean_summary.json")

if __name__ == "__main__":
    main()
