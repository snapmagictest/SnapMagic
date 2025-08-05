#!/bin/bash

# Step 1: Nova Canvas Burst Test
# Tests if we can send 5 requests within 5 seconds
# If Service Quotas (2/min) is correct, requests 3-5 should fail

echo "🧪 Nova Canvas Burst Test - Step 1"
echo "=================================="
echo "Testing: 5 requests in 5 seconds"
echo "Expected: If 2/min limit is real, requests 3-5 should fail with HTTP 429"
echo ""

# Configuration - READY TO TEST
API_URL="https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card"
AUTH_TOKEN="eyJ1c2VybmFtZSI6ICJkZW1vIiwgInNlc3Npb25faWQiOiAiTjJyd0M4NFd0ZkR0dl9DSHpkT2JkUSIsICJldmVudCI6ICJzbmFwbWFnaWMtdHJhZGluZy1jYXJkcyIsICJpc3N1ZWRfYXQiOiAiMjAyNS0wOC0wNVQxNTo0ODozMC41OTQ1MDMrMDA6MDAiLCAiZXhwaXJlc19hdCI6ICIyMDI1LTA4LTA2VDE1OjQ4OjMwLjU5NDUwMyswMDowMCIsICJwZXJtaXNzaW9ucyI6IFsiY2FyZF9nZW5lcmF0aW9uIiwgInZpZGVvX2FuaW1hdGlvbiJdfQ=="

echo "🎯 Target: $API_URL"
echo "🔑 Auth: ${AUTH_TOKEN:0:20}..."
echo ""

# Test results tracking
success_count=0
fail_count=0
start_time=$(date +%s)

echo "🚀 Starting burst test at $(date)"
echo ""

# Send 5 requests with 1 second intervals
for i in {1..5}; do
    echo "📤 Request $i at $(date +%H:%M:%S)"
    
    # Send request and capture response
    response=$(curl -X POST "$API_URL" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"Burst test card #$i - $(date +%H:%M:%S)\"}" \
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
    if [ $i -lt 5 ]; then
        sleep 1
    fi
done

end_time=$(date +%s)
total_time=$((end_time - start_time))

echo ""
echo "📊 BURST TEST RESULTS"
echo "===================="
echo "✅ Successful requests: $success_count/5"
echo "❌ Failed requests: $fail_count/5"
echo "⏱️  Total test time: ${total_time}s"
echo ""

# Analyze results
if [ $success_count -eq 5 ]; then
    echo "🎉 CONCLUSION: All 5 requests succeeded!"
    echo "   → The 2/minute limit from Service Quotas appears to be INCORRECT"
    echo "   → Your actual limit is higher than 2/minute"
    echo "   → Ready for Step 2: Sustained rate testing"
elif [ $success_count -eq 2 ]; then
    echo "📋 CONCLUSION: Only 2 requests succeeded"
    echo "   → The 2/minute limit from Service Quotas appears to be CORRECT"
    echo "   → Requests 3-5 were rate limited as expected"
    echo "   → Need quota increase for your event"
elif [ $success_count -gt 2 ] && [ $success_count -lt 5 ]; then
    echo "🤔 CONCLUSION: $success_count requests succeeded"
    echo "   → Your limit is higher than 2/minute but less than 5/minute"
    echo "   → Need Step 2 testing to find exact limit"
else
    echo "⚠️  CONCLUSION: Unexpected results"
    echo "   → Check API URL and authentication token"
    echo "   → Verify your app is working normally"
fi

echo ""
echo "🔄 Next Steps:"
echo "   1. If all succeeded: Run Step 2 (sustained rate test)"
echo "   2. If some failed: You found your rate limit!"
echo "   3. If all failed: Check configuration and try again"
