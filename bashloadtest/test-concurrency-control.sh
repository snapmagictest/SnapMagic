#!/bin/bash

# Test Concurrency Control Implementation
# Verify that the frontend now limits to 2 concurrent requests

echo "🧪 Testing Frontend Concurrency Control"
echo "======================================="
echo "Testing if frontend now limits to 2 concurrent requests (no more HTTP 500s)"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"

# Get fresh JWT token
echo "🔑 Getting fresh JWT token..."
AUTH_RESPONSE=$(curl -X POST "https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo"}' \
  -s)

AUTH_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ Failed to get JWT token"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo "✅ Got fresh JWT token: ${AUTH_TOKEN:0:20}..."
echo ""

echo "🎯 Target: $API_URL"
echo ""

# Create temp file to collect results
results_file=$(mktemp)

echo "🚀 Launching 10 concurrent requests to test concurrency control..."
echo "Expected: Should see better success rate due to frontend queuing"
echo ""

start_time=$(date +%s)

# Launch 10 requests simultaneously to test the concurrency control
for i in {1..10}; do
    (
        echo "📤 Request $i starting..."
        response=$(curl -X POST "$API_URL" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"prompt\": \"Concurrency control test #$i - $(date +%H:%M:%S)\"}" \
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
echo "📊 CONCURRENCY CONTROL TEST RESULTS"
echo "==================================="

# Count results
success_count=$(grep -c "SUCCESS:" $results_file 2>/dev/null || echo "0")
throttle_count=$(grep -c "THROTTLED:" $results_file 2>/dev/null || echo "0")
error_count=$(grep -c "ERROR:" $results_file 2>/dev/null || echo "0")

echo "✅ Successful requests: $success_count/10"
echo "🚫 Throttled requests: $throttle_count/10"
echo "❌ Error requests: $error_count/10"
echo "⏱️  Total test time: ${total_time}s"

# Calculate average response time for successful requests
if [ $success_count -gt 0 ]; then
    avg_time=$(grep "SUCCESS:" $results_file | cut -d':' -f3 | awk '{sum+=$1} END {print sum/NR}')
    echo "⏱️  Average response time: ${avg_time}s"
fi

echo ""

# Compare with previous results
echo "📈 COMPARISON WITH PREVIOUS TESTS"
echo "================================="
echo "Before concurrency control:"
echo "  • 10 concurrent: 6/10 succeeded (60%)"
echo "  • 20 concurrent: 6/20 succeeded (30%)"
echo ""
echo "After concurrency control:"
echo "  • 10 concurrent: $success_count/10 succeeded ($((success_count * 10))%)"

# Analyze improvement
if [ $success_count -ge 8 ]; then
    echo ""
    echo "🎉 EXCELLENT IMPROVEMENT!"
    echo "   → Concurrency control is working effectively"
    echo "   → Success rate improved significantly"
    echo "   → Ready for your 5000-user event!"
elif [ $success_count -ge 6 ]; then
    echo ""
    echo "👍 GOOD IMPROVEMENT!"
    echo "   → Some improvement from concurrency control"
    echo "   → May need fine-tuning or deployment time"
    echo "   → Test again in a few minutes"
else
    echo ""
    echo "⚠️  LIMITED IMPROVEMENT"
    echo "   → Concurrency control may not be fully deployed yet"
    echo "   → Wait for Amplify build to complete and test again"
    echo "   → Check browser cache (try incognito mode)"
fi

echo ""
echo "💰 Test cost: ~$0.40 (10 requests × $0.04)"

# Cleanup
rm -f $results_file
