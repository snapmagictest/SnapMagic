"""
SnapMagic Queue Processor Lambda
Processes SQS messages for card generation with 2 concurrent limit
"""

print("🔧 Queue Processor: Starting imports...")

import json
print("✅ json imported")

import boto3
print("✅ boto3 imported")

import os
print("✅ os imported")

import uuid
print("✅ uuid imported")

import base64
print("✅ base64 imported")

from datetime import datetime
print("✅ datetime imported")

import logging
print("✅ logging imported")

print("🔧 Queue Processor: All imports successful, configuring logging...")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("🔧 Queue Processor: Logging configured, initializing AWS clients...")

# AWS clients
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
print("✅ bedrock_client initialized")

s3_client = boto3.client('s3')
print("✅ s3_client initialized")

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
print("✅ dynamodb resource initialized")

print("🔧 Queue Processor: Loading environment variables...")

# Environment variables
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
NOVA_CANVAS_MODEL = os.environ.get('NOVA_CANVAS_MODEL', 'amazon.nova-canvas-v1:0')
JOB_TRACKING_TABLE = os.environ.get('JOB_TRACKING_TABLE')
TEMPLATE_EVENT_NAME = os.environ.get('TEMPLATE_EVENT_NAME', 'AWS Event')
TEMPLATE_LOGOS_JSON = os.environ.get('TEMPLATE_LOGOS_JSON', '[]')

print(f"✅ Environment variables loaded:")
print(f"   S3_BUCKET_NAME: {S3_BUCKET_NAME}")
print(f"   NOVA_CANVAS_MODEL: {NOVA_CANVAS_MODEL}")
print(f"   JOB_TRACKING_TABLE: {JOB_TRACKING_TABLE}")

print("🔧 Queue Processor: Initializing DynamoDB table...")

# DynamoDB table (conditional initialization for testing)
job_table = None
if JOB_TRACKING_TABLE:
    job_table = dynamodb.Table(JOB_TRACKING_TABLE)
    print(f"✅ DynamoDB table initialized: {JOB_TRACKING_TABLE}")
else:
    print("⚠️ JOB_TRACKING_TABLE not set - DynamoDB operations will be disabled")

print("🎉 Queue Processor: Initialization complete!")

def lambda_handler(event, context):
    """
    Process SQS messages for card generation with enhanced user correlation
    Each message contains job details for Nova Canvas generation
    """
    try:
        logger.info(f"🚀 Queue Processor Lambda started - Request ID: {context.aws_request_id}")
        logger.info(f"📥 Received event: {json.dumps(event, default=str)}")
        
        # Check if we have SQS records
        if 'Records' not in event:
            logger.error("❌ No 'Records' found in event - this should be an SQS event")
            return {'statusCode': 400, 'body': 'Invalid event structure'}
        
        records = event['Records']
        logger.info(f"🎯 Queue Processor: Processing {len(records)} messages")
        
        for i, record in enumerate(records):
            try:
                logger.info(f"📝 Processing record {i+1}/{len(records)}")
                logger.info(f"📝 Record structure: {json.dumps(record, default=str)}")
                
                # Parse SQS message with enhanced user correlation data
                message_body = json.loads(record['body'])
                logger.info(f"📝 Message body: {json.dumps(message_body, default=str)}")
                
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
                    'user_number': user_number,
                    'display_name': display_name,
                    'device_id': device_id,
                    'session_id': session_id,
                    'started_at': datetime.now().isoformat()
                })
                
                # Generate card with Nova Canvas
                result = generate_card_with_bedrock(prompt, job_id, session_id, user_number, display_name, device_id)
                
                if result['success']:
                    logger.info(f"✅ Job {job_id} completed successfully for {display_name}")
                    # Update job status to completed with enhanced metadata
                    update_job_status(job_id, 'completed', {
                        'user_number': user_number,
                        'display_name': display_name,
                        'device_id': device_id,
                        'session_id': session_id,
                        's3_url': result['s3_url'],
                        's3_key': result['s3_key'],
                        'completed_at': datetime.now().isoformat()
                    })
                else:
                    logger.error(f"❌ Job {job_id} failed for {display_name}: {result['error']}")
                    # Update job status to failed with enhanced metadata
                    update_job_status(job_id, 'failed', {
                        'user_number': user_number,
                        'display_name': display_name,
                        'device_id': device_id,
                        'session_id': session_id,
                        'error': result['error'],
                        'failed_at': datetime.now().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"❌ Error processing record {i+1}: {str(e)}")
                logger.error(f"❌ Record content: {json.dumps(record, default=str)}")
                # Try to update job status if we can extract job_id
                try:
                    message_body = json.loads(record['body'])
                    job_id = message_body.get('job_id')
                    if job_id:
                        update_job_status(job_id, 'failed', {
                            'error': f'Processing error: {str(e)}',
                            'failed_at': datetime.now().isoformat()
                        })
                except:
                    logger.error(f"❌ Could not update job status for failed record")
                continue
        
        logger.info(f"✅ Queue Processor completed processing {len(records)} messages")
        return {'statusCode': 200, 'body': f'Processed {len(records)} messages'}
        
    except Exception as e:
        logger.error(f"❌ Fatal error in queue processor: {str(e)}")
        logger.error(f"❌ Event: {json.dumps(event, default=str)}")
        return {'statusCode': 500, 'body': f'Fatal error: {str(e)}'}

def generate_card_with_bedrock(prompt, job_id, session_id, user_number, display_name, device_id):
    """
    Generate trading card using Bedrock Nova Canvas with enhanced user correlation
    """
    try:
        logger.info(f"🎨 Starting Nova Canvas generation for job {job_id} - {display_name}")
        
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
        
        logger.info(f"🎨 Calling Bedrock Nova Canvas for job {job_id}")
        
        # Call Bedrock Nova Canvas
        response = bedrock_client.invoke_model(
            modelId=NOVA_CANVAS_MODEL,
            body=json.dumps(request_payload),
            contentType='application/json'
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        logger.info(f"✅ Nova Canvas response received for job {job_id}")
        
        if 'images' in response_body and len(response_body['images']) > 0:
            # Get the base64 image data
            image_data = base64.b64decode(response_body['images'][0])
            
            # Generate enhanced S3 key with user correlation
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"cards/{session_id}_card_1_{timestamp}.png"
            
            logger.info(f"💾 Uploading to S3: {s3_key}")
            
            # Upload to S3
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=s3_key,
                Body=image_data,
                ContentType='image/png',
                Metadata={
                    'job_id': job_id,
                    'user_number': str(user_number),
                    'display_name': display_name,
                    'device_id': device_id,
                    'session_id': session_id,
                    'generated_at': timestamp
                }
            )
            
            # Generate S3 URL
            s3_url = f"https://{S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/{s3_key}"
            
            logger.info(f"✅ Card generated successfully for job {job_id} - {display_name}")
            logger.info(f"📍 S3 URL: {s3_url}")
            
            return {
                'success': True,
                's3_url': s3_url,
                's3_key': s3_key,
                'job_id': job_id,
                'user_number': user_number,
                'display_name': display_name,
                'device_id': device_id,
                'session_id': session_id
            }
        else:
            error_msg = "No images returned from Nova Canvas"
            logger.error(f"❌ {error_msg} for job {job_id}")
            return {'success': False, 'error': error_msg}
            
    except Exception as e:
        error_msg = f"Bedrock generation failed: {str(e)}"
        logger.error(f"❌ {error_msg} for job {job_id}")
        return {'success': False, 'error': error_msg}

def update_job_status(job_id, status, metadata=None):
    """
    Update job status in DynamoDB with enhanced user correlation metadata
    """
    if not job_table:
        logger.warning(f"⚠️ Cannot update job {job_id} - DynamoDB table not available")
        return
    
    try:
        # Get existing job record to preserve created_at timestamp
        response = job_table.get_item(Key={'jobId': job_id})
        if 'Item' in response:
            created_at = response['Item'].get('created_at')
        else:
            created_at = datetime.now().isoformat()
        
        # Prepare update data with enhanced metadata
        update_data = {
            'jobId': job_id,
            'status': status,
            'updated_at': datetime.now().isoformat(),
            'created_at': created_at
        }
        
        # Add metadata if provided
        if metadata:
            update_data.update(metadata)
        
        # Handle reserved keywords for DynamoDB
        reserved_keywords = {
            'status': '#job_status'
        }
        
        # Build update expression
        update_expression = "SET "
        expression_attribute_names = {}
        expression_attribute_values = {}
        
        for key, value in update_data.items():
            if key == 'jobId':  # Skip the key
                continue
            elif key == 'status':
                # Handle reserved keyword
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
        logger.error(f"❌ Failed to update job {job_id} status: {str(e)}")
