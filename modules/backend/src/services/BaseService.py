"""
SnapMagic Backend - Base Service Class
Abstract base class for all backend services
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json
import logging
from datetime import datetime

class BaseService(ABC):
    """
    Abstract base class for all SnapMagic services
    Provides common functionality and enforces service interface
    """
    
    def __init__(self, logger_name: str):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(logging.INFO)
        
    def create_response(self, success: bool, data: Optional[Dict[str, Any]] = None, 
                       error: Optional[str] = None) -> Dict[str, Any]:
        """Create standardized API response"""
        response = {
            'success': success,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        if data:
            response.update(data)
        if error:
            response['error'] = error
            
        return response
    
    def log_request(self, action: str, request_data: Dict[str, Any]):
        """Log incoming request"""
        self.logger.info(f"🔄 {action} request received", extra={
            'action': action,
            'request_size': len(json.dumps(request_data))
        })
    
    def log_response(self, action: str, success: bool, duration: float):
        """Log response"""
        status = "✅" if success else "❌"
        self.logger.info(f"{status} {action} completed in {duration:.2f}s", extra={
            'action': action,
            'success': success,
            'duration': duration
        })
    
    def log_error(self, action: str, error: Exception):
        """Log error"""
        self.logger.error(f"❌ {action} failed: {str(error)}", extra={
            'action': action,
            'error_type': type(error).__name__,
            'error_message': str(error)
        })
    
    @abstractmethod
    def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process service request - must be implemented by subclasses"""
        pass
    
    def validate_required_fields(self, data: Dict[str, Any], required_fields: list) -> Optional[str]:
        """Validate required fields in request data"""
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            return f"Missing required fields: {', '.join(missing_fields)}"
        return None
    
    def sanitize_input(self, text: str, max_length: int = 1000) -> str:
        """Sanitize text input"""
        if not isinstance(text, str):
            return ""
        
        # Remove potentially harmful characters
        sanitized = text.strip()
        
        # Truncate if too long
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
            
        return sanitized
