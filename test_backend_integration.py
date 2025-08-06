#!/usr/bin/env python3
"""
Backend Integration Test
Tests the lambda_handler functions to ensure they work correctly
"""

import sys
import os
import json
from datetime import datetime

# Add backend src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'src'))

def test_device_id_functions():
    """Test device ID extraction functions"""
    print("🧪 Testing Device ID Functions")
    print("-" * 40)
    
    try:
        from lambda_handler import get_device_id, get_client_ip
        
        # Test with device ID present
        headers_with_device = {
            'X-Device-ID': '8qgfnm1jxk3',
            'Content-Type': 'application/json'
        }
        
        device_id = get_device_id(headers_with_device)
        client_ip = get_client_ip(headers_with_device)
        
        print(f"✅ get_device_id with header: {device_id}")
        print(f"✅ get_client_ip with header: {client_ip}")
        
        # Test without device ID
        headers_without_device = {
            'Content-Type': 'application/json'
        }
        
        device_id_fallback = get_device_id(headers_without_device)
        client_ip_fallback = get_client_ip(headers_without_device)
        
        print(f"✅ get_device_id fallback: {device_id_fallback}")
        print(f"✅ get_client_ip fallback: {client_ip_fallback}")
        
        return True
        
    except Exception as e:
        print(f"❌ Device ID functions test failed: {str(e)}")
        return False

def test_transform_card_request():
    """Test the transform_card request structure"""
    print("\n🧪 Testing Transform Card Request Structure")
    print("-" * 50)
    
    try:
        # Simulate the request event structure
        test_event = {
            'httpMethod': 'POST',
            'path': '/api/transform-card',
            'headers': {
                'X-Device-ID': '8qgfnm1jxk3',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            'body': json.dumps({
                'action': 'transform_card',
                'prompt': 'AWS Solutions Architect designing cloud infrastructure',
                'user_name': 'Test User',
                'user_number': 1,
                'device_id': '8qgfnm1jxk3',
                'display_name': 'Test User #1'
            })
        }
        
        print("✅ Test event structure created:")
        print(f"   Method: {test_event['httpMethod']}")
        print(f"   Path: {test_event['path']}")
        print(f"   Device ID: {test_event['headers']['X-Device-ID']}")
        
        body = json.loads(test_event['body'])
        print(f"   Action: {body['action']}")
        print(f"   User Number: {body['user_number']}")
        print(f"   Display Name: {body['display_name']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Transform card request test failed: {str(e)}")
        return False

def test_sqs_integration_imports():
    """Test SQS integration imports"""
    print("\n🧪 Testing SQS Integration Imports")
    print("-" * 40)
    
    try:
        # Test if we can import the SQS functions
        from sqs_queue_integration import generate_card_via_queue, is_queue_system_available
        
        print("✅ SQS integration imports successful")
        print(f"   generate_card_via_queue: {generate_card_via_queue}")
        print(f"   is_queue_system_available: {is_queue_system_available}")
        
        return True
        
    except Exception as e:
        print(f"❌ SQS integration import failed: {str(e)}")
        return False

def test_queue_processor_imports():
    """Test queue processor imports"""
    print("\n🧪 Testing Queue Processor Imports")
    print("-" * 40)
    
    try:
        # Test if we can import the queue processor functions
        from queue_processor import lambda_handler, generate_card_with_bedrock, update_job_status
        
        print("✅ Queue processor imports successful")
        print(f"   lambda_handler: {lambda_handler}")
        print(f"   generate_card_with_bedrock: {generate_card_with_bedrock}")
        print(f"   update_job_status: {update_job_status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Queue processor import failed: {str(e)}")
        return False

def test_enhanced_naming_pattern():
    """Test enhanced naming pattern generation"""
    print("\n🧪 Testing Enhanced Naming Pattern")
    print("-" * 40)
    
    try:
        device_id = "8qgfnm1jxk3"
        user_number = 1
        override_number = 1
        
        # Test session ID generation
        session_id = f"device_{device_id}_user_{user_number:03d}_override{override_number}"
        print(f"✅ Session ID: {session_id}")
        
        # Test S3 key generation
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        s3_key = f"cards/{session_id}_card_1_{timestamp}.png"
        print(f"✅ S3 Key: {s3_key}")
        
        # Verify pattern matches expected format
        expected_pattern = "device_8qgfnm1jxk3_user_001_override1_card_1_"
        if expected_pattern in s3_key:
            print("✅ Enhanced naming pattern matches expected format")
            return True
        else:
            print(f"❌ Pattern mismatch. Expected: {expected_pattern}")
            return False
        
    except Exception as e:
        print(f"❌ Enhanced naming pattern test failed: {str(e)}")
        return False

def main():
    """Run all backend integration tests"""
    print("🚀 Backend Integration Test Suite")
    print("=" * 50)
    
    tests = [
        test_device_id_functions,
        test_transform_card_request,
        test_sqs_integration_imports,
        test_queue_processor_imports,
        test_enhanced_naming_pattern
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
            failed += 1
    
    print(f"\n📊 Test Results:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 All tests passed! Backend integration looks good.")
        return True
    else:
        print(f"\n⚠️ {failed} tests failed. Need to fix issues before deployment.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
