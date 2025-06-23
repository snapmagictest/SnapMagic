import boto3
import cv2
import base64
import json
from datetime import datetime
import os

def capture_photo():
    """Capture photo from webcam"""
    cap = cv2.VideoCapture(0)
    print("Press SPACE to take photo, ESC to exit")
    
    while True:
        ret, frame = cap.read()
        cv2.imshow('Camera - Press SPACE to capture', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):  # Space key
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"selfie_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            print(f"Photo saved as {filename}")
            break
        elif key == 27:  # ESC key
            print("Cancelled")
            cap.release()
            cv2.destroyAllWindows()
            return None
    
    cap.release()
    cv2.destroyAllWindows()
    return filename

def image_to_base64(image_path):
    """Convert image to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def transform_to_funko_pop(image_path):
    """Transform selfie to Funko Pop using Amazon Bedrock"""
    bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    # Convert image to base64
    image_base64 = image_to_base64(image_path)
    
    # Craft the perfect Funko Pop prompt
    prompt = """Transform this person into a complete full-body Funko Pop figurine with these specifications:

STYLE: Classic Funko Pop vinyl collectible figure
HEAD: Large oversized head (typical Funko Pop proportions), maintain the person's key facial features, hair color and style, but with simplified Funko Pop aesthetic - big round eyes, simplified nose, stylized features
BODY: Full complete body from head to toe, compact Funko Pop proportions with shorter torso and limbs
CLOTHING: Transform current clothing into clean, simplified Funko Pop style - solid colors, minimal details, appropriate for both male and female figures
POSE: Standing upright in classic Funko Pop pose
FEET: Must include complete feet and legs, no cut-offs
BASE: Place figure on official Funko Pop black rectangular display stand/base
BACKGROUND: Clean white background like official Funko Pop product photos
QUALITY: High-resolution, professional product photography lighting, sharp details
COMPLETENESS: Entire figure must be visible - no cropping of limbs, feet, or head

Keep the person's distinctive features recognizable while applying the iconic Funko Pop transformation. The result should look like an official Funko Pop collectible figure."""

    body = {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": prompt,
            "negativeText": "blurry, low quality, cropped limbs, missing feet, missing body parts, realistic proportions, detailed clothing, complex background"
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "height": 1024,
            "width": 1024,
            "cfgScale": 8.0,
            "seed": 42
        }
    }
    
    try:
        response = bedrock.invoke_model(
            modelId='amazon.titan-image-generator-v1',
            body=json.dumps(body)
        )
        
        response_body = json.loads(response['body'].read())
        
        # Save the generated image
        if 'images' in response_body:
            image_data = base64.b64decode(response_body['images'][0])
            output_filename = f"funko_pop_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            
            with open(output_filename, 'wb') as f:
                f.write(image_data)
            
            print(f"Funko Pop transformation saved as: {output_filename}")
            return output_filename
        else:
            print("No image generated")
            return None
            
    except Exception as e:
        print(f"Error generating Funko Pop: {str(e)}")
        return None

def main():
    print("=== Funko Pop Selfie Transformer ===")
    
    # Capture photo
    selfie_path = capture_photo()
    if not selfie_path:
        return
    
    print("Transforming to Funko Pop... (this may take a moment)")
    
    # Transform to Funko Pop
    funko_result = transform_to_funko_pop(selfie_path)
    
    if funko_result:
        print(f"Success! Your Funko Pop is ready: {funko_result}")
        
        # Show the result
        result_img = cv2.imread(funko_result)
        cv2.imshow('Your Funko Pop!', result_img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
        # Clean up original selfie
        os.remove(selfie_path)
        print("Original selfie cleaned up")
    else:
        print("Failed to create Funko Pop transformation")

if __name__ == "__main__":
    main()