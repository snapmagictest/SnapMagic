"""
SnapMagic Backend - Video Service
Handles video prompt generation and video creation using Amazon Bedrock Nova Reel
"""

import json
import boto3
import base64
from typing import Dict, Any, Optional
from datetime import datetime
from .BaseService import BaseService

class VideoService(BaseService):
    """
    Video service for prompt generation and video creation
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__('VideoService')
        self.config = config
        self.bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.nova_lite_model = config.get('models', {}).get('novaLite', 'amazon.nova-lite-v1:0')
        self.nova_reel_model = config.get('models', {}).get('novaReel', 'amazon.nova-reel-v1:1')
        
    def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process video-related request"""
        action = request_data.get('action')
        
        if action == 'generate_animation_prompt':
            return self._generate_animation_prompt(request_data)
        elif action == 'optimize_animation_prompt':
            return self._optimize_animation_prompt(request_data)
        elif action == 'generate_video':
            return self._generate_video(request_data)
        else:
            return self.create_response(False, error=f"Unknown action: {action}")
    
    def _generate_animation_prompt(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate animation prompt from card image and original prompt"""
        self.log_request('GENERATE_ANIMATION_PROMPT', request_data)
        
        # Validate required fields
        validation_error = self.validate_required_fields(
            request_data, ['card_image', 'original_prompt']
        )
        if validation_error:
            return self.create_response(False, error=validation_error)
        
        try:
            card_image = request_data['card_image']
            original_prompt = self.sanitize_input(request_data['original_prompt'], 500)
            
            # Generate animation prompt using Nova Lite
            animation_prompt = self._create_animation_prompt_with_ai(original_prompt)
            
            return self.create_response(True, {
                'animation_prompt': animation_prompt
            })
            
        except Exception as e:
            self.log_error('GENERATE_ANIMATION_PROMPT', e)
            return self.create_response(False, error=f"Animation prompt generation failed: {str(e)}")
    
    def _optimize_animation_prompt(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing animation prompt"""
        self.log_request('OPTIMIZE_ANIMATION_PROMPT', request_data)
        
        # Validate required fields
        validation_error = self.validate_required_fields(
            request_data, ['user_prompt', 'card_image', 'original_prompt']
        )
        if validation_error:
            return self.create_response(False, error=validation_error)
        
        try:
            user_prompt = self.sanitize_input(request_data['user_prompt'], 200)
            original_prompt = self.sanitize_input(request_data['original_prompt'], 500)
            
            # Optimize prompt using Nova Lite
            optimized_prompt = self._optimize_prompt_with_ai(user_prompt, original_prompt)
            
            return self.create_response(True, {
                'optimized_prompt': optimized_prompt
            })
            
        except Exception as e:
            self.log_error('OPTIMIZE_ANIMATION_PROMPT', e)
            return self.create_response(False, error=f"Prompt optimization failed: {str(e)}")
    
    def _generate_video(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate video using Nova Reel"""
        self.log_request('GENERATE_VIDEO', request_data)
        
        # Validate required fields
        validation_error = self.validate_required_fields(
            request_data, ['card_image', 'animation_prompt']
        )
        if validation_error:
            return self.create_response(False, error=validation_error)
        
        try:
            card_image = request_data['card_image']
            animation_prompt = self.sanitize_input(request_data['animation_prompt'], 200)
            
            # Generate video using Nova Reel
            video_url = self._generate_video_with_nova_reel(card_image, animation_prompt)
            
            return self.create_response(True, {
                'video_url': video_url
            })
            
        except Exception as e:
            self.log_error('GENERATE_VIDEO', e)
            return self.create_response(False, error=f"Video generation failed: {str(e)}")
    
    def _create_animation_prompt_with_ai(self, original_prompt: str) -> str:
        """Create animation prompt using Nova Lite"""
        system_prompt = """
        You are an expert at creating animation prompts for trading card characters.
        Given a character description, create a short, dynamic animation prompt that would
        bring the character to life in a 6-second video.
        
        Focus on:
        - Subtle character movements (breathing, blinking, slight head turns)
        - Environmental effects (wind, particles, lighting changes)
        - Character-appropriate actions
        - Keep it under 50 words
        - Make it engaging but not overly dramatic
        """
        
        user_message = f"Create an animation prompt for this character: {original_prompt}"
        
        request_body = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "inferenceConfig": {
                "maxTokens": 100,
                "temperature": 0.7,
                "topP": 0.9
            }
        }
        
        response = self.bedrock_client.invoke_model(
            modelId=self.nova_lite_model,
            body=json.dumps(request_body),
            contentType='application/json'
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['output']['message']['content'][0]['text'].strip()
    
    def _optimize_prompt_with_ai(self, user_prompt: str, original_prompt: str) -> str:
        """Optimize animation prompt using Nova Lite"""
        system_prompt = """
        You are an expert at optimizing animation prompts for trading card videos.
        Take the user's animation idea and the original character description,
        then create an improved, more specific animation prompt.
        
        Guidelines:
        - Keep it under 50 words
        - Make it technically feasible for video generation
        - Enhance the user's idea while staying true to the character
        - Focus on realistic, subtle movements
        """
        
        user_message = f"""
        Original character: {original_prompt}
        User's animation idea: {user_prompt}
        
        Create an optimized animation prompt:
        """
        
        request_body = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "inferenceConfig": {
                "maxTokens": 100,
                "temperature": 0.7,
                "topP": 0.9
            }
        }
        
        response = self.bedrock_client.invoke_model(
            modelId=self.nova_lite_model,
            body=json.dumps(request_body),
            contentType='application/json'
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['output']['message']['content'][0]['text'].strip()
    
    def _generate_video_with_nova_reel(self, card_image: str, animation_prompt: str) -> str:
        """Generate video using Nova Reel"""
        start_time = datetime.utcnow()
        
        # Convert base64 image to proper format for Nova Reel
        if card_image.startswith('data:image'):
            image_data = card_image.split(',')[1]
        else:
            image_data = card_image
        
        request_body = {
            "taskType": "TEXT_VIDEO",
            "textToVideoParams": {
                "text": animation_prompt,
                "images": [image_data]
            },
            "videoGenerationConfig": {
                "durationSeconds": 6,
                "fps": 24,
                "dimension": "1280x720",
                "seed": None
            }
        }
        
        response = self.bedrock_client.invoke_model(
            modelId=self.nova_reel_model,
            body=json.dumps(request_body),
            contentType='application/json'
        )
        
        response_body = json.loads(response['body'].read())
        
        if 'video' not in response_body:
            raise Exception("No video generated by Nova Reel")
        
        # Store video and return URL (implementation depends on storage solution)
        video_data = response_body['video']
        video_url = self._store_video(video_data)
        
        generation_time = (datetime.utcnow() - start_time).total_seconds()
        self.logger.info(f"✅ Video generated successfully in {generation_time:.2f}s")
        
        return video_url
    
    def _store_video(self, video_data: str) -> str:
        """Store video and return URL"""
        # Implementation depends on storage solution (S3, etc.)
        # For now, return a placeholder URL
        video_id = f"video_{int(datetime.utcnow().timestamp())}"
        return f"https://snapmagic-videos.s3.amazonaws.com/{video_id}.mp4"
