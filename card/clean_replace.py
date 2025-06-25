#!/usr/bin/env python3
import boto3
import base64
import json
import sys

def clean_replace_function(prompt_text):
    """Clean replacement like AWS console with better settings"""
    
    # Use finalpink.png template and exact coordinate mask
    with open('finalpink.png', "rb") as f:
        base64_template = base64.b64encode(f.read()).decode('utf8')
    
    with open('exact_mask.png', "rb") as f:
        base64_mask = base64.b64encode(f.read()).decode('utf8')
    
    bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    body = json.dumps({
        "taskType": "INPAINTING",
        "inPaintingParams": {
            "text": prompt_text,
            "negativeText": "pink, magenta, placeholder, low quality, blurry, artifacts",
            "image": base64_template,
            "maskImage": base64_mask
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "quality": "premium",  # Higher quality
            "cfgScale": 8.0,       # Higher for better prompt following
            "seed": 42             # Consistent results
        }
    })
    
    try:
        print(f"🔄 CLEAN REPLACE function")
        print(f"🩷 Template: finalpink.png")
        print(f"🎯 Exact coordinate mask")
        print(f"🏖️ Replace with: {prompt_text}")
        print("✨ Using premium quality settings")
        
        response = bedrock.invoke_model(modelId="amazon.nova-canvas-v1:0", body=body)
        result = json.loads(response['body'].read().decode('utf-8'))
        
        if 'images' in result:
            image_data = base64.b64decode(result['images'][0])
            with open('clean_replace_result.png', 'wb') as f:
                f.write(image_data)
            print("✅ Result: clean_replace_result.png")
            print("🎯 Should be clean replacement without pink artifacts!")
            return True
        else:
            print("❌ Failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "beautiful tropical beach scene"
    print("🔄 CLEAN REPLACE - No pink artifacts!")
    print("=" * 50)
    
    success = clean_replace_function(prompt)
    
    if success:
        print("=" * 50)
        print("🎉 Clean replace should eliminate pink artifacts!")
    else:
        print("❌ Still having issues")
