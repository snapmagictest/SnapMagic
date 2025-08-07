"""
SnapMagic Simple Authentication Module
Lightweight authentication system for AWS Summit events without external JWT dependencies
"""

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple
import secrets
import base64

# Configure logging
logger = logging.getLogger(__name__)

class SnapMagicAuthenticationHandler:
    """
    Simple authentication handler for SnapMagic trading card events
    
    Provides basic token-based authentication suitable for AWS Summit demonstrations
    without requiring external JWT libraries or complex authentication infrastructure.
    """
    
    # Class constants
    EVENT_IDENTIFIER = 'snapmagic-trading-cards'
    TOKEN_EXPIRY_HOURS = 24
    SESSION_ID_LENGTH = 16
    
    def __init__(self):
        """
        Initialize authentication handler with event credentials
        
        Credentials are loaded from environment variables set by CDK deployment
        """
        # Load event credentials from environment variables (no fallbacks)
        self.event_username = os.environ.get('EVENT_USERNAME')
        self.event_password = os.environ.get('EVENT_PASSWORD')
        
        if not self.event_username or not self.event_password:
            raise ValueError("EVENT_USERNAME and EVENT_PASSWORD environment variables must be set")
        
        # Store valid credentials for validation
        self.valid_event_credentials = {
            self.event_username: self.event_password
        }
        
        logger.info(f"🔐 SnapMagicAuthenticationHandler initialized for user: {self.event_username}")
    
    def validate_login_credentials(self, username: str, password: str) -> bool:
        """
        Validate user login credentials against event credentials
        
        Args:
            username: Provided username
            password: Provided password
            
        Returns:
            True if credentials are valid, False otherwise
        """
        is_valid = (username in self.valid_event_credentials and 
                   self.valid_event_credentials[username] == password)
        
        if is_valid:
            logger.info(f"✅ Login credentials validated for user: {username}")
        else:
            logger.warning(f"❌ Invalid login credentials for user: {username}")
            
        return is_valid
    
    def generate_token(self, username: str, session_id: Optional[str] = None) -> str:
        """
        Generate authentication token for validated user
        
        Args:
            username: Authenticated username
            session_id: Optional session identifier (generated if not provided)
            
        Returns:
            Base64 encoded authentication token
        """
        if not session_id:
            session_id = secrets.token_urlsafe(self.SESSION_ID_LENGTH)
        
        # Create token payload with user and session information
        current_time = datetime.now(timezone.utc)
        expiry_time = current_time + timedelta(hours=self.TOKEN_EXPIRY_HOURS)
        
        token_payload = {
            'username': username,
            'session_id': session_id,
            'event': self.EVENT_IDENTIFIER,
            'issued_at': current_time.isoformat(),
            'expires_at': expiry_time.isoformat(),
            'permissions': ['card_generation', 'video_animation']
        }
        
        # Encode token payload as base64 (simple encoding for demo purposes)
        token_json = json.dumps(token_payload)
        encoded_token = base64.b64encode(token_json.encode()).decode()
        
        logger.info(f"🎫 Generated authentication token for user: {username}, session: {session_id}")
        return encoded_token
    
    def validate_token(self, auth_token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Validate authentication token and extract payload
        
        Args:
            auth_token: Base64 encoded authentication token
            
        Returns:
            Tuple of (is_valid, token_payload)
        """
        try:
            # Decode base64 token
            token_json = base64.b64decode(auth_token.encode()).decode()
            token_payload = json.loads(token_json)
            
            # Validate token expiry
            expiry_time = datetime.fromisoformat(token_payload.get('expires_at', ''))
            current_time = datetime.now(timezone.utc)
            
            if current_time > expiry_time:
                logger.warning("❌ Authentication token has expired")
                return False, None
            
            # Validate event identifier
            if token_payload.get('event') != self.EVENT_IDENTIFIER:
                logger.warning("❌ Invalid event identifier in token")
                return False, None
            
            # Validate username exists in valid credentials
            username = token_payload.get('username', '')
            if username not in self.valid_event_credentials:
                logger.warning(f"❌ Invalid username in token: {username}")
                return False, None
            
            logger.info(f"✅ Valid authentication token for user: {username}")
            return True, token_payload
            
        except Exception as e:
            logger.warning(f"❌ Token validation error: {str(e)}")
            return False, None
    
    def extract_token_from_headers(self, request_headers: Dict[str, str]) -> Optional[str]:
        """
        Extract authentication token from HTTP request headers
        
        Args:
            request_headers: HTTP request headers dictionary
            
        Returns:
            Authentication token string or None if not found
        """
        # Check Authorization header with Bearer format
        auth_header = request_headers.get('Authorization') or request_headers.get('authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Check X-Auth-Token header as alternative
        return request_headers.get('X-Auth-Token') or request_headers.get('x-auth-token')
    
    def create_authentication_response(self, success: bool, message: str, 
                                     auth_token: Optional[str] = None, 
                                     username: Optional[str] = None,
                                     status_code: int = 200) -> Dict[str, Any]:
        """
        Create standardized authentication response
        
        Args:
            success: Whether authentication was successful
            message: Response message
            auth_token: Authentication token (if successful)
            username: Authenticated username (if successful)
            status_code: HTTP status code
            
        Returns:
            Standardized authentication response dictionary
        """
        response_data = {
            'success': success,
            'message': message
        }
        
        if success and auth_token:
            response_data.update({
                'token': auth_token,
                'expires_in': self.TOKEN_EXPIRY_HOURS * 3600,  # Convert to seconds
                'user': {'username': username} if username else None
            })
        
        return {
            'statusCode': status_code,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Auth-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response_data)
        }
    
    def get_token_info(self, auth_token: str) -> Optional[Dict[str, Any]]:
        """
        Get information from authentication token without full validation
        
        Args:
            auth_token: Authentication token
            
        Returns:
            Token information dictionary or None if invalid
        """
        try:
            token_json = base64.b64decode(auth_token.encode()).decode()
            token_payload = json.loads(token_json)
            
            return {
                'username': token_payload.get('username'),
                'session_id': token_payload.get('session_id'),
                'issued_at': token_payload.get('issued_at'),
                'expires_at': token_payload.get('expires_at'),
                'permissions': token_payload.get('permissions', [])
            }
            
        except Exception as e:
            logger.warning(f"❌ Error extracting token info: {str(e)}")
            return None


# Maintain backward compatibility with old class name
SnapMagicAuthSimple = SnapMagicAuthenticationHandler
