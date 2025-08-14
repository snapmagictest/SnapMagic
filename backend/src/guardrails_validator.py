"""
Amazon Bedrock Guardrails Integration for SnapMagic
AI-powered content filtering and prompt attack detection
"""
import json
import logging
import os
from typing import Tuple, Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class GuardrailsValidator:
    """AI-powered content validation using Amazon Bedrock Guardrails"""
    
    def __init__(self):
        """Initialize Guardrails validator with AWS Bedrock client"""
        try:
            self.bedrock_client = boto3.client('bedrock-runtime')
            self.guardrail_id = os.environ.get('GUARDRAIL_ID')
            self.guardrail_version = os.environ.get('GUARDRAIL_VERSION', '1')
            
            if not self.guardrail_id:
                logger.warning("⚠️ GUARDRAIL_ID not configured - falling back to basic validation")
                self.enabled = False
            else:
                # Extract just the ID from the ARN if needed
                if 'guardrail/' in self.guardrail_id:
                    self.guardrail_id = self.guardrail_id.split('guardrail/')[-1]
                
                self.enabled = True
                logger.info(f"🛡️ Guardrails validator initialized: {self.guardrail_id}")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize Guardrails: {str(e)}")
            self.enabled = False
    
    def validate_prompt(self, prompt: str) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate user prompt using AI-powered Guardrails
        
        Args:
            prompt: User input to validate
            
        Returns:
            Tuple of (is_valid, error_message, guardrail_details)
        """
        if not self.enabled:
            logger.warning("⚠️ Guardrails disabled - using fallback validation")
            return self._fallback_validation(prompt)
        
        if not prompt or not prompt.strip():
            return False, "Prompt cannot be empty", None
        
        try:
            logger.info(f"🛡️ Calling Guardrails API with prompt: {prompt[:50]}...")
            
            # Apply Guardrail to user input with correct format
            response = self.bedrock_client.apply_guardrail(
                guardrailIdentifier=self.guardrail_id,
                guardrailVersion=self.guardrail_version,
                source='INPUT',
                content=[{
                    'text': {
                        'text': prompt.strip()
                    }
                }]
            )
            
            logger.info(f"🛡️ Guardrails API response: action={response.get('action')}")
            
            # Check if Guardrail intervened
            if response.get('action') == 'GUARDRAIL_INTERVENED':
                blocked_reason = self._extract_block_reason(response)
                logger.warning(f"🚫 Guardrail BLOCKED prompt: {blocked_reason}")
                return False, "Your prompt contains inappropriate content. Please revise and try again.", response
            
            logger.info("✅ Prompt PASSED Guardrail validation")
            return True, None, response
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            logger.error(f"❌ Guardrail API error ({error_code}): {error_message}")
            logger.warning("⚠️ Falling back to basic validation due to API error")
            
            if error_code == 'ValidationException':
                # Guardrail configuration issue - fall back to basic validation
                return self._fallback_validation(prompt)
            elif error_code == 'AccessDeniedException':
                logger.error("❌ Guardrail access denied - check permissions")
                return self._fallback_validation(prompt)
            else:
                # For other errors, be conservative and reject
                return False, "Content validation temporarily unavailable", None
                
        except Exception as e:
            logger.error(f"❌ Unexpected Guardrail error: {str(e)}")
            logger.warning("⚠️ Falling back to basic validation due to unexpected error")
            return self._fallback_validation(prompt)
    
    def _extract_block_reason(self, guardrail_response: Dict[str, Any]) -> str:
        """Extract human-readable reason why content was blocked"""
        try:
            assessments = guardrail_response.get('assessments', [])
            if not assessments:
                return "Content policy violation"
            
            assessment = assessments[0]
            reasons = []
            
            # Check content policy violations
            content_policy = assessment.get('contentPolicy', {})
            filters = content_policy.get('filters', [])
            for filter_item in filters:
                filter_type = filter_item.get('type', 'Unknown')
                if filter_type == 'PROMPT_ATTACK':
                    reasons.append("Prompt injection attempt detected")
                elif filter_type == 'SEXUAL':
                    reasons.append("Inappropriate sexual content")
                elif filter_type == 'VIOLENCE':
                    reasons.append("Violent content")
                elif filter_type == 'HATE':
                    reasons.append("Hate speech")
                elif filter_type == 'INSULTS':
                    reasons.append("Offensive language")
                else:
                    reasons.append(f"Content policy violation ({filter_type.lower()})")
            
            # Check topic policy violations
            topic_policy = assessment.get('topicPolicy', {})
            topics = topic_policy.get('topics', [])
            for topic in topics:
                topic_name = topic.get('name', 'Unknown')
                reasons.append(f"Blocked topic: {topic_name}")
            
            # Check word policy violations
            word_policy = assessment.get('wordPolicy', {})
            if word_policy.get('customWords') or word_policy.get('managedWordLists'):
                reasons.append("Inappropriate language detected")
            
            return "; ".join(reasons) if reasons else "Content policy violation"
            
        except Exception as e:
            logger.error(f"❌ Error extracting block reason: {str(e)}")
            return "Content policy violation"
    
    def _fallback_validation(self, prompt: str) -> Tuple[bool, Optional[str], None]:
        """Basic validation when Guardrails is unavailable"""
        logger.warning("🔄 USING FALLBACK VALIDATION - Guardrails not available")
        
        if not prompt or not prompt.strip():
            return False, "Prompt cannot be empty", None
        
        prompt = prompt.strip()
        
        # Basic length validation
        if len(prompt) < 10:
            return False, "Prompt must be at least 10 characters", None
        
        if len(prompt) > 500:
            return False, "Prompt must be less than 500 characters", None
        
        # Basic content filtering (fallback only)
        prompt_lower = prompt.lower()
        blocked_words = ['nude', 'naked', 'kill', 'murder', 'bomb', 'hate']
        for word in blocked_words:
            if word in prompt_lower:
                logger.warning(f"🚫 FALLBACK blocked prompt containing: {word}")
                return False, "Prompt contains inappropriate content", None
        
        logger.info("✅ Prompt passed FALLBACK validation")
        return True, None, None

# Global instance for reuse
_guardrails_validator = None

def get_guardrails_validator() -> GuardrailsValidator:
    """Get singleton Guardrails validator instance"""
    global _guardrails_validator
    if _guardrails_validator is None:
        _guardrails_validator = GuardrailsValidator()
    return _guardrails_validator
