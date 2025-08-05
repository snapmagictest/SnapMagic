#!/bin/bash

# Test Exactly 6 Concurrent Nova Canvas Requests
# Testing if 6 is truly the magic number or if system gets overwhelmed

echo "🧪 Testing Exactly 6 Concurrent Nova Canvas Requests"
echo "===================================================="
echo "Testing if 6 concurrent requests all succeed (finding the real limit)"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Create temp file to collect results
results_file=$(mktemp)

echo "🚀 Launching exactly 6 concurrent requests at $(date +%H:%M:%S)..."
echo ""

start_time=$(date +%s)

# Launch exactly 6 requests simultaneously in background
for i in {1..6}; do
    (
        echo "📤 Request $i starting..."
        response=$(curl -X POST "$API_URL" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"prompt\": \"6-concurrent test user #$i generating card at $(date +%H:%M:%S)\"}" \
            -w "%{http_code}|%{time_total}" \
            -s -o /dev/null)
        
        http_code=$(echo $response | cut -d'|' -f1)
        time_total=$(echo $response | cut -d'|' -f2)
        
        if [ "$http_code" = "200" ]; then
            echo "   ✅ Request $i: SUCCESS (${time_total}s)"
            echo "SUCCESS:$i:$time_total" >> $results_file
        elif [ "$http_code" = "429" ]; then
            echo "   🚫 Request $i: THROTTLED (${time_total}s)"
            echo "THROTTLED:$i:$time_total" >> $results_file
        else
            echo "   ❌ Request $i: ERROR $http_code (${time_total}s)"
            echo "ERROR:$i:$http_code:$time_total" >> $results_file
        fi
    ) &
done

# Wait for all background processes to complete
wait

end_time=$(date +%s)
total_time=$((end_time - start_time))

echo ""
echo "📊 6-CONCURRENT TEST RESULTS"
echo "============================"

# Count results
success_count=$(grep -c "SUCCESS:" $results_file 2>/dev/null || echo "0")
throttle_count=$(grep -c "THROTTLED:" $results_file 2>/dev/null || echo "0")
error_count=$(grep -c "ERROR:" $results_file 2>/dev/null || echo "0")

echo "✅ Successful requests: $success_count/6"
echo "🚫 Throttled requests: $throttle_count/6"
echo "❌ Error requests: $error_count/6"
echo "⏱️  Total test time: ${total_time}s"

# Calculate average response time for successful requests
if [ $success_count -gt 0 ]; then
    avg_time=$(grep "SUCCESS:" $results_file | cut -d':' -f3 | awk '{sum+=$1} END {print sum/NR}')
    echo "⏱️  Average response time: ${avg_time}s"
fi

echo ""

# Analyze results
if [ $success_count -eq 6 ]; then
    echo "🎉 PERFECT: All 6 concurrent requests succeeded!"
    echo "   → 6 is indeed the exact concurrent limit"
    echo "   → Your system can reliably handle exactly 6 simultaneous users"
    echo "   → Frontend should limit to 6 concurrent requests maximum"
elif [ $success_count -ge 4 ]; then
    echo "👍 MOSTLY GOOD: $success_count/6 requests succeeded"
    echo "   → The limit might be slightly less than 6"
    echo "   → Some variability in the system under load"
    echo "   → Frontend should limit to 4-5 concurrent requests to be safe"
elif [ $success_count -ge 2 ]; then
    echo "⚠️  INCONSISTENT: Only $success_count/6 requests succeeded"
    echo "   → The system is unstable even at 6 concurrent requests"
    echo "   → Real limit might be 3-4 concurrent requests"
    echo "   → Need to test lower numbers (3, 4, 5 concurrent)"
else
    echo "🚨 CRITICAL: Most requests failed at just 6 concurrent"
    echo "   → System is very unstable under any concurrent load"
    echo "   → May have hit other limits (Lambda, network, etc.)"
    echo "   → Need to investigate other bottlenecks"
fi

echo ""
echo "💰 Test cost: ~$0.24 (6 requests × $0.04)"
echo ""
echo "🔄 Next Steps:"
if [ $success_count -eq 6 ]; then
    echo "   → Confirmed: Set frontend limit to exactly 6 concurrent requests"
    echo "   → This will give you 100% success rate for your event"
    echo "   → No need for quota increases if you control concurrency"
elif [ $success_count -ge 4 ]; then
    echo "   → Set frontend limit to $((success_count - 1)) concurrent requests to be safe"
    echo "   → Test with $((success_count - 1)) concurrent to confirm stability"
else
    echo "   → Test 3, 4, and 5 concurrent requests to find stable limit"
    echo "   → May need to investigate other system bottlenecks"
fi

# Cleanup
rm -f $results_file
