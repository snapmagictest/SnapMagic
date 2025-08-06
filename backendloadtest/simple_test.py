#!/usr/bin/env python3
"""
Simple Concurrent Test - Clean view of request processing
"""

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

API_BASE_URL = "https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev"

def get_token():
    response = requests.post(f"{API_BASE_URL}/api/login", json={"username": "demo", "password": "demo"})
    return response.json()['token']

def test_request(req_num, token):
    """Submit request and return timing info"""
    start = time.time()
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-Device-ID': f'test_{req_num}'
    }
    
    data = {
        "action": "transform_card",
        "prompt": f"AWS Developer #{req_num} with cloud expertise",
        "user_name": f"Test {req_num}",
        "user_number": req_num,
        "device_id": f"test_{req_num}",
        "display_name": f"Test #{req_num}"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/api/transform-card", json=data, headers=headers)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            job_id = response.json().get('job_id', 'N/A')
            return f"✅ REQ {req_num:2d}: {elapsed:.2f}s - SUCCESS - Job: {job_id[:8]}..."
        else:
            return f"❌ REQ {req_num:2d}: {elapsed:.2f}s - FAILED - HTTP {response.status_code}"
    except Exception as e:
        elapsed = time.time() - start
        return f"💥 REQ {req_num:2d}: {elapsed:.2f}s - ERROR - {str(e)[:30]}..."

def main():
    num_requests = 40
    
    print(f"""
🎯 SIMPLE CONCURRENT TEST
=========================
Testing {num_requests} requests to see:
• Request number
• Processing time  
• Success/failure

Time: {datetime.now().strftime('%H:%M:%S')}
""")
    
    # Get token
    token = get_token()
    print("✅ Auth successful\n")
    
    # Submit all requests concurrently
    print("📤 Submitting requests...")
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=num_requests) as executor:
        futures = [executor.submit(test_request, i, token) for i in range(1, num_requests + 1)]
        
        for future in as_completed(futures):
            print(future.result())
    
    total_time = time.time() - start_time
    print(f"\n⏱️  Total test time: {total_time:.2f}s")
    print(f"🧠 All requests processed through intelligent capacity system!")

if __name__ == "__main__":
    main()
