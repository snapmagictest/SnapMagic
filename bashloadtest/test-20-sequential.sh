#!/bin/bash

# Test 20 Sequential Nova Canvas Requests
# Like our first successful test but with 20 requests instead of 5

echo "🧪 Nova Canvas Sequential Test - 20 Requests"
echo "============================================"
echo "Testing: 20 requests sent one at a time (like our first successful test)"
echo "Expected: All should succeed if sequential processing works fine"
echo ""

# Configuration
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Test results tracking
success_count=0
fail_count=0
start_time=$(date +%s)

echo "🚀 Starting sequential test at $(date)"
echo ""

# Send 20 requests with 1 second intervals (like original test)
for i in {1..20}; do
    echo "📤 Request $i at $(date +%H:%M:%S)"
    
    # Send request and capture response
    response=$(curl -X POST "$API_URL" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"Sequential test card #$i - $(date +%H:%M:%S)\"}" \
        -w "%{http_code}|%{time_total}" \
        -s -o /dev/null)
    
    # Parse response
    http_code=$(echo $response | cut -d'|' -f1)
    time_total=$(echo $response | cut -d'|' -f2)
    
    # Analyze result
    if [ "$http_code" = "200" ]; then
        echo "   ✅ SUCCESS - HTTP $http_code (${time_total}s)"
        ((success_count++))
    elif [ "$http_code" = "429" ]; then
        echo "   🚫 RATE LIMITED - HTTP $http_code (${time_total}s)"
        ((fail_count++))
    else
        echo "   ❌ ERROR - HTTP $http_code (${time_total}s)"
        ((fail_count++))
    fi
    
    # Wait 1 second before next request (except last one)
    if [ $i -lt 20 ]; then
        sleep 1
    fi
done

end_time=$(date +%s)
total_time=$((end_time - start_time))

echo ""
echo "📊 SEQUENTIAL TEST RESULTS"
echo "=========================="
echo "✅ Successful requests: $success_count/20"
echo "❌ Failed requests: $fail_count/20"
echo "⏱️  Total test time: ${total_time}s"
echo ""

# Analyze results
if [ $success_count -eq 20 ]; then
    echo "🎉 CONCLUSION: All 20 sequential requests succeeded!"
    echo "   → Sequential processing works perfectly"
    echo "   → The problem is ONLY concurrent requests (6 max)"
    echo "   → Solution: Control frontend to prevent >6 concurrent requests"
elif [ $success_count -ge 15 ]; then
    echo "👍 CONCLUSION: Most sequential requests succeeded ($success_count/20)"
    echo "   → Sequential processing mostly works"
    echo "   → Some rate limiting even with delays"
    echo "   → May need longer delays between requests"
else
    echo "🚨 CONCLUSION: Sequential requests also failing ($success_count/20)"
    echo "   → Problem is not just concurrency"
    echo "   → May have hit daily/hourly rate limits"
    echo "   → Check if we've exceeded total quota limits"
fi

echo ""
echo "💰 Test cost: ~$0.80 (20 requests × $0.04)"
echo ""
echo "🔄 Next Steps:"
if [ $success_count -eq 20 ]; then
    echo "   → Focus on frontend concurrency control (limit to 6 simultaneous)"
    echo "   → Request quota increases for concurrent limits only"
    echo "   → Sequential processing is fine for your event"
else
    echo "   → Check if we've hit daily/total quotas"
    echo "   → May need to request both concurrent AND total quota increases"
fi
