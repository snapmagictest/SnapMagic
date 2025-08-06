"""
SQS Queue Integration for SnapMagic Main Lambda
Handles queue submission and fast polling for card generation
"""

import json
import boto3
import os
import uuid
import time
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

# AWS clients
sqs_client = boto3.client('sqs', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3_client = boto3.client('s3')

# Environment variables
CARD_GENERATION_QUEUE_URL = os.environ.get('CARD_GENERATION_QUEUE_URL')
JOB_TRACKING_TABLE = os.environ.get('JOB_TRACKING_TABLE')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

# DynamoDB table
job_table = dynamodb.Table(JOB_TRACKING_TABLE) if JOB_TRACKING_TABLE else None

def generate_card_via_queue(prompt, user_name='', user_id='anonymous', client_ip='unknown'):
    """
    Generate card via SQS queue with fast polling
    Returns card data in same format as direct generation
    """
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        logger.info(f"🎯 Starting queue-based card generation - Job ID: {job_id}")
        
        # Create job record in DynamoDB
        create_job_record(job_id, {
            'prompt': prompt,
            'user_name': user_name,
            'user_id': user_id,
            'client_ip': client_ip,
            'created_at': datetime.now().isoformat()
        })
        
        # Send message to SQS queue
        queue_message = {
            'job_id': job_id,
            'prompt': prompt,
            'user_name': user_name,
            'user_id': user_id
        }
        
        sqs_response = sqs_client.send_message(
            QueueUrl=CARD_GENERATION_QUEUE_URL,
            MessageBody=json.dumps(queue_message)
        )
        
        logger.info(f"📤 Message sent to queue - Message ID: {sqs_response['MessageId']}")
        
        # Fast polling for completion (0.5 second intervals)
        return wait_for_job_completion(job_id, timeout_seconds=10)
        
    except Exception as e:
        logger.error(f"❌ Queue-based generation error: {str(e)}")
        return {
            'success': False,
            'error': f"Queue processing failed: {str(e)}"
        }

def wait_for_job_completion(job_id, timeout_seconds=10):
    """
    Fast polling for job completion
    Checks every 0.5 seconds for up to timeout_seconds
    """
    start_time = time.time()
    check_interval = 0.5  # Check twice per second
    
    logger.info(f"⏱️ Starting fast polling for job {job_id} (timeout: {timeout_seconds}s)")
    
    while time.time() - start_time < timeout_seconds:
        try:
            # Check job status in DynamoDB
            job_status = get_job_status(job_id)
            
            if job_status and job_status.get('status') == 'completed':
                logger.info(f"✅ Job {job_id} completed successfully")
                
                # Get card data from S3
                s3_key = job_status.get('s3_key')
                if s3_key:
                    card_data = get_card_from_s3(s3_key)
                    if card_data:
                        return {
                            'success': True,
                            'result': card_data,  # Base64 image data
                            'imageSrc': f"data:image/png;base64,{card_data}",  # Data URL for frontend
                            'metadata': {
                                'job_id': job_id,
                                's3_url': job_status.get('s3_url'),
                                'processing_time': job_status.get('processing_time', 'unknown'),
                                'generated_via': 'sqs_queue'
                            }
                        }
                
                return {
                    'success': False,
                    'error': 'Card completed but could not retrieve from S3'
                }
                
            elif job_status and job_status.get('status') == 'failed':
                logger.error(f"❌ Job {job_id} failed: {job_status.get('error', 'Unknown error')}")
                return {
                    'success': False,
                    'error': f"Card generation failed: {job_status.get('error', 'Unknown error')}"
                }
            
            # Job still processing, wait and check again
            time.sleep(check_interval)
            
        except Exception as e:
            logger.error(f"❌ Error checking job status: {str(e)}")
            time.sleep(check_interval)
    
    # Timeout reached
    logger.warning(f"⏰ Job {job_id} timed out after {timeout_seconds} seconds")
    return {
        'success': False,
        'error': 'Card generation is taking longer than expected. Please try again.'
    }

def create_job_record(job_id, job_data):
    """
    Create initial job record in DynamoDB
    """
    try:
        if not job_table:
            logger.error("❌ Job tracking table not configured")
            return
            
        item = {
            'jobId': job_id,
            'status': 'queued',
            'created_at': job_data.get('created_at', datetime.now().isoformat()),
            'prompt': job_data.get('prompt', ''),
            'user_name': job_data.get('user_name', ''),
            'user_id': job_data.get('user_id', 'anonymous'),
            'client_ip': job_data.get('client_ip', 'unknown')
        }
        
        job_table.put_item(Item=item)
        logger.info(f"📊 Job record created for {job_id}")
        
    except Exception as e:
        logger.error(f"❌ Error creating job record: {str(e)}")

def get_job_status(job_id):
    """
    Get job status from DynamoDB
    """
    try:
        if not job_table:
            return None
            
        response = job_table.get_item(Key={'jobId': job_id})
        
        if 'Item' in response:
            return response['Item']
        else:
            return None
            
    except Exception as e:
        logger.error(f"❌ Error getting job status: {str(e)}")
        return None

def get_card_from_s3(s3_key):
    """
    Retrieve card data from S3 and return as base64
    """
    try:
        response = s3_client.get_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key
        )
        
        # Read image data and encode as base64
        image_data = response['Body'].read()
        import base64
        base64_data = base64.b64encode(image_data).decode('utf-8')
        
        logger.info(f"📁 Retrieved card from S3: {s3_key}")
        return base64_data
        
    except Exception as e:
        logger.error(f"❌ Error retrieving card from S3: {str(e)}")
        return None

def is_queue_system_available():
    """
    Check if SQS queue system is properly configured
    """
    return (
        CARD_GENERATION_QUEUE_URL is not None and
        JOB_TRACKING_TABLE is not None and
        S3_BUCKET_NAME is not None
    )
