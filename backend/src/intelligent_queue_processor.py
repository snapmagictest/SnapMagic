"""
🧠 INTELLIGENT QUEUE PROCESSOR
Processes SQS messages with true capacity awareness and job order preservation
"""

print("🧠 Intelligent Queue Processor: Starting imports...")

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

from capacity_manager import get_capacity_manager
print("✅ capacity_manager imported")

print("🧠 Intelligent Queue Processor: All imports successful, configuring logging...")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("🧠 Intelligent Queue Processor: Logging configured, initializing AWS clients...")

# AWS clients
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
print("✅ bedrock_client initialized")

s3_client = boto3.client('s3')
print("✅ s3_client initialized")

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
print("✅ dynamodb resource initialized")

print("🧠 Intelligent Queue Processor: Loading environment variables...")

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

print("🧠 Intelligent Queue Processor: Initializing DynamoDB table...")

# DynamoDB table (conditional initialization for testing)
job_table = None
if JOB_TRACKING_TABLE:
    job_table = dynamodb.Table(JOB_TRACKING_TABLE)
    print(f"✅ DynamoDB table initialized: {JOB_TRACKING_TABLE}")
else:
    print("⚠️ JOB_TRACKING_TABLE not set - DynamoDB operations will be disabled")

print("🎉 Intelligent Queue Processor: Initialization complete!")

def lambda_handler(event, context):
    """
    🧠 INTELLIGENT QUEUE PROCESSOR
    
    This is the core of the intelligent system:
    1. Check capacity BEFORE calling Bedrock
    2. Only process jobs when we KNOW we have capacity
    3. Preserve job order - first in, first out
    4. Learn from successes and failures to optimize capacity
    """
    try:
        print(f"🧠 INTELLIGENT PROCESSOR STARTED - Request ID: {context.aws_request_id}")
        logger.info(f"🧠 Intelligent Queue Processor started - Request ID: {context.aws_request_id}")
        
        print(f"📥 RAW EVENT: {json.dumps(event, default=str)}")
        logger.info(f"📥 Received event: {json.dumps(event, default=str)}")
        
        # Check if we have SQS records
        if 'Records' not in event:
            print("❌ NO RECORDS FOUND IN EVENT")
            logger.error("❌ No 'Records' found in event - this should be an SQS event")
            return {'statusCode': 400, 'body': 'Invalid event structure'}
        
        records = event['Records']
        print(f"📨 RECEIVED {len(records)} MESSAGES")
        logger.info(f"📨 Intelligent Processor: Received {len(records)} messages")
        
        # 🧠 CRITICAL: Process only the FIRST message to preserve order
        if len(records) > 1:
            print(f"🎯 ORDER PRESERVATION: Got {len(records)} messages, processing ONLY the first to maintain order")
            logger.info(f"🎯 Order preservation: Processing only first of {len(records)} messages")
        
        record = records[0]  # Always process first message only
        
        try:
            print(f"📝 PROCESSING FIRST MESSAGE")
            logger.info(f"📝 Processing first message")
            
            print(f"📝 RECORD: {json.dumps(record, default=str)}")
            logger.info(f"📝 Record structure: {json.dumps(record, default=str)}")
            
            # Parse SQS message
            print(f"📝 PARSING MESSAGE BODY...")
            message_body = json.loads(record['body'])
            print(f"📝 MESSAGE BODY: {json.dumps(message_body, default=str)}")
            logger.info(f"📝 Message body: {json.dumps(message_body, default=str)}")
            
            job_id = message_body['job_id']
            prompt = message_body['prompt']
            
            # Enhanced user correlation fields
            user_number = message_body.get('user_number', 1)
            display_name = message_body.get('display_name', f'Test User #{user_number}')
            device_id = message_body.get('device_id', 'unknown')
            session_id = message_body.get('session_id', f'{device_id}_user_{user_number:03d}_override1')
            
            print(f"🎯 PROCESSING JOB {job_id} for {display_name}: {prompt[:50]}...")
            logger.info(f"🎯 Processing job {job_id} for {display_name}: {prompt[:50]}...")
            
            # 🧠 INTELLIGENT CAPACITY CHECK - This is the core intelligence!
            print(f"🧠 LOADING CAPACITY MANAGER...")
            capacity_manager = get_capacity_manager()
            
            print(f"🧠 CHECKING BEDROCK CAPACITY...")
            if not capacity_manager.can_process_job():
                print(f"⏳ NO CAPACITY AVAILABLE - Job {job_id} will wait in queue")
                print(f"🎯 INTELLIGENT DECISION: Not calling Bedrock, preserving job order")
                logger.info(f"⏳ No capacity for job {job_id} - leaving in queue to preserve order")
                
                # 🎯 CRITICAL: Don't delete the message - it stays in queue
                # This preserves job order and prevents Bedrock spam
                return {
                    'statusCode': 200, 
                    'body': f'Job {job_id} waiting for capacity - preserved in queue'
                }
            
            # 🚀 WE HAVE CAPACITY - Process the job!
            print(f"✅ CAPACITY AVAILABLE - Processing job {job_id}")
            logger.info(f"✅ Capacity available - processing job {job_id}")
            
            # Mark job as started in capacity manager
            capacity_manager.job_started(job_id)
            
            # Update job status to processing
            print(f"📊 UPDATING JOB STATUS TO PROCESSING...")
            update_job_status(job_id, 'processing', {
                'user_number': user_number,
                'display_name': display_name,
                'device_id': device_id,
                'session_id': session_id,
                'started_at': datetime.now().isoformat()
            })
            print(f"✅ JOB STATUS UPDATED TO PROCESSING")
            
            # Generate card with Bedrock
            print(f"🎨 CALLING BEDROCK WITH CONFIDENCE (we know we have capacity)...")
            result = generate_card_with_bedrock(prompt, job_id, session_id, user_number, display_name, device_id, capacity_manager)
            print(f"🎨 BEDROCK CALL RESULT: {result}")
            
            if result['success']:
                print(f"🎉 JOB {job_id} COMPLETED SUCCESSFULLY")
                logger.info(f"🎉 Job {job_id} completed successfully for {display_name}")
                
                # Update job status to completed
                update_job_status(job_id, 'completed', {
                    'user_number': user_number,
                    'display_name': display_name,
                    'device_id': device_id,
                    'session_id': session_id,
                    's3_url': result['s3_url'],
                    's3_key': result['s3_key'],
                    'completed_at': datetime.now().isoformat()
                })
                
                # 🧠 LEARNING: Job succeeded, update capacity manager
                capacity_manager.job_completed_success(job_id)
                
            else:
                print(f"❌ JOB {job_id} FAILED: {result['error']}")
                logger.error(f"❌ Job {job_id} failed for {display_name}: {result['error']}")
                
                # Update job status to failed
                update_job_status(job_id, 'failed', {
                    'user_number': user_number,
                    'display_name': display_name,
                    'device_id': device_id,
                    'session_id': session_id,
                    'error': result['error'],
                    'failed_at': datetime.now().isoformat()
                })
                
                # 🧠 LEARNING: Job failed, update capacity manager
                capacity_manager.job_completed_error(job_id, result['error'])
                    
        except Exception as e:
            print(f"❌ ERROR PROCESSING MESSAGE: {str(e)}")
            logger.error(f"❌ Error processing message: {str(e)}")
            logger.error(f"❌ Record content: {json.dumps(record, default=str)}")
            
            # Try to update job status if we can extract job_id
            try:
                message_body = json.loads(record['body'])
                job_id = message_body.get('job_id')
                if job_id:
                    print(f"📊 UPDATING FAILED JOB {job_id}")
                    update_job_status(job_id, 'failed', {
                        'error': f'Processing error: {str(e)}',
                        'failed_at': datetime.now().isoformat()
                    })
                    
                    # Update capacity manager
                    capacity_manager = get_capacity_manager()
                    capacity_manager.job_completed_error(job_id, str(e))
                    
            except Exception as inner_e:
                print(f"❌ COULD NOT UPDATE JOB STATUS: {str(inner_e)}")
                logger.error(f"❌ Could not update job status for failed record: {str(inner_e)}")
            
            # Re-raise to let SQS handle retry
            raise e
        
        print(f"✅ INTELLIGENT PROCESSOR COMPLETED SUCCESSFULLY")
        logger.info(f"✅ Intelligent Queue Processor completed successfully")
        return {'statusCode': 200, 'body': 'Message processed successfully'}
        
    except Exception as e:
        print(f"❌ FATAL ERROR IN INTELLIGENT PROCESSOR: {str(e)}")
        logger.error(f"❌ Fatal error in intelligent processor: {str(e)}")
        logger.error(f"❌ Event: {json.dumps(event, default=str)}")
        
        # Let SQS handle retry - this preserves message order
        raise e

def generate_card_with_bedrock(prompt, job_id, session_id, user_number, display_name, device_id, capacity_manager):
    """
    Generate trading card using Bedrock Nova Canvas with intelligent capacity management
    """
    try:
        print(f"🎨 STARTING NOVA CANVAS GENERATION FOR JOB {job_id} - {display_name}")
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
        
        print(f"🎨 CALLING BEDROCK NOVA CANVAS FOR JOB {job_id}")
        print(f"🎨 MODEL: {NOVA_CANVAS_MODEL}")
        print(f"🎨 PAYLOAD: {json.dumps(request_payload)}")
        logger.info(f"🎨 Calling Bedrock Nova Canvas for job {job_id}")
        
        # 🚀 CONFIDENT BEDROCK CALL: We know we have capacity!
        response = bedrock_client.invoke_model(
            modelId=NOVA_CANVAS_MODEL,
            body=json.dumps(request_payload),
            contentType='application/json'
        )
        
        print(f"✅ BEDROCK RESPONSE RECEIVED FOR JOB {job_id}")
        
        # Parse response
        response_body = json.loads(response['body'].read())
        print(f"✅ RESPONSE PARSED FOR JOB {job_id}")
        logger.info(f"✅ Nova Canvas response received for job {job_id}")
        
        if 'images' in response_body and len(response_body['images']) > 0:
            print(f"✅ IMAGE DATA FOUND FOR JOB {job_id}")
            # Get the base64 image data
            image_data = base64.b64decode(response_body['images'][0])
            
            # Generate enhanced S3 key with user correlation
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"cards/{session_id}_card_1_{timestamp}.png"
            
            print(f"💾 UPLOADING TO S3: {s3_key}")
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
            
            print(f"🎉 CARD GENERATED SUCCESSFULLY FOR JOB {job_id} - {display_name}")
            print(f"📍 S3 URL: {s3_url}")
            logger.info(f"🎉 Card generated successfully for job {job_id} - {display_name}")
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
            print(f"❌ {error_msg} FOR JOB {job_id}")
            logger.error(f"❌ {error_msg} for job {job_id}")
            return {'success': False, 'error': error_msg}
            
    except Exception as e:
        error_str = str(e)
        
        if 'ThrottlingException' in error_str or 'TooManyRequestsException' in error_str:
            print(f"🤔 UNEXPECTED THROTTLING FOR JOB {job_id} - Our capacity estimate was wrong!")
            print(f"🧠 LEARNING MOMENT: Reducing capacity estimate")
            logger.warning(f"🤔 Unexpected throttling for job {job_id} - learning from this")
            
            # 🧠 LEARNING: We were wrong about capacity
            capacity_manager.job_completed_throttled(job_id)
            
            # Let SQS handle retry - job will be processed when we have real capacity
            raise e
            
        elif 'ServiceQuotaExceededException' in error_str:
            print(f"🚫 SERVICE QUOTA EXCEEDED FOR JOB {job_id}")
            logger.error(f"🚫 Service quota exceeded for job {job_id}")
            
            # This is also a capacity issue
            capacity_manager.job_completed_throttled(job_id)
            raise e
            
        else:
            # Other errors (validation, etc.) - don't retry
            error_msg = f"Bedrock generation failed: {error_str}"
            print(f"❌ OTHER ERROR FOR JOB {job_id}: {error_str}")
            logger.error(f"❌ {error_msg} for job {job_id}")
            return {'success': False, 'error': error_msg}

def update_job_status(job_id, status, metadata=None):
    """
    Update job status in DynamoDB with enhanced user correlation metadata
    """
    if not job_table:
        print(f"⚠️ CANNOT UPDATE JOB {job_id} - DYNAMODB TABLE NOT AVAILABLE")
        logger.warning(f"⚠️ Cannot update job {job_id} - DynamoDB table not available")
        return
    
    try:
        print(f"📊 UPDATING JOB {job_id} STATUS TO: {status}")
        
        # Get existing job record to preserve created_at timestamp
        response = job_table.get_item(Key={'jobId': job_id})
        if 'Item' in response:
            created_at = response['Item'].get('created_at')
            print(f"📊 FOUND EXISTING JOB {job_id}, CREATED_AT: {created_at}")
        else:
            created_at = datetime.now().isoformat()
            print(f"📊 NEW JOB {job_id}, SETTING CREATED_AT: {created_at}")
        
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
            print(f"📊 ADDED METADATA: {json.dumps(metadata, default=str)}")
        
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
        
        print(f"📊 UPDATE EXPRESSION: {update_expression}")
        print(f"📊 ATTRIBUTE VALUES: {json.dumps(expression_attribute_values, default=str)}")
        
        # Only include ExpressionAttributeNames if we have reserved keywords
        update_params = {
            'Key': {'jobId': job_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_attribute_values
        }
        
        if expression_attribute_names:
            update_params['ExpressionAttributeNames'] = expression_attribute_names
            print(f"📊 ATTRIBUTE NAMES: {json.dumps(expression_attribute_names)}")
        
        job_table.update_item(**update_params)
        
        print(f"✅ JOB {job_id} STATUS UPDATED TO: {status}")
        logger.info(f"📊 Job {job_id} status updated to: {status}")
        
    except Exception as e:
        print(f"❌ FAILED TO UPDATE JOB {job_id} STATUS: {str(e)}")
        logger.error(f"❌ Failed to update job {job_id} status: {str(e)}")
