"""
SnapMagic Backend - Authentication Service
Handles user authentication and JWT token management
"""

import json
import base64
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from .BaseService import BaseService

class AuthService(BaseService):
    """
    Authentication service for SnapMagic
    Handles login, token generation, and user validation
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__('AuthService')
        self.config = config
        self.valid_credentials = {
            config.get('username', 'demo'): config.get('password', 'demo')
        }
        self.override_code = config.get('overrideCode', 'snap')
        
    def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process authentication request"""
        self.log_request('LOGIN', request_data)
        
        # Validate required fields
        validation_error = self.validate_required_fields(request_data, ['username', 'password'])
        if validation_error:
            return self.create_response(False, error=validation_error)
        
        username = self.sanitize_input(request_data['username'], 50)
        password = request_data['password']  # Don't sanitize passwords
        
        # Authenticate user
        if self._authenticate_user(username, password):
            token_data = self._generate_token(username)
            usage_limits = self._get_usage_limits()
            
            return self.create_response(True, {
                'message': 'Login successful',
                'token': token_data['token'],
                'expires_in': token_data['expires_in'],
                'user': {'username': username},
                'remaining': usage_limits,
                'client_ip': self._generate_client_ip()
            })
        else:
            return self.create_response(False, error='Invalid credentials')
    
    def _authenticate_user(self, username: str, password: str) -> bool:
        """Authenticate user credentials"""
        # Check normal credentials
        if username in self.valid_credentials:
            return self.valid_credentials[username] == password
        
        # Check override code
        if password == self.override_code:
            return True
            
        return False
    
    def _generate_token(self, username: str) -> Dict[str, Any]:
        """Generate JWT-like token"""
        session_id = self._generate_session_id()
        issued_at = datetime.utcnow()
        expires_at = issued_at + timedelta(hours=24)
        
        token_payload = {
            'username': username,
            'session_id': session_id,
            'event': 'snapmagic-trading-cards',
            'issued_at': issued_at.isoformat() + '+00:00',
            'expires_at': expires_at.isoformat() + '+00:00',
            'permissions': ['card_generation', 'video_animation']
        }
        
        # Simple base64 encoding (in production, use proper JWT)
        token = base64.b64encode(json.dumps(token_payload).encode()).decode()
        
        return {
            'token': token,
            'expires_in': 86400  # 24 hours in seconds
        }
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return secrets.token_urlsafe(16)
    
    def _generate_client_ip(self) -> str:
        """Generate fallback client IP"""
        timestamp = int(datetime.utcnow().timestamp())
        random_suffix = secrets.token_hex(6)
        return f"fallback_{timestamp}_{random_suffix}"
    
    def _get_usage_limits(self) -> Dict[str, int]:
        """Get user usage limits"""
        return {
            'cards': self.config.get('limits', {}).get('cardsPerUser', 5),
            'videos': self.config.get('limits', {}).get('videosPerUser', 3),
            'prints': self.config.get('limits', {}).get('printsPerUser', 1)
        }
    
    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate and decode token"""
        try:
            decoded = base64.b64decode(token).decode()
            token_data = json.loads(decoded)
            
            # Check expiration
            expires_at = datetime.fromisoformat(token_data['expires_at'].replace('+00:00', ''))
            if datetime.utcnow() > expires_at:
                return None
                
            return token_data
        except Exception as e:
            self.log_error('TOKEN_VALIDATION', e)
            return None
