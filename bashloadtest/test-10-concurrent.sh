#!/bin/bash

# Test 20 Concurrent Nova Canvas Requests
# Simple test to see if 20 simultaneous users can generate cards

echo "🧪 Testing 20 Concurrent Nova Canvas Requests"
echo "============================================="
echo "Simulating 20 users clicking 'Generate Card' at the same time"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Create temp file to collect results
results_file=$(mktemp)

echo "🚀 Launching 20 concurrent requests at $(date +%H:%M:%S)..."
echo ""

start_time=$(date +%s)

# Launch 20 requests simultaneously in background
for i in {1..20}; do
    (
        echo "📤 Request $i starting..."
        response=$(curl -X POST "$API_URL" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"prompt\": \"Concurrent test user #$i generating card at $(date +%H:%M:%S)\"}" \
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
echo "📊 CONCURRENT TEST RESULTS"
echo "=========================="

# Count results
success_count=$(grep -c "SUCCESS:" $results_file 2>/dev/null || echo "0")
throttle_count=$(grep -c "THROTTLED:" $results_file 2>/dev/null || echo "0")
error_count=$(grep -c "ERROR:" $results_file 2>/dev/null || echo "0")

echo "✅ Successful requests: $success_count/20"
echo "🚫 Throttled requests: $throttle_count/20"
echo "❌ Error requests: $error_count/20"
echo "⏱️  Total test time: ${total_time}s"

# Calculate average response time for successful requests
if [ $success_count -gt 0 ]; then
    avg_time=$(grep "SUCCESS:" $results_file | cut -d':' -f3 | awk '{sum+=$1} END {print sum/NR}')
    echo "⏱️  Average response time: ${avg_time}s"
fi

echo ""

# Analyze results
if [ $success_count -eq 20 ]; then
    echo "🎉 EXCELLENT: All 20 concurrent requests succeeded!"
    echo "   → Your system can handle at least 20 simultaneous users"
    echo "   → Ready to test higher concurrent levels (30, 40, 50+)"
    echo "   → For 5000 users: Looking very promising!"
elif [ $success_count -ge 15 ]; then
    echo "👍 GOOD: Most requests succeeded ($success_count/20)"
    echo "   → Your system can handle moderate concurrent load"
    echo "   → Some throttling occurring at 20 concurrent users"
    echo "   → For 5000 users: Need request smoothing/queuing"
elif [ $success_count -ge 10 ]; then
    echo "⚠️  LIMITED: Half the requests succeeded ($success_count/20)"
    echo "   → Significant throttling at 20 concurrent users"
    echo "   → For 5000 users: Definitely need queuing system"
    echo "   → Consider requesting quota increases"
else
    echo "🚨 CRITICAL: Most requests failed ($success_count/20)"
    echo "   → Severe throttling at just 20 concurrent users"
    echo "   → For 5000 users: Major architecture changes needed"
    echo "   → Urgent quota increase requests required"
fi

echo ""
echo "💰 Test cost: ~$0.80 (20 requests × $0.04)"
echo ""
echo "🔄 Next Steps:"
if [ $success_count -eq 20 ]; then
    echo "   1. Test 30 concurrent requests to find your limit"
    echo "   2. Test 50 concurrent requests if 30 succeeds"
    echo "   3. Plan event architecture based on findings"
else
    echo "   1. Request Bedrock quota increases immediately"
    echo "   2. Design queuing system for your event"
    echo "   3. Consider user flow to spread load over time"
fi

# Cleanup
rm -f $results_file
