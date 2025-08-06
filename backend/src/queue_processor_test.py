"""
Minimal Queue Processor Test
Test version to isolate import issues
"""

import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def lambda_handler(event, context):
    """
    Minimal test handler to check if basic functionality works
    """
    try:
        logger.info(f"🚀 TEST Queue Processor started - Request ID: {context.aws_request_id}")
        logger.info(f"📥 Received event: {json.dumps(event, default=str)}")
        
        # Check if we have SQS records
        if 'Records' not in event:
            logger.error("❌ No 'Records' found in event")
            return {'statusCode': 400, 'body': 'Invalid event structure'}
        
        records = event['Records']
        logger.info(f"🎯 Processing {len(records)} messages")
        
        for i, record in enumerate(records):
            logger.info(f"📝 Processing record {i+1}/{len(records)}")
            message_body = json.loads(record['body'])
            job_id = message_body.get('job_id', 'unknown')
            logger.info(f"🎴 Job ID: {job_id}")
        
        logger.info(f"✅ TEST Queue Processor completed")
        return {'statusCode': 200, 'body': f'Processed {len(records)} messages'}
        
    except Exception as e:
        logger.error(f"❌ Fatal error in TEST queue processor: {str(e)}")
        return {'statusCode': 500, 'body': f'Fatal error: {str(e)}'}
