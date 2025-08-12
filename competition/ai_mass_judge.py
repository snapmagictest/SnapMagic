#!/usr/bin/env python3
"""
AI-Powered Mass Image Judging System using Amazon Nova Premium
Evaluates thousands of images with real AI vision analysis
"""

import os
import json
import boto3
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional
from botocore.exceptions import ClientError

class NovaImageJudge:
    def __init__(self, bucket_name: str, prefix: str = "competition/", max_retries: int = 5):
        self.s3 = boto3.client('s3')
        self.bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.bucket = bucket_name
        self.prefix = prefix
        self.model_id = "amazon.nova-pro-v1:0"  # Nova Premium model
        self.max_retries = max_retries
        
    def call_nova_with_retry(self, messages: List[Dict]) -> Optional[Dict]:
        """Call Nova with exponential backoff retry logic"""
        for attempt in range(self.max_retries):
            try:
                # Add random delay between requests to avoid throttling
                if attempt > 0:
                    delay = (2 ** attempt) + random.uniform(0, 1)
                    print(f"    Retry {attempt}, waiting {delay:.1f}s...")
                    time.sleep(delay)
                
                response = self.bedrock.converse(
                    modelId=self.model_id,
                    messages=messages,
                    inferenceConfig={
                        "maxTokens": 500,
                        "temperature": 0.1,
                        "topP": 0.9
                    }
                )
                return response
                
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'ThrottlingException':
                    if attempt < self.max_retries - 1:
                        continue  # Retry
                    else:
                        print(f"    Max retries reached for throttling")
                        return None
                else:
                    print(f"    Non-throttling error: {e}")
                    return None
            except Exception as e:
                print(f"    Unexpected error: {e}")
                return None
        
        return None
    
    def judge_single_image(self, key: str) -> Optional[Dict]:
        """Judge a single image using Nova Premium"""
        filename = os.path.basename(key)
        
        try:
            # Use S3 URI instead of base64 for better compatibility
            s3_uri = f"s3://{self.bucket}/{key}"
            
            # Determine image format from file extension
            if key.lower().endswith('.png'):
                image_format = "png"
            elif key.lower().endswith(('.jpg', '.jpeg')):
                image_format = "jpeg"
            else:
                image_format = "png"  # default
            
            # Create the judging prompt
            prompt = """You are an expert art judge evaluating trading card images for a competition. 

Please analyze this image and provide scores (1-5) for each criteria:

1. **Visual Impact** (1-5): Does it grab attention immediately? Strong composition and colors?
2. **Creativity** (1-5): Unique, imaginative concept? Original artistic interpretation?
3. **Character & Storytelling** (1-5): Compelling character design? Tells a story or evokes emotion?
4. **Technical Quality** (1-5): Sharp, clear image? Good lighting, proportions, and details?
5. **Artistic Merit** (1-5): Consistent style? Would you want to collect this trading card?

Respond ONLY in this exact JSON format:
{
  "visual_impact": 4.2,
  "creativity": 3.8,
  "character_story": 4.5,
  "technical_quality": 4.0,
  "artistic_merit": 3.9,
  "reasoning": "Brief explanation of your scoring"
}"""

            # Prepare the request using S3 URI
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": image_format,
                                "source": {"s3Location": {"uri": s3_uri}}
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
            
            # Call Nova Premium using retry logic
            response = self.call_nova_with_retry(messages)
            if not response:
                print(f"Failed to get response for {filename} after all retries")
                return None
            
            # Parse response
            response_text = response['output']['message']['content'][0]['text']
            
            # Extract JSON from response
            try:
                # Find JSON in response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                json_str = response_text[start_idx:end_idx]
                
                scores = json.loads(json_str)
                
                # Calculate total score
                total_score = (
                    scores['visual_impact'] + 
                    scores['creativity'] + 
                    scores['character_story'] + 
                    scores['technical_quality'] + 
                    scores['artistic_merit']
                )
                
                return {
                    'filename': filename,
                    'key': key,
                    'scores': {
                        'visual_impact': round(scores['visual_impact'], 1),
                        'creativity': round(scores['creativity'], 1),
                        'character_story': round(scores['character_story'], 1),
                        'technical_quality': round(scores['technical_quality'], 1),
                        'artistic_merit': round(scores['artistic_merit'], 1)
                    },
                    'total_score': round(total_score, 2),
                    'ai_reasoning': scores.get('reasoning', 'No reasoning provided')
                }
                
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON for {filename}: {e}")
                print(f"Response was: {response_text}")
                return None
                
        except Exception as e:
            print(f"Error judging {key}: {e}")
            return None
    
    def judge_all_images(self, delay_between_requests: float = 2.0) -> List[Dict]:
        """Judge all images using Nova Premium with delays to avoid throttling"""
        print("🤖 AI-Powered Image Judging with Amazon Nova Premium")
        print("Fetching image list from S3...")
        
        # Get all images
        response = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=self.prefix)
        if 'Contents' not in response:
            print("No images found!")
            return []
        
        image_keys = [obj['Key'] for obj in response['Contents'] 
                     if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        print(f"Found {len(image_keys)} images to judge with AI...")
        print(f"⚠️  Note: This will use Nova Premium tokens - estimated cost: ${len(image_keys) * 0.05:.2f}")
        print(f"⏱️  Estimated time: {len(image_keys) * (delay_between_requests + 3):.0f} seconds")
        
        # Confirm before proceeding
        if len(image_keys) > 10:
            confirm = input(f"Proceed with AI judging {len(image_keys)} images? (y/N): ")
            if confirm.lower() != 'y':
                print("Cancelled.")
                return []
        
        results = []
        
        # Process images sequentially with delays to avoid throttling
        for i, key in enumerate(image_keys):
            print(f"\n[{i+1}/{len(image_keys)}] Processing: {os.path.basename(key)}")
            
            # Add delay between requests (except for first one)
            if i > 0:
                print(f"  Waiting {delay_between_requests}s to avoid throttling...")
                time.sleep(delay_between_requests)
            
            result = self.judge_single_image(key)
            if result:
                results.append(result)
                print(f"  ✅ Score: {result['total_score']}/25")
            else:
                print(f"  ❌ Failed to judge image")
        
        # Sort by total score
        results.sort(key=lambda x: x['total_score'], reverse=True)
        
        return results
    
    def save_results(self, results: List[Dict], filename: str = "ai_judging_results.json"):
        """Save AI judging results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"AI judging results saved to {filename}")
    
    def print_top_results(self, results: List[Dict], top_n: int = 20):
        """Print top N results with AI reasoning"""
        print(f"\n🏆 TOP {min(top_n, len(results))} AI-JUDGED ENTRIES:")
        print("=" * 100)
        
        for i, result in enumerate(results[:top_n], 1):
            scores = result['scores']
            print(f"\n{i:2d}. {result['filename']}")
            print(f"    🤖 AI Total Score: {result['total_score']}/25")
            print(f"    📊 Visual Impact: {scores['visual_impact']}/5")
            print(f"    🎨 Creativity: {scores['creativity']}/5") 
            print(f"    📖 Character/Story: {scores['character_story']}/5")
            print(f"    🔧 Technical Quality: {scores['technical_quality']}/5")
            print(f"    ✨ Artistic Merit: {scores['artistic_merit']}/5")
            print(f"    💭 AI Reasoning: {result['ai_reasoning']}")
            print("-" * 80)

def load_config(config_file: str = "config.json") -> Dict:
    """Load configuration from JSON file"""
    try:
        with open(config_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Config file {config_file} not found!")
        print("Creating default config...")
        default_config = {
            "s3_bucket": "your-bucket-name",
            "s3_prefix": "competition/",
            "top_results": 20,
            "delay_between_requests": 3.0,
            "max_retries": 5,
            "output_file": "ai_judging_results.json"
        }
        with open(config_file, 'w') as f:
            json.dump(default_config, f, indent=2)
        print(f"✅ Created {config_file} - please update with your settings")
        return default_config

def main():
    # Load configuration
    config = load_config()
    
    print("🎨 SnapMagic AI-Powered Mass Image Judging System")
    print("🤖 Using Amazon Nova Premium for intelligent art evaluation")
    print("=" * 70)
    print(f"📁 S3 Bucket: {config['s3_bucket']}")
    print(f"📂 S3 Prefix: {config['s3_prefix']}")
    print(f"🏆 Top Results: {config['top_results']}")
    print("=" * 70)
    
    # Initialize AI judge
    judge = NovaImageJudge(config['s3_bucket'], config['s3_prefix'], config['max_retries'])
    
    # Judge all images with AI (sequential with delays)
    results = judge.judge_all_images(delay_between_requests=config['delay_between_requests'])
    
    if not results:
        print("No results to display!")
        return
    
    # Save and display results
    judge.save_results(results, config['output_file'])
    judge.print_top_results(results, top_n=config['top_results'])
    
    print(f"\n✅ AI judged {len(results)} images successfully!")
    print("🧠 Winners determined by Amazon Nova Premium AI analysis")
    print("💰 Estimated cost: ${:.2f}".format(len(results) * 0.05))

if __name__ == "__main__":
    main()
