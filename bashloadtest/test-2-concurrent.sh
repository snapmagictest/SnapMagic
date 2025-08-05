#!/bin/bash

# Test Exactly 2 Concurrent Nova Canvas Requests
# Testing the conservative safe limit

echo "🧪 Testing Exactly 2 Concurrent Nova Canvas Requests"
echo "===================================================="
echo "Testing if 2 concurrent requests reliably succeed (conservative safe limit)"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Create temp file to collect results
results_file=$(mktemp)

echo "🚀 Launching exactly 2 concurrent requests at $(date +%H:%M:%S)..."
echo ""

start_time=$(date +%s)

# Launch exactly 2 requests simultaneously in background
for i in {1..2}; do
    (
        echo "📤 Request $i starting..."
        response=$(curl -X POST "$API_URL" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"prompt\": \"2-concurrent test user #$i generating card at $(date +%H:%M:%S)\"}" \
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
echo "📊 2-CONCURRENT TEST RESULTS"
echo "============================"

# Count results
success_count=$(grep -c "SUCCESS:" $results_file 2>/dev/null || echo "0")
throttle_count=$(grep -c "THROTTLED:" $results_file 2>/dev/null || echo "0")
error_count=$(grep -c "ERROR:" $results_file 2>/dev/null || echo "0")

echo "✅ Successful requests: $success_count/2"
echo "🚫 Throttled requests: $throttle_count/2"
echo "❌ Error requests: $error_count/2"
echo "⏱️  Total test time: ${total_time}s"

# Calculate average response time for successful requests
if [ $success_count -gt 0 ]; then
    avg_time=$(grep "SUCCESS:" $results_file | cut -d':' -f3 | awk '{sum+=$1} END {print sum/NR}')
    echo "⏱️  Average response time: ${avg_time}s"
fi

echo ""

# Analyze results
if [ $success_count -eq 2 ]; then
    echo "🎉 PERFECT: Both concurrent requests succeeded!"
    echo "   → 2 is a reliable concurrent limit"
    echo "   → Frontend should limit to 2 concurrent requests maximum"
    echo "   → This gives you predictable, stable performance"
else
    echo "🚨 CONCERNING: Only $success_count/2 requests succeeded"
    echo "   → Even 2 concurrent requests are not 100% reliable"
    echo "   → May need to limit to 1 concurrent request only"
    echo "   → System may have other bottlenecks"
fi

echo ""
echo "💰 Test cost: ~$0.08 (2 requests × $0.04)"
echo ""
echo "🔄 Next Steps:"
if [ $success_count -eq 2 ]; then
    echo "   → Implement frontend limit of 2 concurrent requests"
    echo "   → Test multiple rounds of 2 concurrent to confirm consistency"
    echo "   → This conservative approach ensures reliability for your event"
else
    echo "   → Consider limiting to 1 concurrent request only"
    echo "   → Investigate other system bottlenecks"
fi

# Cleanup
rm -f $results_file
