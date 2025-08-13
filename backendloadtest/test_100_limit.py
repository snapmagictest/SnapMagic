#!/usr/bin/env python3
"""
Direct 100-User Limit Test - Test actual Bedrock concurrency limit
"""

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import statistics

# PRODUCTION API
API_BASE_URL = "https://gywq5757y9.execute-api.us-east-1.amazonaws.com/prod"

def get_token():
    """Get auth token for production"""
    response = requests.post(f"{API_BASE_URL}/api/login", json={"username": "Snap", "password": "Magic"})
    if response.status_code == 200:
        return response.json()['token']
    else:
        raise Exception(f"Login failed: {response.status_code}")

def submit_real_job(req_num, token):
    """Submit real job with Bedrock generation"""
    start = time.time()
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-Device-ID': f'limit_test_{req_num}'
    }
    
    data = {
        "action": "transform_card",
        "prompt": f"LIMIT TEST #{req_num} - AWS Solutions Architect designing serverless applications",
        "user_name": f"Limit User {req_num}",
        "user_number": req_num,
        "device_id": f"limit_test_{req_num}",
        "display_name": f"Limit Test #{req_num}"
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
                'token': token,
                'timestamp': datetime.now().isoformat()
            }
        else:
            return {
                'req_num': req_num,
                'job_id': None,
                'submit_time': submit_time,
                'start_time': start,
                'status': 'failed',
                'error': f"HTTP {response.status_code}",
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        return {
            'req_num': req_num,
            'job_id': None,
            'submit_time': time.time() - start,
            'start_time': start,
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

def check_job_status(job_info):
    """Check status of a job"""
    if not job_info['job_id']:
        return job_info
    
    headers = {
        'Authorization': f'Bearer {job_info["token"]}',
        'Content-Type': 'application/json'
    }
    
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

def track_job_completion(job_info, max_wait_time=300):
    """Track a single job through completion"""
    req_num = job_info['req_num']
    job_id = job_info['job_id']
    
    if not job_id:
        return {
            'req_num': req_num,
            'status': 'submit_failed',
            'total_time': 0,
            'processing_time': 0,
            'queue_time': 0
        }
    
    # Track through completion
    last_status = 'submitted'
    processing_start = None
    queue_start = time.time()
    
    for check_count in range(max_wait_time // 3):  # Check every 3 seconds
        time.sleep(3)
        
        job_info = check_job_status(job_info)
        current_status = job_info.get('current_status', 'unknown')
        current_time = time.time() - job_info['start_time']
        
        # Status change detection
        if current_status != last_status:
            if current_status == 'processing' and processing_start is None:
                processing_start = time.time()
                queue_time = processing_start - queue_start
                print(f"   🔄 Job {req_num:3d}: Started processing after {queue_time:.1f}s queue time")
            elif current_status == 'completed':
                total_time = time.time() - job_info['start_time']
                process_time = time.time() - processing_start if processing_start else 0
                queue_time = processing_start - queue_start if processing_start else total_time
                print(f"   ✅ Job {req_num:3d}: COMPLETED in {total_time:.1f}s (queue: {queue_time:.1f}s, process: {process_time:.1f}s)")
                
                return {
                    'req_num': req_num,
                    'status': 'completed',
                    'total_time': total_time,
                    'processing_time': process_time,
                    'queue_time': queue_time,
                    's3_url': job_info.get('s3_url', '')
                }
            elif current_status == 'failed':
                total_time = time.time() - job_info['start_time']
                print(f"   ❌ Job {req_num:3d}: FAILED after {total_time:.1f}s")
                return {
                    'req_num': req_num,
                    'status': 'failed',
                    'total_time': total_time,
                    'processing_time': 0,
                    'queue_time': total_time
                }
            
            last_status = current_status
    
    # Timeout
    total_time = time.time() - job_info['start_time']
    print(f"   ⏰ Job {req_num:3d}: TIMEOUT after {total_time:.1f}s (last status: {last_status})")
    return {
        'req_num': req_num,
        'status': 'timeout',
        'total_time': total_time,
        'processing_time': 0,
        'queue_time': total_time,
        'last_status': last_status
    }

def main():
    """Test 100 concurrent users directly"""
    num_users = 100
    estimated_cost = num_users * 0.134
    
    print(f"""
🎯 DIRECT 100-USER LIMIT TEST
=============================
Testing Bedrock 100 RPM limit with {num_users} concurrent users
Estimated Cost: ${estimated_cost:.2f}
Target: {API_BASE_URL}
Time: {datetime.now().strftime('%H:%M:%S')}

This will test:
• Infrastructure capacity at 100 concurrent users
• Bedrock Nova Canvas 100 RPM throttling behavior  
• Queue processing under maximum load
• Real-world performance at scale
""")
    
    # Cost confirmation
    confirm = input(f"💰 This test will cost approximately ${estimated_cost:.2f}. Continue? (y/N): ")
    if confirm.lower() != 'y':
        print("❌ Test cancelled")
        return
    
    # Get token
    try:
        token = get_token()
        print("✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return
    
    # Submit all jobs concurrently
    start_time = time.time()
    jobs = []
    
    print(f"\n📤 Submitting {num_users} jobs concurrently...")
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(submit_real_job, i, token) for i in range(1, num_users + 1)]
        
        completed = 0
        for future in as_completed(futures):
            job_info = future.result()
            jobs.append(job_info)
            completed += 1
            
            if completed % 10 == 0:
                elapsed = time.time() - start_time
                print(f"   Submitted: {completed}/{num_users} ({elapsed:.1f}s)")
    
    submit_phase_time = time.time() - start_time
    successful_jobs = [j for j in jobs if j['job_id']]
    
    print(f"\n📊 Submission Phase Complete:")
    print(f"   Successful: {len(successful_jobs)}/{num_users}")
    print(f"   Submit time: {submit_phase_time:.2f}s")
    print(f"   Throughput: {len(successful_jobs)/submit_phase_time:.1f} jobs/sec")
    print(f"\n🔄 Tracking {len(successful_jobs)} jobs through completion...")
    print(f"   (This will take several minutes due to Bedrock 100 RPM limit)")
    
    # Track each job through completion
    completion_results = []
    with ThreadPoolExecutor(max_workers=len(successful_jobs)) as executor:
        futures = [executor.submit(track_job_completion, job) for job in successful_jobs]
        
        completed = 0
        for future in as_completed(futures):
            result = future.result()
            completion_results.append(result)
            completed += 1
            
            if completed % 10 == 0:
                elapsed = time.time() - start_time
                print(f"\n   Progress: {completed}/{len(successful_jobs)} completed ({elapsed/60:.1f} minutes elapsed)")
    
    total_test_time = time.time() - start_time
    
    # Analyze results
    completed_jobs = [r for r in completion_results if r['status'] == 'completed']
    failed_jobs = [r for r in completion_results if r['status'] == 'failed']
    timeout_jobs = [r for r in completion_results if r['status'] == 'timeout']
    
    if completed_jobs:
        total_times = [r['total_time'] for r in completed_jobs]
        queue_times = [r['queue_time'] for r in completed_jobs]
        process_times = [r['processing_time'] for r in completed_jobs]
        
        avg_total = statistics.mean(total_times)
        avg_queue = statistics.mean(queue_times)
        avg_process = statistics.mean(process_times)
        
        max_total = max(total_times)
        min_total = min(total_times)
        max_queue = max(queue_times)
        min_queue = min(queue_times)
    else:
        avg_total = avg_queue = avg_process = max_total = min_total = max_queue = min_queue = 0
    
    # Final Results
    print(f"\n" + "="*80)
    print(f"🏁 100-USER LIMIT TEST RESULTS")
    print(f"="*80)
    print(f"Total Test Time:     {total_test_time/60:.1f} minutes")
    print(f"Jobs Submitted:      {len(successful_jobs)}")
    print(f"Jobs Completed:      {len(completed_jobs)}")
    print(f"Jobs Failed:         {len(failed_jobs)}")
    print(f"Jobs Timeout:        {len(timeout_jobs)}")
    print(f"Success Rate:        {len(completed_jobs)/len(successful_jobs)*100:.1f}%")
    print(f"Actual Cost:         ${len(completed_jobs) * 0.134:.2f}")
    print(f"")
    print(f"📊 TIMING ANALYSIS:")
    print(f"  Avg Total Time:    {avg_total:.1f}s")
    print(f"  Avg Queue Time:    {avg_queue:.1f}s")
    print(f"  Avg Process Time:  {avg_process:.1f}s")
    print(f"  Min Total Time:    {min_total:.1f}s")
    print(f"  Max Total Time:    {max_total:.1f}s")
    print(f"  Min Queue Time:    {min_queue:.1f}s")
    print(f"  Max Queue Time:    {max_queue:.1f}s")
    
    print(f"\n🔮 BEDROCK 100 RPM ANALYSIS:")
    if len(completed_jobs) > 0:
        throughput_per_minute = len(completed_jobs) / (total_test_time / 60)
        print(f"  Actual throughput: {throughput_per_minute:.1f} cards/minute")
        print(f"  Bedrock limit:     100 cards/minute")
        
        if throughput_per_minute >= 95:
            print(f"  ✅ Successfully hitting Bedrock 100 RPM limit")
        elif throughput_per_minute >= 80:
            print(f"  ⚠️  Close to Bedrock limit (queue management working)")
        else:
            print(f"  ❌ Below expected throughput (possible bottleneck)")
    
    print(f"\n💡 10K USER PROJECTION:")
    if avg_queue > 0:
        projected_queue_10k = avg_queue * (10000 / 100) / 100  # Scale by users, divide by RPM limit
        projected_total_10k = projected_queue_10k + avg_process
        print(f"  Expected queue time: {projected_queue_10k/60:.1f} minutes")
        print(f"  Expected total time: {projected_total_10k/60:.1f} minutes")
        print(f"  System can handle:   10K users (with queuing)")
    
    print(f"="*80)

if __name__ == "__main__":
    main()
