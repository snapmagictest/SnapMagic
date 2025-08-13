#!/usr/bin/env python3
"""
Phase 1: Mock Load Test - Infrastructure Scaling Test (NO Bedrock calls)
Tests API Gateway, Lambda, SQS, DynamoDB scaling without Bedrock costs
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

def submit_mock_job(req_num, token):
    """Submit job but don't actually process - tests infrastructure only"""
    start = time.time()
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-Device-ID': f'mock_load_{req_num}'
    }
    
    data = {
        "action": "transform_card",
        "prompt": f"MOCK LOAD TEST #{req_num} - Infrastructure scaling test",
        "user_name": f"Mock User {req_num}",
        "user_number": req_num,
        "device_id": f"mock_load_{req_num}",
        "display_name": f"Mock Test #{req_num}"
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
                'status': 'submitted',
                'timestamp': datetime.now().isoformat()
            }
        else:
            return {
                'req_num': req_num,
                'job_id': None,
                'submit_time': submit_time,
                'status': 'failed',
                'error': f"HTTP {response.status_code}",
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        return {
            'req_num': req_num,
            'job_id': None,
            'submit_time': time.time() - start,
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

def run_load_test(num_users, test_name):
    """Run load test with specified number of users"""
    print(f"\n🚀 {test_name}")
    print(f"{'='*60}")
    print(f"Users: {num_users}")
    print(f"Target: {API_BASE_URL}")
    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*60}")
    
    # Get token
    try:
        token = get_token()
        print("✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None
    
    # Submit all jobs concurrently
    start_time = time.time()
    results = []
    
    print(f"\n📤 Submitting {num_users} jobs concurrently...")
    
    with ThreadPoolExecutor(max_workers=min(num_users, 100)) as executor:
        futures = [executor.submit(submit_mock_job, i, token) for i in range(1, num_users + 1)]
        
        completed = 0
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            completed += 1
            
            # Progress indicator
            if completed % max(1, num_users // 10) == 0:
                progress = (completed / num_users) * 100
                elapsed = time.time() - start_time
                print(f"   Progress: {completed}/{num_users} ({progress:.1f}%) - {elapsed:.2f}s")
    
    total_time = time.time() - start_time
    
    # Analyze results
    successful = [r for r in results if r['status'] == 'submitted']
    failed = [r for r in results if r['status'] != 'submitted']
    
    if successful:
        submit_times = [r['submit_time'] for r in successful]
        avg_submit = statistics.mean(submit_times)
        min_submit = min(submit_times)
        max_submit = max(submit_times)
        p95_submit = statistics.quantiles(submit_times, n=20)[18] if len(submit_times) > 1 else submit_times[0]
    else:
        avg_submit = min_submit = max_submit = p95_submit = 0
    
    # Results
    print(f"\n📊 RESULTS - {test_name}")
    print(f"{'='*60}")
    print(f"Total Time:        {total_time:.2f}s")
    print(f"Successful Jobs:   {len(successful)}/{num_users} ({len(successful)/num_users*100:.1f}%)")
    print(f"Failed Jobs:       {len(failed)}")
    print(f"Throughput:        {len(successful)/total_time:.2f} jobs/sec")
    print(f"")
    print(f"Submit Time Stats:")
    print(f"  Average:         {avg_submit:.3f}s")
    print(f"  Min:             {min_submit:.3f}s") 
    print(f"  Max:             {max_submit:.3f}s")
    print(f"  95th percentile: {p95_submit:.3f}s")
    
    if failed:
        print(f"\n❌ Failed Jobs:")
        for fail in failed[:5]:  # Show first 5 failures
            print(f"   Job {fail['req_num']}: {fail.get('error', 'Unknown error')}")
        if len(failed) > 5:
            print(f"   ... and {len(failed)-5} more")
    
    return {
        'test_name': test_name,
        'num_users': num_users,
        'total_time': total_time,
        'successful': len(successful),
        'failed': len(failed),
        'success_rate': len(successful)/num_users*100,
        'throughput': len(successful)/total_time,
        'avg_submit_time': avg_submit,
        'max_submit_time': max_submit,
        'p95_submit_time': p95_submit
    }

def main():
    """Run progressive load tests"""
    print(f"""
🎯 PHASE 1: MOCK LOAD TEST - INFRASTRUCTURE SCALING
=====================================================
Testing infrastructure capacity WITHOUT Bedrock calls:
• API Gateway scaling and response times
• Lambda concurrent execution limits  
• SQS queue handling and throughput
• DynamoDB write capacity and performance
• Overall system bottlenecks

Cost: ~$0 (only AWS infrastructure, no Bedrock charges)
Target: Production environment
""")
    
    # Progressive load tests
    test_scenarios = [
        (10, "Baseline Test - 10 Users"),
        (50, "Medium Load - 50 Users"), 
        (100, "High Load - 100 Users"),
        (200, "Stress Test - 200 Users"),
        (500, "Peak Load - 500 Users"),
        (1000, "Maximum Load - 1000 Users")
    ]
    
    all_results = []
    
    for num_users, test_name in test_scenarios:
        result = run_load_test(num_users, test_name)
        if result:
            all_results.append(result)
        
        # Brief pause between tests
        if num_users < 1000:
            print(f"\n⏳ Waiting 30 seconds before next test...")
            time.sleep(30)
    
    # Summary report
    print(f"\n" + "="*80)
    print(f"🏁 PHASE 1 SUMMARY - INFRASTRUCTURE SCALING RESULTS")
    print(f"="*80)
    print(f"{'Test':<25} {'Users':<8} {'Success%':<10} {'Throughput':<12} {'Avg Submit':<12} {'Max Submit':<12}")
    print(f"{'-'*80}")
    
    for result in all_results:
        print(f"{result['test_name'][:24]:<25} "
              f"{result['num_users']:<8} "
              f"{result['success_rate']:<10.1f} "
              f"{result['throughput']:<12.2f} "
              f"{result['avg_submit_time']:<12.3f} "
              f"{result['max_submit_time']:<12.3f}")
    
    print(f"\n📈 SCALING ANALYSIS:")
    if len(all_results) >= 2:
        baseline = all_results[0]
        peak = all_results[-1]
        
        throughput_scaling = peak['throughput'] / baseline['throughput']
        latency_degradation = peak['avg_submit_time'] / baseline['avg_submit_time']
        
        print(f"   Throughput Scaling: {throughput_scaling:.2f}x ({baseline['throughput']:.2f} → {peak['throughput']:.2f} jobs/sec)")
        print(f"   Latency Impact: {latency_degradation:.2f}x ({baseline['avg_submit_time']:.3f}s → {peak['avg_submit_time']:.3f}s)")
        
        if peak['success_rate'] >= 95:
            print(f"   ✅ Infrastructure can handle {peak['num_users']} concurrent users")
        else:
            print(f"   ⚠️  Infrastructure shows stress at {peak['num_users']} users ({peak['success_rate']:.1f}% success)")
    
    print(f"\n💡 NEXT STEP: Run Phase 2 with real Bedrock calls on smaller scale")
    print(f"="*80)

if __name__ == "__main__":
    main()
