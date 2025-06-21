"""
Professional Action Figure Creation System using AWS Bedrock
Based on successful ChatGPT/DALL-E techniques adapted for Nova Canvas
"""

import json
import boto3
import base64
import random
from typing import Dict, Any, List

class ProfessionalActionFigureGenerator:
    
    def __init__(self):
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.rekognition = boto3.client('rekognition', region_name='us-east-1')
        
    def create_professional_action_figure(self, selfie_base64: str, figure_type: str, username: str) -> str:
        """
        Create professional action figure using proven prompt techniques
        """
        
        # Step 1: Analyze the selfie for better prompting
        person_description = self.analyze_person_features(selfie_base64)
        
        # Step 2: Create detailed prompt based on successful blog post structure
        detailed_prompt = self.create_detailed_prompt(figure_type, person_description, username)
        
        # Step 3: Generate with optimized Nova Canvas settings
        return self.generate_with_nova_canvas(selfie_base64, detailed_prompt)
    
    def analyze_person_features(self, image_base64: str) -> Dict[str, Any]:
        """
        Use Rekognition to analyze person features for better prompting
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_base64)
            
            # Analyze with Rekognition
            response = self.rekognition.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if not response['FaceDetails']:
                return self.get_default_features()
            
            face = response['FaceDetails'][0]
            
            # Extract key features
            features = {
                'gender': face.get('Gender', {}).get('Value', 'Person'),
                'age_range': face.get('AgeRange', {}),
                'has_beard': face.get('Beard', {}).get('Value', False),
                'has_mustache': face.get('Mustache', {}).get('Value', False),
                'has_glasses': face.get('Eyeglasses', {}).get('Value', False),
                'has_sunglasses': face.get('Sunglasses', {}).get('Value', False),
                'smile': face.get('Smile', {}).get('Value', False),
                'emotions': face.get('Emotions', [])
            }
            
            return features
            
        except Exception as e:
            print(f"Rekognition analysis failed: {e}")
            return self.get_default_features()
    
    def get_default_features(self) -> Dict[str, Any]:
        """Default features when analysis fails"""
        return {
            'gender': 'Person',
            'has_beard': False,
            'has_mustache': False,
            'has_glasses': False,
            'has_sunglasses': False,
            'smile': True
        }
    
    def create_detailed_prompt(self, figure_type: str, person_features: Dict[str, Any], username: str) -> str:
        """
        Create detailed prompt based on successful blog post techniques
        """
        
        # Base person description with features
        person_desc = self.build_person_description(person_features)
        
        # Figure type specific details
        figure_details = self.get_figure_type_details(figure_type)
        
        # Create the winning prompt structure from the blog post
        prompt = f"""Create a photorealistic action figure set in a toy-style plastic blister box. 
Include 1 person: {person_desc} {figure_details['outfit']}. 
Place accessories next to them: {figure_details['accessories']}. 
The box should be {figure_details['box_color']} with a {figure_details['logo']}. 
Add text: '{figure_details['main_title']}' at the top, and '{username} {figure_details['subtitle']}' below. 
Make the packaging look shiny and realistic with a hanging hook."""
        
        return prompt
    
    def build_person_description(self, features: Dict[str, Any]) -> str:
        """Build person description from Rekognition features"""
        
        desc_parts = []
        
        # Gender
        if features['gender'].lower() == 'male':
            desc_parts.append("a man")
        elif features['gender'].lower() == 'female':
            desc_parts.append("a woman")
        else:
            desc_parts.append("a person")
        
        # Facial features
        if features['has_glasses']:
            desc_parts.append("wearing glasses")
        if features['has_beard']:
            desc_parts.append("with a beard")
        if features['has_mustache']:
            desc_parts.append("with a mustache")
        
        return " ".join(desc_parts)
    
    def get_figure_type_details(self, figure_type: str) -> Dict[str, str]:
        """
        Get detailed specifications for each figure type
        Based on successful action figure creation techniques
        """
        
        figure_specs = {
            'construction-worker': {
                'outfit': 'in construction worker outfit with hard hat, safety vest, work boots, and tool belt',
                'accessories': 'hammer, wrench, measuring tape, safety goggles, and a small ladder',
                'box_color': 'bright orange',
                'logo': 'construction helmet logo',
                'main_title': 'CONSTRUCTION HERO',
                'subtitle': 'Builder Edition'
            },
            'superhero': {
                'outfit': 'in superhero costume with cape, mask, and heroic pose',
                'accessories': 'shield, utility belt, communication device, and power symbol',
                'box_color': 'electric blue',
                'logo': 'lightning bolt logo',
                'main_title': 'SUPER HERO',
                'subtitle': 'Action Figure'
            },
            'chef': {
                'outfit': 'in chef uniform with white hat, apron, and professional attire',
                'accessories': 'spatula, whisk, chef knife, mixing bowl, and recipe book',
                'box_color': 'warm red',
                'logo': 'chef hat logo',
                'main_title': 'MASTER CHEF',
                'subtitle': 'Culinary Expert'
            },
            'doctor': {
                'outfit': 'in medical scrubs with stethoscope and professional appearance',
                'accessories': 'medical bag, clipboard, thermometer, and prescription pad',
                'box_color': 'medical white',
                'logo': 'medical cross logo',
                'main_title': 'DOCTOR HERO',
                'subtitle': 'Medical Professional'
            },
            'firefighter': {
                'outfit': 'in firefighter uniform with helmet, protective gear, and boots',
                'accessories': 'fire hose, axe, oxygen tank, and emergency radio',
                'box_color': 'fire engine red',
                'logo': 'fire department badge',
                'main_title': 'FIRE RESCUE',
                'subtitle': 'Emergency Hero'
            },
            'police': {
                'outfit': 'in police uniform with badge, hat, and professional appearance',
                'accessories': 'radio, handcuffs, notepad, and police car keys',
                'box_color': 'police blue',
                'logo': 'police badge logo',
                'main_title': 'POLICE OFFICER',
                'subtitle': 'Law Enforcement'
            },
            'astronaut': {
                'outfit': 'in space suit with helmet, life support system, and space boots',
                'accessories': 'space helmet, communication device, space tools, and mission patch',
                'box_color': 'space black',
                'logo': 'NASA-style logo',
                'main_title': 'SPACE EXPLORER',
                'subtitle': 'Astronaut Mission'
            },
            'pilot': {
                'outfit': 'in pilot uniform with captain hat, wings badge, and professional attire',
                'accessories': 'flight manual, headset, aviator sunglasses, and flight bag',
                'box_color': 'sky blue',
                'logo': 'pilot wings logo',
                'main_title': 'CAPTAIN PILOT',
                'subtitle': 'Aviation Professional'
            }
        }
        
        return figure_specs.get(figure_type, figure_specs['construction-worker'])
    
    def generate_with_nova_canvas(self, image_base64: str, detailed_prompt: str) -> str:
        """
        Generate action figure using Nova Canvas with optimized settings
        """
        try:
            # Clean the base64 data
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Optimized payload for professional results
            payload = {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": detailed_prompt,
                    "images": [image_base64],
                    "similarityStrength": 0.85  # Balanced for face preservation + creativity
                },
                "imageGenerationConfig": {
                    "seed": random.randint(0, 858993460),
                    "quality": "premium",
                    "width": 1024,   # High resolution for professional look
                    "height": 1024,  # Square format for packaging
                    "numberOfImages": 1,
                    "cfgScale": 6.0  # Optimal for detailed prompts
                }
            }
            
            print(f"🎨 Generating professional action figure with prompt: {detailed_prompt[:100]}...")
            
            # Call Nova Canvas
            response = self.bedrock_runtime.invoke_model(
                modelId="amazon.nova-canvas-v1:0",
                body=json.dumps(payload)
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            if 'images' in response_body and len(response_body['images']) > 0:
                transformed_image = response_body['images'][0]
                print(f"✅ Professional action figure generated successfully: {len(transformed_image)} characters")
                return transformed_image
            else:
                print("❌ No images returned from Nova Canvas")
                return "Error: No transformed image returned from Bedrock"
                
        except Exception as e:
            print(f"❌ Nova Canvas generation error: {str(e)}")
            return f"Error: Professional action figure generation failed - {str(e)}"

# Alternative approach using Claude for prompt optimization
class ClaudeEnhancedActionFigureGenerator:
    
    def __init__(self):
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    def create_claude_enhanced_figure(self, selfie_base64: str, figure_type: str, username: str) -> str:
        """
        Use Claude to analyze the selfie and create optimized prompts
        """
        
        # Step 1: Use Claude to analyze the selfie and create optimal prompt
        optimized_prompt = self.get_claude_optimized_prompt(selfie_base64, figure_type, username)
        
        # Step 2: Generate with Nova Canvas using Claude's optimized prompt
        return self.generate_with_optimized_prompt(selfie_base64, optimized_prompt)
    
    def get_claude_optimized_prompt(self, image_base64: str, figure_type: str, username: str) -> str:
        """
        Use Claude to create the perfect action figure prompt
        """
        
        claude_analysis_prompt = f"""
        Analyze this selfie and create the perfect prompt for generating a professional action figure toy.
        
        Requirements:
        - Figure type: {figure_type}
        - Username: {username}
        - Must be in plastic blister packaging like real toys
        - Include relevant accessories for the profession
        - Preserve the person's key facial features
        - Use the successful format: "Create a photorealistic action figure set in a toy-style plastic blister box..."
        
        Focus on:
        1. Accurate description of the person's appearance
        2. Professional {figure_type} outfit and accessories
        3. Attractive packaging design with colors and text
        4. Realistic toy photography style
        
        Return only the optimized prompt, nothing else.
        """
        
        try:
            # Call Claude 3.7 Sonnet with vision
            response = self.bedrock_runtime.invoke_model(
                modelId="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 300,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": claude_analysis_prompt},
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": "image/jpeg",
                                        "data": image_base64
                                    }
                                }
                            ]
                        }
                    ]
                })
            )
            
            # Parse Claude's response
            response_body = json.loads(response['body'].read())
            optimized_prompt = response_body['content'][0]['text'].strip()
            
            print(f"🤖 Claude optimized prompt: {optimized_prompt[:100]}...")
            return optimized_prompt
            
        except Exception as e:
            print(f"❌ Claude analysis failed: {e}")
            # Fallback to basic prompt
            return f"Create a photorealistic {figure_type} action figure toy in blister packaging"
    
    def generate_with_optimized_prompt(self, image_base64: str, optimized_prompt: str) -> str:
        """
        Generate using Claude's optimized prompt
        """
        # Same generation logic as above but with Claude's optimized prompt
        # ... (implementation similar to generate_with_nova_canvas)
        pass

# Usage example for Lambda integration
def lambda_handler_enhanced(event, context):
    """
    Enhanced Lambda handler with professional action figure generation
    """
    
    # Initialize the professional generator
    generator = ProfessionalActionFigureGenerator()
    
    # Extract parameters
    figure_type = event.get('figure_type', 'construction-worker')
    selfie_base64 = event.get('image_base64', '')
    username = event.get('username', 'Hero')
    
    # Generate professional action figure
    result = generator.create_professional_action_figure(
        selfie_base64=selfie_base64,
        figure_type=figure_type,
        username=username
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'result': result,
            'message': 'Professional action figure created successfully'
        })
    }
