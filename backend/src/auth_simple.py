"""
Simple authentication module for SnapMagic without JWT dependencies
For testing basic authentication flow
"""

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple
import secrets
import hashlib
import base64

logger = logging.getLogger(__name__)

class SnapMagicAuthSimple:
    """Simple authentication handler for SnapMagic events without JWT"""
    
    def __init__(self):
        # Get credentials from environment variables (set by CDK deployment)
        import os
        username = os.environ.get('SNAPMAGIC_USERNAME', 'demo')
        password = os.environ.get('SNAPMAGIC_PASSWORD', 'demo')
        
        self.valid_credentials = {
            username: password
        }
    
    def validate_login(self, username: str, password: str) -> bool:
        """Validate login credentials"""
        return (username in self.valid_credentials and 
                self.valid_credentials[username] == password)
    
    def generate_token(self, username: str, session_id: str = None) -> str:
        """Generate simple token (base64 encoded data for testing)"""
        if not session_id:
            session_id = secrets.token_urlsafe(16)
        
        # Simple token payload (not secure, just for testing)
        payload = {
            'username': username,
            'session_id': session_id,
            'event': 'snapmagic-summit',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'expires': (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }
        
        # Base64 encode the payload (NOT SECURE - just for testing)
        token_data = json.dumps(payload)
        token = base64.b64encode(token_data.encode()).decode()
        
        logger.info(f"Generated simple token for user: {username}, session: {session_id}")
        return token
    
    def validate_token(self, token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """Validate simple token"""
        try:
            # Decode base64 token
            token_data = base64.b64decode(token.encode()).decode()
            payload = json.loads(token_data)
            
            # Check expiry
            expires = datetime.fromisoformat(payload.get('expires', ''))
            if datetime.now(timezone.utc) > expires:
                logger.warning("Token has expired")
                return False, None
            
            # Additional validation
            if payload.get('event') != 'snapmagic-summit':
                logger.warning("Invalid event in token")
                return False, None
            
            logger.info(f"Valid token for user: {payload.get('username')}")
            return True, payload
            
        except Exception as e:
            logger.warning(f"Token validation error: {str(e)}")
            return False, None
    
    def extract_token_from_headers(self, headers: Dict[str, str]) -> Optional[str]:
        """Extract token from request headers"""
        # Check Authorization header
        auth_header = headers.get('Authorization') or headers.get('authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Check X-Auth-Token header as fallback
        return headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    def create_auth_response(self, success: bool, message: str, token: str = None, 
                           status_code: int = 200) -> Dict[str, Any]:
        """Create standardized authentication response"""
        response_body = {
            'success': success,
            'message': message
        }
        
        if token:
            response_body['token'] = token
            response_body['expires_in'] = 24 * 3600  # 24 hours in seconds
        
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token'
            },
            'body': json.dumps(response_body)
        }

# Global auth instance
auth = SnapMagicAuthSimple()
