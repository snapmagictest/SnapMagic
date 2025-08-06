#!/usr/bin/env python3
"""
Live API Test
Tests the deployed SnapMagic API to ensure it works correctly
"""

import requests
import json
import time
from datetime import datetime

# API Configuration
API_BASE_URL = "https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/"
TEST_CREDENTIALS = {
    "username": "demo",
    "password": "demo"
}

def test_login():
    """Test login endpoint and get auth token"""
    print("🧪 Testing Login Endpoint")
    print("-" * 30)
    
    try:
        login_url = f"{API_BASE_URL}api/login"
        response = requests.post(login_url, json={
            "action": "login",
            "username": TEST_CREDENTIALS["username"],
            "password": TEST_CREDENTIALS["password"]
        })
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('token'):
                print(f"   ✅ Login successful")
                print(f"   Token: {data['token'][:20]}...")
                return data['token']
            else:
                print(f"   ❌ Login failed: {data}")
                return None
        else:
            print(f"   ❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Login test failed: {str(e)}")
        return None

def test_transform_card_endpoint(auth_token):
    """Test the transform card endpoint with enhanced user correlation"""
    print("\n🧪 Testing Transform Card Endpoint")
    print("-" * 40)
    
    try:
        transform_url = f"{API_BASE_URL}api/transform-card"
        
        # Test request with enhanced user correlation
        test_request = {
            "action": "transform_card",
            "prompt": "AWS Solutions Architect designing cloud infrastructure",
            "user_name": "Test User",
            "user_number": 1,
            "device_id": "test_device_123",
            "display_name": "Test User #1"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}",
            "X-Device-ID": "test_device_123"
        }
        
        print(f"   Request URL: {transform_url}")
        print(f"   Request Body: {json.dumps(test_request, indent=2)}")
        print(f"   Headers: {headers}")
        
        response = requests.post(transform_url, json=test_request, headers=headers)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Transform card request successful")
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check if it's async response
            if data.get('async') and data.get('job_id'):
                print(f"   🔄 Async response detected - Job ID: {data['job_id']}")
                return data['job_id'], True
            else:
                print(f"   📄 Synchronous response detected")
                return data, False
                
        else:
            print(f"   ❌ Transform card failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None, False
            
    except Exception as e:
        print(f"   ❌ Transform card test failed: {str(e)}")
        return None, False

def test_job_status_polling(auth_token, job_id):
    """Test job status polling for async card generation"""
    print(f"\n🧪 Testing Job Status Polling for Job: {job_id}")
    print("-" * 50)
    
    try:
        # Use the main API endpoint, not a separate check-job-status endpoint
        status_url = f"{API_BASE_URL}api/transform-card"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}",
            "X-Device-ID": "test_device_123"
        }
        
        max_attempts = 12  # 12 * 5 seconds = 1 minute max
        attempt = 0
        
        while attempt < max_attempts:
            attempt += 1
            print(f"   Polling attempt {attempt}/{max_attempts}")
            
            response = requests.post(status_url, json={
                "action": "check_job_status",
                "job_id": job_id
            }, headers=headers)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                print(f"   Job Status: {status}")
                
                if status == 'completed':
                    print(f"   ✅ Job completed successfully!")
                    print(f"   S3 URL: {data.get('s3_url', 'N/A')}")
                    print(f"   S3 Key: {data.get('s3_key', 'N/A')}")
                    print(f"   User Number: {data.get('user_number', 'N/A')}")
                    print(f"   Display Name: {data.get('display_name', 'N/A')}")
                    print(f"   Device ID: {data.get('device_id', 'N/A')}")
                    return True
                    
                elif status == 'failed':
                    print(f"   ❌ Job failed: {data.get('error', 'Unknown error')}")
                    return False
                    
                elif status == 'processing':
                    print(f"   🔄 Job still processing... waiting 5 seconds")
                    time.sleep(5)
                    
                else:
                    print(f"   ⏳ Job status: {status}, waiting 5 seconds")
                    time.sleep(5)
                    
            else:
                print(f"   ❌ Polling failed with status {response.status_code}")
                print(f"   Response: {response.text}")
                time.sleep(5)
        
        print(f"   ⏰ Polling timed out after {max_attempts} attempts")
        return False
        
    except Exception as e:
        print(f"   ❌ Job status polling failed: {str(e)}")
        return False

def test_health_endpoint():
    """Test the health endpoint"""
    print("\n🧪 Testing Health Endpoint")
    print("-" * 30)
    
    try:
        health_url = f"{API_BASE_URL}api/health"
        response = requests.get(health_url)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check successful")
            print(f"   Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"   ❌ Health check failed")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Health test failed: {str(e)}")
        return False

def main():
    """Run comprehensive live API tests"""
    print("🚀 Live API Test Suite")
    print("=" * 50)
    print(f"Testing API: {API_BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test 1: Health Check
    health_ok = test_health_endpoint()
    
    # Test 2: Login
    auth_token = test_login()
    if not auth_token:
        print("\n❌ Cannot proceed without auth token")
        return False
    
    # Test 3: Transform Card
    result, is_async = test_transform_card_endpoint(auth_token)
    if not result:
        print("\n❌ Transform card test failed")
        return False
    
    # Test 4: Job Status Polling (if async)
    if is_async:
        job_id = result
        polling_ok = test_job_status_polling(auth_token, job_id)
        if not polling_ok:
            print("\n❌ Job status polling failed")
            return False
    
    print("\n🎉 All API tests completed successfully!")
    print("\n✅ Summary:")
    print(f"   • Health endpoint: {'✅' if health_ok else '❌'}")
    print(f"   • Login endpoint: {'✅' if auth_token else '❌'}")
    print(f"   • Transform card: {'✅' if result else '❌'}")
    print(f"   • Async system: {'✅' if is_async else '📄 Sync'}")
    if is_async:
        print(f"   • Job polling: {'✅' if 'polling_ok' in locals() and polling_ok else '❌'}")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎯 API is working correctly! Ready for frontend testing.")
    else:
        print("\n⚠️ API tests failed. Need to investigate and fix issues.")
