"""
AWS Lambda handler for SnapMagic AI backend
Provides serverless deployment option for the Strands Agents backend
"""

import json
import logging
from typing import Dict, Any
from snapmagic_tools import create_snapmagic_agent

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize SnapMagic agent (cached across Lambda invocations)
snapmagic_agent = None

def get_agent():
    """Get or create SnapMagic agent (singleton pattern for Lambda)"""
    global snapmagic_agent
    if snapmagic_agent is None:
        logger.info("Initializing SnapMagic agent")
        snapmagic_agent = create_snapmagic_agent()
    return snapmagic_agent

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for SnapMagic AI requests
    
    Args:
        event: Lambda event containing the request
        context: Lambda context
        
    Returns:
        Dict: Response with AI result
    """
    try:
        logger.info(f"Received Lambda event: {json.dumps(event, default=str)}")
        
        # Parse request
        if 'body' in event:
            # API Gateway integration
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            # Direct Lambda invocation
            body = event
        
        # Extract request parameters
        action = body.get('action', '')
        query = body.get('query', '')
        prompt = body.get('prompt', '')
        image_base64 = body.get('image_base64', '')
        audio_base64 = body.get('audio_base64', '')
        
        # Get SnapMagic agent
        agent = get_agent()
        
        # Process based on action
        if action == 'transform_image':
            if not prompt or not image_base64:
                return create_error_response("Missing prompt or image data", 400)
            
            result = agent(f"Transform this image: {prompt}. Image: {image_base64[:100]}...")
            
        elif action == 'generate_video':
            if not prompt or not image_base64:
                return create_error_response("Missing prompt or image data", 400)
            
            result = agent(f"Generate video: {prompt}. Source image: {image_base64[:100]}...")
            
        elif action == 'detect_gesture':
            if not image_base64:
                return create_error_response("Missing image data", 400)
            
            result = agent(f"Detect gestures in image: {image_base64[:100]}...")
            
        elif action == 'transcribe_audio':
            if not audio_base64:
                return create_error_response("Missing audio data", 400)
            
            result = agent(f"Transcribe audio: {audio_base64[:100]}...")
            
        elif query:
            # Generic query processing
            result = agent(query)
            
        else:
            return create_error_response("Invalid action or missing query", 400)
        
        # Return successful response
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': True,
                'result': result.message,
                'message': 'Request processed successfully'
            })
        }
        
        logger.info("Request processed successfully")
        return response
        
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

def create_error_response(message: str, status_code: int = 500) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps({
            'success': False,
            'result': '',
            'message': message
        })
    }
