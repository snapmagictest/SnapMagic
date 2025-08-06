"""
SnapMagic Queue Processor Lambda
Processes SQS messages for card generation with 2 concurrent limit
"""

import json
import boto3
import os
import uuid
import base64
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AWS clients
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Environment variables
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
NOVA_CANVAS_MODEL = os.environ.get('NOVA_CANVAS_MODEL', 'amazon.nova-canvas-v1:0')
JOB_TRACKING_TABLE = os.environ.get('JOB_TRACKING_TABLE')
TEMPLATE_EVENT_NAME = os.environ.get('TEMPLATE_EVENT_NAME', 'AWS Event')
TEMPLATE_LOGOS_JSON = os.environ.get('TEMPLATE_LOGOS_JSON', '[]')

# DynamoDB table (conditional initialization for testing)
job_table = None
if JOB_TRACKING_TABLE:
    job_table = dynamodb.Table(JOB_TRACKING_TABLE)
else:
    logger.warning("⚠️ JOB_TRACKING_TABLE not set - DynamoDB operations will be disabled")

def lambda_handler(event, context):
    """
    Process SQS messages for card generation with enhanced user correlation
    Each message contains job details for Nova Canvas generation
    """
    logger.info(f"🎯 Queue Processor: Processing {len(event['Records'])} messages")
    
    for record in event['Records']:
        try:
            # Parse SQS message with enhanced user correlation data
            message_body = json.loads(record['body'])
            job_id = message_body['job_id']
            prompt = message_body['prompt']
            
            # Enhanced user correlation fields
            user_number = message_body.get('user_number', 1)
            display_name = message_body.get('display_name', f'Test User #{user_number}')
            device_id = message_body.get('device_id', 'unknown')
            session_id = message_body.get('session_id', f'{device_id}_user_{user_number:03d}_override1')
            
            logger.info(f"🎴 Processing job {job_id} for {display_name}: {prompt[:50]}...")
            
            # Update job status to processing with enhanced metadata
            update_job_status(job_id, 'processing', {
                'started_at': datetime.now().isoformat(),
                'processor': context.aws_request_id,
                'user_number': user_number,
                'display_name': display_name,
                'device_id': device_id,
                'session_id': session_id
            })
            
            # Generate card with Bedrock Nova Canvas
            card_result = generate_card_with_bedrock(prompt, display_name)
            
            # Create enhanced S3 key with user correlation
            # Format: device_8qgfnm1jxk3_user_001_override1_card_1_20250806_084208.png
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"cards/{session_id}_card_1_{timestamp}.png"
            s3_url = store_card_in_s3(card_result, s3_key)
            
            # Update job status to completed with full correlation data
            update_job_status(job_id, 'completed', {
                's3_url': s3_url,
                's3_key': s3_key,
                'completed_at': datetime.now().isoformat(),
                'processing_time': get_processing_time(job_id),
                'user_number': user_number,
                'display_name': display_name,
                'device_id': device_id,
                'session_id': session_id,
                'card_metadata': {
                    'event_name': TEMPLATE_EVENT_NAME,
                    'user_display_name': display_name,
                    'generation_timestamp': timestamp
                }
                # Note: Not storing 'result' (base64 data) in DynamoDB due to size limits
                # The actual card data is stored in S3 and can be retrieved via s3_url
            })
            
            logger.info(f"✅ Job {job_id} completed successfully for {display_name}")
            
        except Exception as e:
            logger.error(f"❌ Job {job_id} failed: {str(e)}")
            
            # Update job status to failed with user correlation data
            update_job_status(job_id, 'failed', {
                'error': str(e),
                'failed_at': datetime.now().isoformat(),
                'processing_time': get_processing_time(job_id),
                'user_number': message_body.get('user_number', 1),
                'display_name': message_body.get('display_name', 'Unknown User'),
                'device_id': message_body.get('device_id', 'unknown')
            })
            
            # Don't raise exception - let SQS handle retries via DLQ
    
    return {'statusCode': 200, 'body': 'Messages processed'}

def generate_card_with_bedrock(prompt, user_name=''):
    """
    Generate trading card using Bedrock Nova Canvas
    Same logic as main Lambda but isolated for queue processing
    """
    try:
        # Prepare the request payload for Nova Canvas
        request_payload = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": prompt
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "premium",
                "height": 720,
                "width": 1280,
                "cfgScale": 7.0,
                "seed": 42
            }
        }
        
        logger.info(f"🎨 Calling Bedrock Nova Canvas for card generation")
        
        # Call Bedrock Nova Canvas
        response = bedrock_client.invoke_model(
            modelId=NOVA_CANVAS_MODEL,
            body=json.dumps(request_payload),
            contentType='application/json'
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            base64_image = response_body['images'][0]
            logger.info(f"✅ Nova Canvas generated card successfully")
            return base64_image
        else:
            raise Exception("No images returned from Nova Canvas")
            
    except Exception as e:
        logger.error(f"❌ Bedrock Nova Canvas error: {str(e)}")
        raise

def store_card_in_s3(base64_image, s3_key):
    """
    Store generated card in S3 bucket
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(base64_image)
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/png',
            Metadata={
                'generated-by': 'snapmagic-queue-processor',
                'model': NOVA_CANVAS_MODEL,
                'timestamp': datetime.now().isoformat()
            }
        )
        
        # Generate S3 URL
        s3_url = f"https://{S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/{s3_key}"
        logger.info(f"📁 Card stored in S3: {s3_key}")
        
        return s3_url
        
    except Exception as e:
        logger.error(f"❌ S3 storage error: {str(e)}")
        raise

def update_job_status(job_id, status, additional_data=None):
    """
    Update job status in DynamoDB
    """
    try:
        update_data = {
            'job_status': status,  # Changed from 'status' to avoid reserved keyword
            'last_updated': datetime.now().isoformat()
        }
        
        if additional_data:
            update_data.update(additional_data)
        
        # Reserved keywords that need attribute name mapping
        reserved_keywords = {
            'status': '#job_status',
            'result': '#job_result',
            'error': '#job_error'
        }
        
        # Build update expression with attribute names to handle reserved keywords
        update_expression = "SET "
        expression_attribute_names = {}
        expression_attribute_values = {}
        
        for key, value in update_data.items():
            if key == 'job_status':
                # Handle reserved keyword 'status'
                update_expression += "#job_status = :job_status, "
                expression_attribute_names["#job_status"] = "status"
                expression_attribute_values[":job_status"] = value
            elif key in reserved_keywords:
                # Handle other reserved keywords
                attr_name = reserved_keywords[key]
                update_expression += f"{attr_name} = :{key}, "
                expression_attribute_names[attr_name] = key
                expression_attribute_values[f":{key}"] = value
            else:
                # Regular attributes
                update_expression += f"{key} = :{key}, "
                expression_attribute_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(', ')
        
        # Only include ExpressionAttributeNames if we have reserved keywords
        update_params = {
            'Key': {'jobId': job_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_attribute_values
        }
        
        if expression_attribute_names:
            update_params['ExpressionAttributeNames'] = expression_attribute_names
        
        job_table.update_item(**update_params)
        
        logger.info(f"📊 Job {job_id} status updated to: {status}")
        
    except Exception as e:
        logger.error(f"❌ DynamoDB update error for job {job_id}: {str(e)}")
        # Don't raise - job processing should continue even if status update fails

def get_processing_time(job_id):
    """
    Calculate processing time for a job
    """
    try:
        response = job_table.get_item(Key={'jobId': job_id})
        if 'Item' in response:
            created_at = response['Item'].get('created_at')
            if created_at:
                created_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                processing_time = (datetime.now() - created_time).total_seconds()
                return f"{processing_time:.2f}s"
    except:
        pass
    return "unknown"
