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

def generate_card_via_queue(prompt, user_name='', user_id='anonymous', client_ip='unknown', user_number=1, device_id='unknown', display_name=None):
    """
    Generate card via SQS queue - ASYNC VERSION (returns immediately)
    No polling - frontend will poll DynamoDB directly
    """
    try:
        # Generate unique job ID with user correlation
        job_id = str(uuid.uuid4())
        
        # Create display name for user correlation (use provided or create fallback)
        display_name = display_name or f"Test User #{user_number}"
        
        # Create session ID with enhanced naming pattern
        # Format: device_8qgfnm1jxk3_user_001_override1
        session_id = f"device_{device_id}_user_{user_number:03d}_override1"
        
        logger.info(f"🎯 Starting async card generation - Job ID: {job_id} for {display_name}")
        
        # Create job record in DynamoDB with enhanced user correlation
        create_job_record(job_id, {
            'prompt': prompt,
            'user_name': user_name,
            'user_id': user_id,
            'client_ip': client_ip,
            'user_number': user_number,
            'display_name': display_name,
            'device_id': device_id,
            'session_id': session_id,
            'created_at': datetime.now().isoformat()
        })
        
        # Send enhanced message to SQS queue
        queue_message = {
            'job_id': job_id,
            'prompt': prompt,
            'user_name': user_name,
            'user_id': user_id,
            'user_number': user_number,
            'display_name': display_name,
            'device_id': device_id,
            'session_id': session_id
        }
        
        sqs_response = sqs_client.send_message(
            QueueUrl=CARD_GENERATION_QUEUE_URL,
            MessageBody=json.dumps(queue_message)
        )
        
        logger.info(f"📤 Message sent to queue - Message ID: {sqs_response['MessageId']} for {display_name}")
        
        # Return immediately with job info (NO POLLING)
        return {
            'success': True,
            'job_id': job_id,
            'status': 'queued',
            'user_number': user_number,
            'display_name': display_name,
            'device_id': device_id,
            'session_id': session_id,
            'message': f'Card generation started for {display_name}. Please wait...',
            'metadata': {
                'job_id': job_id,
                'generated_via': 'sqs_queue_async',
                'queue_message_id': sqs_response['MessageId']
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Queue-based generation error: {str(e)}")
        return {
            'success': False,
            'error': f"Queue processing failed: {str(e)}"
        }

def create_job_record(job_id, job_data):
    """
    Create initial job record in DynamoDB with enhanced user correlation
    """
    try:
        if not job_table:
            logger.error("❌ Job tracking table not configured")
            return
            
        item = {
            'jobId': job_id,  # Fixed: use correct key name to match table schema
            'status': 'queued',  # Fixed: use consistent status field name (same as queue processor)
            'created_at': job_data.get('created_at', datetime.now().isoformat()),
            'prompt': job_data.get('prompt', ''),
            'user_name': job_data.get('user_name', ''),
            'user_id': job_data.get('user_id', 'anonymous'),
            'client_ip': job_data.get('client_ip', 'unknown'),
            # Enhanced user correlation fields
            'user_number': job_data.get('user_number', 1),
            'display_name': job_data.get('display_name', 'Test User #1'),
            'device_id': job_data.get('device_id', 'unknown'),
            'session_id': job_data.get('session_id', 'unknown_session')
        }
        
        job_table.put_item(Item=item)
        logger.info(f"📊 Job record created for {job_id} - {job_data.get('display_name', 'Unknown User')}")
        
    except Exception as e:
        logger.error(f"❌ Error creating job record: {str(e)}")

def get_job_status(job_id):
    """
    Get job status from DynamoDB (used by frontend polling)
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

def get_cards_for_user(user_number=None, device_id=None, limit=50):
    """
    Get all cards for a specific user or device for frontend polling
    """
    try:
        if not job_table:
            return []
            
        # Scan for completed jobs with user correlation
        scan_params = {
            'FilterExpression': 'attribute_exists(#status) AND #status = :completed',
            'ExpressionAttributeNames': {
                '#status': 'status'
            },
            'ExpressionAttributeValues': {
                ':completed': 'completed'
            },
            'Limit': limit
        }
        
        # Add user-specific filters if provided
        if user_number is not None:
            scan_params['FilterExpression'] += ' AND user_number = :user_number'
            scan_params['ExpressionAttributeValues'][':user_number'] = user_number
            
        if device_id is not None:
            scan_params['FilterExpression'] += ' AND device_id = :device_id'
            scan_params['ExpressionAttributeValues'][':device_id'] = device_id
        
        response = job_table.scan(**scan_params)
        
        # Sort by creation time (newest first)
        cards = sorted(
            response.get('Items', []),
            key=lambda x: x.get('created_at', ''),
            reverse=True
        )
        
        logger.info(f"📊 Retrieved {len(cards)} cards for user_number={user_number}, device_id={device_id}")
        return cards
        
    except Exception as e:
        logger.error(f"❌ Error getting cards for user: {str(e)}")
        return []

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
