#!/usr/bin/env python3
"""
Phase 2: Real Load Test - End-to-End with Bedrock (LIMITED scale for cost control)
Tests complete flow including Bedrock Nova Canvas generation
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
        'X-Device-ID': f'real_load_{req_num}'
    }
    
    data = {
        "action": "transform_card",
        "prompt": f"REAL TEST #{req_num} - AWS Solutions Architect designing cloud infrastructure",
        "user_name": f"Real User {req_num}",
        "user_number": req_num,
        "device_id": f"real_load_{req_num}",
        "display_name": f"Real Test #{req_num}"
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

def track_job_completion(job_info, max_wait_time=180):
    """Track a single job through completion with timeout"""
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
    
    for check_count in range(max_wait_time // 2):  # Check every 2 seconds
        time.sleep(2)
        
        job_info = check_job_status(job_info)
        current_status = job_info.get('current_status', 'unknown')
        current_time = time.time() - job_info['start_time']
        
        # Status change detection
        if current_status != last_status:
            if current_status == 'processing' and processing_start is None:
                processing_start = time.time()
                queue_time = processing_start - queue_start
            elif current_status == 'completed':
                total_time = time.time() - job_info['start_time']
                process_time = time.time() - processing_start if processing_start else 0
                queue_time = processing_start - queue_start if processing_start else total_time
                
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
    return {
        'req_num': req_num,
        'status': 'timeout',
        'total_time': total_time,
        'processing_time': 0,
        'queue_time': total_time,
        'last_status': last_status
    }

def run_real_load_test(num_users, test_name, estimated_cost):
    """Run real load test with Bedrock calls"""
    print(f"\n🚀 {test_name}")
    print(f"{'='*60}")
    print(f"Users: {num_users}")
    print(f"Estimated Cost: ${estimated_cost:.2f}")
    print(f"Target: {API_BASE_URL}")
    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*60}")
    
    # Cost confirmation
    confirm = input(f"\n💰 This test will cost approximately ${estimated_cost:.2f}. Continue? (y/N): ")
    if confirm.lower() != 'y':
        print("❌ Test cancelled")
        return None
    
    # Get token
    try:
        token = get_token()
        print("✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None
    
    # Submit all jobs concurrently
    start_time = time.time()
    jobs = []
    
    print(f"\n📤 Submitting {num_users} real jobs...")
    
    with ThreadPoolExecutor(max_workers=min(num_users, 50)) as executor:
        futures = [executor.submit(submit_real_job, i, token) for i in range(1, num_users + 1)]
        
        for future in as_completed(futures):
            job_info = future.result()
            jobs.append(job_info)
    
    submit_phase_time = time.time() - start_time
    successful_jobs = [j for j in jobs if j['job_id']]
    
    print(f"\n📊 Submission Phase:")
    print(f"   Successful: {len(successful_jobs)}/{num_users}")
    print(f"   Submit time: {submit_phase_time:.2f}s")
    print(f"\n🔄 Tracking job processing...")
    
    # Track each job through completion
    completion_results = []
    with ThreadPoolExecutor(max_workers=len(successful_jobs)) as executor:
        futures = [executor.submit(track_job_completion, job) for job in successful_jobs]
        
        completed = 0
        for future in as_completed(futures):
            result = future.result()
            completion_results.append(result)
            completed += 1
            
            if result['status'] == 'completed':
                print(f"   ✅ Job {result['req_num']:2d}: {result['total_time']:.1f}s total ({result['queue_time']:.1f}s queue + {result['processing_time']:.1f}s process)")
            elif result['status'] == 'failed':
                print(f"   ❌ Job {result['req_num']:2d}: Failed after {result['total_time']:.1f}s")
            elif result['status'] == 'timeout':
                print(f"   ⏰ Job {result['req_num']:2d}: Timeout after {result['total_time']:.1f}s")
    
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
    else:
        avg_total = avg_queue = avg_process = max_total = min_total = 0
    
    # Results
    print(f"\n📊 RESULTS - {test_name}")
    print(f"{'='*60}")
    print(f"Total Test Time:   {total_test_time:.2f}s")
    print(f"Jobs Submitted:    {len(successful_jobs)}")
    print(f"Jobs Completed:    {len(completed_jobs)}")
    print(f"Jobs Failed:       {len(failed_jobs)}")
    print(f"Jobs Timeout:      {len(timeout_jobs)}")
    print(f"Success Rate:      {len(completed_jobs)/len(successful_jobs)*100:.1f}%")
    print(f"Actual Cost:       ${len(completed_jobs) * 0.134:.2f}")
    print(f"")
    print(f"Timing Analysis:")
    print(f"  Avg Total Time:  {avg_total:.1f}s")
    print(f"  Avg Queue Time:  {avg_queue:.1f}s")
    print(f"  Avg Process Time: {avg_process:.1f}s")
    print(f"  Min Total Time:  {min_total:.1f}s")
    print(f"  Max Total Time:  {max_total:.1f}s")
    
    return {
        'test_name': test_name,
        'num_users': num_users,
        'submitted': len(successful_jobs),
        'completed': len(completed_jobs),
        'failed': len(failed_jobs),
        'timeout': len(timeout_jobs),
        'success_rate': len(completed_jobs)/len(successful_jobs)*100 if successful_jobs else 0,
        'total_test_time': total_test_time,
        'avg_total_time': avg_total,
        'avg_queue_time': avg_queue,
        'avg_process_time': avg_process,
        'max_total_time': max_total,
        'actual_cost': len(completed_jobs) * 0.134
    }

def main():
    """Run real load tests with cost control"""
    print(f"""
🎯 PHASE 2: REAL LOAD TEST - END-TO-END WITH BEDROCK
====================================================
Testing complete flow including Bedrock Nova Canvas:
• Full end-to-end card generation
• Bedrock throttling behavior at scale
• Queue processing under real load
• Actual user experience timing

Cost: $0.134 per completed card
Target: Production environment
""")
    
    # Cost-controlled test scenarios
    test_scenarios = [
        (5, "Baseline Real Test - 5 Users", 5 * 0.134),
        (10, "Small Real Load - 10 Users", 10 * 0.134),
        (25, "Medium Real Load - 25 Users", 25 * 0.134),
        (50, "Large Real Load - 50 Users", 50 * 0.134),
        (100, "Maximum Real Load - 100 Users", 100 * 0.134)
    ]
    
    all_results = []
    total_cost = 0
    
    for num_users, test_name, estimated_cost in test_scenarios:
        print(f"\n💡 Next test: {test_name} (Est. cost: ${estimated_cost:.2f})")
        
        result = run_real_load_test(num_users, test_name, estimated_cost)
        if result:
            all_results.append(result)
            total_cost += result['actual_cost']
            
            # Brief pause between tests
            if num_users < 100:
                print(f"\n⏳ Waiting 60 seconds before next test...")
                time.sleep(60)
        else:
            print("Stopping test sequence due to cancellation")
            break
    
    # Summary report
    if all_results:
        print(f"\n" + "="*80)
        print(f"🏁 PHASE 2 SUMMARY - REAL LOAD TEST RESULTS")
        print(f"="*80)
        print(f"{'Test':<25} {'Users':<6} {'Success%':<9} {'Avg Total':<10} {'Avg Queue':<10} {'Avg Process':<11} {'Cost':<8}")
        print(f"{'-'*80}")
        
        for result in all_results:
            print(f"{result['test_name'][:24]:<25} "
                  f"{result['num_users']:<6} "
                  f"{result['success_rate']:<9.1f} "
                  f"{result['avg_total_time']:<10.1f} "
                  f"{result['avg_queue_time']:<10.1f} "
                  f"{result['avg_process_time']:<11.1f} "
                  f"${result['actual_cost']:<7.2f}")
        
        print(f"\n📈 BEDROCK SCALING ANALYSIS:")
        if len(all_results) >= 2:
            baseline = all_results[0]
            peak = all_results[-1]
            
            queue_scaling = peak['avg_queue_time'] / baseline['avg_queue_time'] if baseline['avg_queue_time'] > 0 else 1
            
            print(f"   Queue Time Scaling: {queue_scaling:.2f}x ({baseline['avg_queue_time']:.1f}s → {peak['avg_queue_time']:.1f}s)")
            print(f"   Process Time: ~{baseline['avg_process_time']:.1f}s (consistent)")
            
            if peak['success_rate'] >= 95:
                print(f"   ✅ Bedrock can handle {peak['num_users']} concurrent requests")
            else:
                print(f"   ⚠️  Bedrock shows stress at {peak['num_users']} requests ({peak['success_rate']:.1f}% success)")
        
        print(f"\n💰 TOTAL COST: ${total_cost:.2f}")
        print(f"🔮 PROJECTION FOR 10K USERS:")
        
        if all_results:
            last_result = all_results[-1]
            projected_queue_time = last_result['avg_queue_time'] * (10000 / last_result['num_users']) / 100  # Assuming 100 RPM limit
            projected_total_time = projected_queue_time + last_result['avg_process_time']
            
            print(f"   Expected queue time: {projected_queue_time:.1f}s")
            print(f"   Expected total time: {projected_total_time:.1f}s")
            print(f"   Cards per hour: ~6000 (limited by 100 RPM)")
            print(f"   10K users cost: ~$1,340 (if all generate cards)")
        
        print(f"="*80)

if __name__ == "__main__":
    main()
