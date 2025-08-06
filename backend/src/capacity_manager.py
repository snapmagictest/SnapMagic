"""
🧠 Intelligent Bedrock Capacity Manager
Learns and tracks Bedrock's real capacity to avoid throttling and maintain job order
"""

import json
import time
import boto3
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class BedrockCapacityManager:
    """
    Intelligent capacity manager that learns Bedrock's real limits
    and ensures jobs are processed in order without throttling
    """
    
    def __init__(self, service_name: str = "nova-canvas"):
        self.service_name = service_name
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.table_name = 'bedrock-capacity-state-dev'
        
        # Initialize with conservative defaults
        self.available_slots = 2  # Start conservative
        self.processing_jobs = set()
        self.last_success_time = None
        self.last_throttle_time = None
        self.total_successes = 0
        self.total_throttles = 0
        self.learning_rate = 0.1  # How aggressively to adjust capacity
        
    def load_state(self) -> None:
        """Load capacity state from DynamoDB"""
        try:
            table = self.dynamodb.Table(self.table_name)
            response = table.get_item(Key={'service': self.service_name})
            
            if 'Item' in response:
                item = response['Item']
                self.available_slots = int(item.get('available_slots', 2))
                self.processing_jobs = set(item.get('processing_jobs', []))
                self.last_success_time = item.get('last_success_time')
                self.last_throttle_time = item.get('last_throttle_time')
                self.total_successes = int(item.get('total_successes', 0))
                self.total_throttles = int(item.get('total_throttles', 0))
                
                logger.info(f"🧠 CAPACITY STATE LOADED: {self.available_slots} slots, {len(self.processing_jobs)} processing")
            else:
                logger.info(f"🧠 CAPACITY STATE: Starting fresh with {self.available_slots} slots")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not load capacity state: {e}, using defaults")
    
    def save_state(self) -> None:
        """Save capacity state to DynamoDB"""
        try:
            table = self.dynamodb.Table(self.table_name)
            table.put_item(Item={
                'service': self.service_name,
                'available_slots': self.available_slots,
                'processing_jobs': list(self.processing_jobs),
                'last_success_time': self.last_success_time,
                'last_throttle_time': self.last_throttle_time,
                'total_successes': self.total_successes,
                'total_throttles': self.total_throttles,
                'updated_at': datetime.now().isoformat()
            })
            logger.info(f"💾 CAPACITY STATE SAVED: {self.available_slots} slots")
        except Exception as e:
            logger.error(f"❌ Could not save capacity state: {e}")
    
    def can_process_job(self) -> bool:
        """
        🧠 INTELLIGENT DECISION: Can we process another job right now?
        This is the core intelligence - we KNOW if we have capacity
        """
        current_processing = len(self.processing_jobs)
        can_process = current_processing < self.available_slots
        
        logger.info(f"🧠 CAPACITY CHECK: {current_processing}/{self.available_slots} slots used - {'✅ CAN PROCESS' if can_process else '⏳ AT CAPACITY'}")
        return can_process
    
    def job_started(self, job_id: str) -> None:
        """Mark a job as started processing"""
        self.processing_jobs.add(job_id)
        logger.info(f"🚀 JOB STARTED: {job_id} - Now processing {len(self.processing_jobs)}/{self.available_slots}")
        self.save_state()
    
    def job_completed_success(self, job_id: str) -> None:
        """
        🎉 Job completed successfully - learn from this success
        """
        self.processing_jobs.discard(job_id)
        self.last_success_time = datetime.now().isoformat()
        self.total_successes += 1
        
        # 🧠 LEARNING: If we're consistently successful, maybe we can handle more
        if self.total_successes % 5 == 0:  # Every 5 successes
            old_slots = self.available_slots
            # Cautiously increase capacity
            self.available_slots = min(10, self.available_slots + 1)  # Cap at 10
            if self.available_slots > old_slots:
                logger.info(f"📈 LEARNING: Increased capacity {old_slots} → {self.available_slots} (after {self.total_successes} successes)")
        
        logger.info(f"✅ JOB SUCCESS: {job_id} - Now processing {len(self.processing_jobs)}/{self.available_slots}")
        self.save_state()
    
    def job_completed_throttled(self, job_id: str) -> None:
        """
        🤔 Job was throttled - we were wrong about capacity, learn from this
        """
        self.processing_jobs.discard(job_id)
        self.last_throttle_time = datetime.now().isoformat()
        self.total_throttles += 1
        
        # 🧠 LEARNING: We overestimated capacity, reduce it
        old_slots = self.available_slots
        self.available_slots = max(1, len(self.processing_jobs))  # At least 1, but based on what's actually working
        
        logger.warning(f"📉 LEARNING: Reduced capacity {old_slots} → {self.available_slots} (throttle #{self.total_throttles})")
        logger.warning(f"🤔 THROTTLED: {job_id} - Now processing {len(self.processing_jobs)}/{self.available_slots}")
        self.save_state()
    
    def job_completed_error(self, job_id: str, error: str) -> None:
        """Job failed for non-throttling reasons"""
        self.processing_jobs.discard(job_id)
        logger.error(f"❌ JOB ERROR: {job_id} - {error} - Now processing {len(self.processing_jobs)}/{self.available_slots}")
        self.save_state()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current capacity statistics"""
        return {
            'service': self.service_name,
            'available_slots': self.available_slots,
            'processing_jobs': len(self.processing_jobs),
            'total_successes': self.total_successes,
            'total_throttles': self.total_throttles,
            'success_rate': self.total_successes / max(1, self.total_successes + self.total_throttles),
            'last_success_time': self.last_success_time,
            'last_throttle_time': self.last_throttle_time
        }

def get_capacity_manager() -> BedrockCapacityManager:
    """
    Get a capacity manager instance with current state loaded
    """
    manager = BedrockCapacityManager()
    manager.load_state()
    return manager
