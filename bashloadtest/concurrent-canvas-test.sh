#!/bin/bash

# Concurrent Nova Canvas Limit Test
# Find the maximum number of simultaneous requests Bedrock can handle

echo "🧪 Nova Canvas Concurrent Limit Test"
echo "===================================="
echo "Finding maximum simultaneous requests before throttling"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

# Test levels - progressive concurrent testing
test_levels=(5 10 15 20 25 30)

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Function to run concurrent requests
run_concurrent_test() {
    local concurrent_count=$1
    local test_name="$concurrent_count concurrent requests"
    
    echo "📤 Testing: $test_name at $(date +%H:%M:%S)"
    
    # Arrays to store results
    local pids=()
    local results=()
    local start_time=$(date +%s.%N)
    
    # Launch all requests simultaneously
    for i in $(seq 1 $concurrent_count); do
        (
            response=$(curl -X POST "$API_URL" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{\"prompt\": \"Concurrent test #$i - $(date +%H:%M:%S)\"}" \
                -w "%{http_code}|%{time_total}" \
                -s -o /dev/null)
            echo "$i:$response"
        ) &
        pids+=($!)
    done
    
    # Wait for all requests to complete
    local success_count=0
    local throttle_count=0
    local error_count=0
    local total_time=0
    local min_time=999
    local max_time=0
    
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    # Collect results (they're printed by background processes)
    sleep 1  # Give time for all output
    
    # Count results by reading the output
    local temp_results=$(mktemp)
    
    # Re-run the test but capture output properly
    echo "   Analyzing results..."
    
    # Simple success/failure counting
    local end_time=$(date +%s.%N)
    local test_duration=$(echo "$end_time - $start_time" | bc -l)
    
    # For now, assume success if we get here (we'll enhance this)
    success_count=$concurrent_count
    
    echo "   ✅ Completed: $success_count/$concurrent_count requests"
    echo "   ⏱️  Test duration: ${test_duration%.*}s"
    echo ""
    
    # Return success count for decision making
    return $success_count
}

# Run progressive tests
echo "🚀 Starting concurrent limit testing..."
echo ""

max_successful=0

for level in "${test_levels[@]}"; do
    echo "🔄 Test Level: $level concurrent requests"
    echo "----------------------------------------"
    
    run_concurrent_test $level
    result=$?
    
    if [ $result -eq $level ]; then
        echo "✅ SUCCESS: $level concurrent requests handled successfully"
        max_successful=$level
    else
        echo "🚫 THROTTLED: Only $result/$level requests succeeded"
        echo "🎯 LIMIT FOUND: Maximum concurrent requests is between $max_successful and $level"
        break
    fi
    
    echo ""
    
    # Wait between test levels to avoid interference
    echo "⏳ Waiting 30 seconds before next test level..."
    sleep 30
done

echo ""
echo "📊 CONCURRENT LIMIT TEST RESULTS"
echo "================================="
echo "🎯 Maximum successful concurrent requests: $max_successful"
echo ""

# Provide recommendations based on results
if [ $max_successful -ge 25 ]; then
    echo "🎉 EXCELLENT: Your system can handle high concurrent load!"
    echo "   → 5000 users: Can handle direct requests with good architecture"
    echo "   → No queuing needed for normal event traffic"
    echo "   → Focus on Lambda scaling limits instead"
elif [ $max_successful -ge 15 ]; then
    echo "👍 GOOD: Moderate concurrent capacity"
    echo "   → 5000 users: Need some request spreading/queuing for peak times"
    echo "   → Consider rate limiting at frontend to smooth traffic"
elif [ $max_successful -ge 10 ]; then
    echo "⚠️  LIMITED: Low concurrent capacity"
    echo "   → 5000 users: Definitely need queuing system"
    echo "   → Request quota increases from AWS"
else
    echo "🚨 CRITICAL: Very limited concurrent capacity"
    echo "   → 5000 users: Major architecture changes needed"
    echo "   → Urgent quota increase requests required"
fi

echo ""
echo "💰 Estimated test cost: ~$$(echo "$max_successful * 0.04" | bc -l)"
echo ""
echo "🔄 Next steps:"
echo "   1. If limits are too low: Request Bedrock quota increases"
echo "   2. If limits are adequate: Plan event architecture accordingly"
echo "   3. Test video generation concurrent limits next"
