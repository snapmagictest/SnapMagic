"""
SnapMagic Backend - Main Lambda Handler
Orchestrates all services and handles API Gateway requests
"""

import json
import logging
import time
from typing import Dict, Any, Optional

# Import services
from services.AuthService import AuthService
from services.CardService import CardService
from services.VideoService import VideoService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SnapMagicHandler:
    """
    Main handler class that orchestrates all SnapMagic services
    """
    
    def __init__(self):
        # Load configuration (in production, load from environment/secrets)
        self.config = self._load_config()
        
        # Initialize services
        self.auth_service = AuthService(self.config.get('app', {}))
        self.card_service = CardService(self.config)
        self.video_service = VideoService(self.config)
        
        logger.info("✅ SnapMagic services initialized")
    
    def handle_request(self, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """
        Main request handler for Lambda
        """
        start_time = time.time()
        
        try:
            # Parse request
            request_data = self._parse_request(event)
            path = event.get('path', '')
            method = event.get('httpMethod', 'GET')
            
            logger.info(f"🔄 {method} {path} - Processing request")
            
            # Route request to appropriate service
            if path == '/api/login':
                response_data = self.auth_service.process_request(request_data)
            elif path == '/api/transform-card':
                response_data = self._handle_transform_card(request_data)
            elif path == '/api/health':
                response_data = self._handle_health_check()
            else:
                response_data = {
                    'success': False,
                    'error': f'Unknown endpoint: {path}'
                }
            
            # Create API Gateway response
            response = self._create_api_response(200, response_data)
            
            # Log completion
            duration = time.time() - start_time
            status = "✅" if response_data.get('success') else "❌"
            logger.info(f"{status} {method} {path} completed in {duration:.2f}s")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Request failed: {str(e)}")
            error_response = {
                'success': False,
                'error': 'Internal server error',
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }
            return self._create_api_response(500, error_response)
    
    def _handle_transform_card(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle /api/transform-card requests"""
        action = request_data.get('action')
        
        if action == 'generate_card':
            return self.card_service.process_request(request_data)
        elif action in ['generate_animation_prompt', 'optimize_animation_prompt', 'generate_video']:
            return self.video_service.process_request(request_data)
        else:
            return {
                'success': False,
                'error': f'Unknown action: {action}'
            }
    
    def _handle_health_check(self) -> Dict[str, Any]:
        """Handle health check requests"""
        return {
            'success': True,
            'status': 'healthy',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'services': {
                'auth': 'operational',
                'card_generation': 'operational',
                'video_generation': 'operational'
            }
        }
    
    def _parse_request(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Lambda event to extract request data"""
        try:
            if event.get('body'):
                return json.loads(event['body'])
            else:
                return event.get('queryStringParameters', {}) or {}
        except json.JSONDecodeError:
            return {}
    
    def _create_api_response(self, status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
        """Create API Gateway response"""
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps(body)
        }
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from secrets.json or environment"""
        try:
            # In production, load from AWS Secrets Manager or environment variables
            # For now, return default configuration
            return {
                'app': {
                    'username': 'demo',
                    'password': 'demo',
                    'overrideCode': 'snap',
                    'limits': {
                        'cardsPerUser': 5,
                        'videosPerUser': 3,
                        'printsPerUser': 1
                    }
                },
                'models': {
                    'novaCanvas': 'amazon.nova-canvas-v1:0',
                    'novaReel': 'amazon.nova-reel-v1:1',
                    'novaLite': 'amazon.nova-lite-v1:0'
                },
                'cardTemplate': {
                    'eventName': 'JNB Summit 2025'
                }
            }
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            return {}

# Global handler instance
handler_instance = SnapMagicHandler()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entry point
    """
    return handler_instance.handle_request(event, context)
