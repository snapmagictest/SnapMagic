#!/usr/bin/env python3
"""
End-to-End Test - FIXED VERSION with correct status checking
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

def submit_job(req_num, token):
    """Submit job and return job info"""
    start = time.time()
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-Device-ID': f'fixed_{req_num}'
    }
    
    data = {
        "action": "transform_card",
        "prompt": f"FIXED Test #{req_num} - AWS Solutions Architect with expertise",
        "user_name": f"Fixed Test {req_num}",
        "user_number": req_num,
        "device_id": f"fixed_{req_num}",
        "display_name": f"Fixed Test #{req_num}"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/api/transform-card", json=data, headers=headers)
        submit_time = time.time() - start
        
        if response.status_code == 200:
            job_data = response.json()
            job_id = job_data.get('job_id', 'N/A')
            return {
                'req_num': req_num,
                'job_id': job_id,
                'submit_time': submit_time,
                'start_time': start,
                'status': 'submitted',
                'token': token
            }
        else:
            return {
                'req_num': req_num,
                'job_id': None,
                'submit_time': submit_time,
                'start_time': start,
                'status': 'failed',
                'error': f"HTTP {response.status_code}"
            }
    except Exception as e:
        return {
            'req_num': req_num,
            'job_id': None,
            'submit_time': time.time() - start,
            'start_time': start,
            'status': 'error',
            'error': str(e)
        }

def check_job_status(job_info):
    """Check status of a job using CORRECT method"""
    if not job_info['job_id']:
        return job_info
    
    headers = {
        'Authorization': f'Bearer {job_info["token"]}',
        'Content-Type': 'application/json'
    }
    
    # CORRECT METHOD: POST with action in body
    data = {
        "action": "check_job_status",
        "job_id": job_info['job_id']
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/api/transform-card", json=data, headers=headers)
        if response.status_code == 200:
            status_data = response.json()
            job_info['current_status'] = status_data.get('status', 'unknown')
            job_info['s3_url'] = status_data.get('s3_url')
            job_info['message'] = status_data.get('message', '')
            return job_info
        else:
            job_info['current_status'] = f'error_{response.status_code}'
            return job_info
            
    except Exception as e:
        job_info['current_status'] = 'check_error'
        return job_info

def track_job_completion(job_info):
    """Track a single job through completion"""
    req_num = job_info['req_num']
    job_id = job_info['job_id']
    
    if not job_id:
        return f"❌ JOB {req_num:2d}: Failed to submit"
    
    print(f"📤 JOB {req_num:2d}: Submitted in {job_info['submit_time']:.2f}s - Job: {job_id[:8]}...")
    
    # Track through completion
    last_status = 'submitted'
    processing_start = None
    
    for check_count in range(30):  # Check for up to 60 seconds
        time.sleep(2)  # Check every 2 seconds
        
        job_info = check_job_status(job_info)
        current_status = job_info.get('current_status', 'unknown')
        current_time = time.time() - job_info['start_time']
        
        # Status change detection
        if current_status != last_status:
            if current_status == 'processing' and processing_start is None:
                processing_start = time.time()
                print(f"🔄 JOB {req_num:2d}: Started processing at {current_time:.1f}s")
            elif current_status == 'completed':
                total_time = time.time() - job_info['start_time']
                process_time = time.time() - processing_start if processing_start else 0
                s3_url = job_info.get('s3_url', 'No URL')
                print(f"✅ JOB {req_num:2d}: COMPLETED in {total_time:.1f}s (process: {process_time:.1f}s)")
                print(f"   📸 S3 URL: {s3_url[:60]}...")
                return f"✅ JOB {req_num:2d}: SUCCESS - Total: {total_time:.1f}s"
            elif current_status == 'failed':
                total_time = time.time() - job_info['start_time']
                print(f"❌ JOB {req_num:2d}: FAILED at {total_time:.1f}s")
                return f"❌ JOB {req_num:2d}: FAILED - Total: {total_time:.1f}s"
            
            last_status = current_status
        
        # Periodic updates for long-running jobs
        if check_count % 5 == 0 and check_count > 0:
            message = job_info.get('message', '')
            print(f"⏳ JOB {req_num:2d}: {current_status} at {current_time:.1f}s - {message}")
    
    # Timeout
    total_time = time.time() - job_info['start_time']
    return f"⏰ JOB {req_num:2d}: TIMEOUT after {total_time:.1f}s - Last status: {last_status}"

def main():
    num_requests = 5  # Start with 5 for testing
    
    print(f"""
🎯 END-TO-END PROCESSING TEST (FIXED)
=====================================
Testing {num_requests} requests with CORRECT status checking:
• Job submission timing
• Status progression (queued → processing → completed)  
• Total processing time per job
• Real-time progress updates
• S3 URL verification

Time: {datetime.now().strftime('%H:%M:%S')}
""")
    
    # Get token
    token = get_token()
    print("✅ Auth successful\n")
    
    # Submit all jobs concurrently
    print("📤 Submitting all jobs...")
    start_time = time.time()
    
    jobs = []
    with ThreadPoolExecutor(max_workers=num_requests) as executor:
        futures = [executor.submit(submit_job, i, token) for i in range(1, num_requests + 1)]
        
        for future in as_completed(futures):
            job_info = future.result()
            jobs.append(job_info)
    
    submit_phase_time = time.time() - start_time
    successful_jobs = [j for j in jobs if j['job_id']]
    
    print(f"\n📊 Submission Phase Complete:")
    print(f"   ✅ Successful: {len(successful_jobs)}/{num_requests}")
    print(f"   ⏱️  Total submit time: {submit_phase_time:.2f}s")
    print(f"\n🔄 Now tracking job processing...\n")
    
    # Track each job through completion
    completion_results = []
    with ThreadPoolExecutor(max_workers=len(successful_jobs)) as executor:
        futures = [executor.submit(track_job_completion, job) for job in successful_jobs]
        
        for future in as_completed(futures):
            result = future.result()
            completion_results.append(result)
    
    total_time = time.time() - start_time
    successful_completions = len([r for r in completion_results if 'SUCCESS' in r])
    
    print(f"\n" + "="*70)
    print(f"🏁 FINAL RESULTS:")
    print(f"   Total test time: {total_time:.2f}s")
    print(f"   Jobs submitted: {len(successful_jobs)}")
    print(f"   Jobs completed: {successful_completions}")
    print(f"   Success rate: {successful_completions}/{len(successful_jobs)} ({100*successful_completions/len(successful_jobs) if successful_jobs else 0:.1f}%)")
    print("="*70)
    
    # Show individual results
    print("\n📋 Individual Results:")
    for result in completion_results:
        print(f"   {result}")

if __name__ == "__main__":
    main()
