# SnapMagic Bug Report: "Failed to Fetch" Error

## 🐛 **Bug Description**
**Issue:** Frontend shows "failed to fetch" error when trying to login with d/d credentials
**Root Cause:** Frontend has hardcoded API URL that doesn't match the actual API Gateway URL from CDK deployment

## 🔍 **Problem Details**
- **Frontend API URL:** Hardcoded in `frontend/public/index.html` at line ~1046
- **Location:** `window.SNAPMAGIC_CONFIG.API_URL`
- **Issue:** CDK creates new API Gateway URL but frontend still uses old hardcoded URL
- **Result:** All API calls fail with "failed to fetch" error

## 📋 **Symptoms**
- Login with d/d credentials fails
- Browser console shows network errors
- API calls return 404 or connection refused
- Frontend can't communicate with backend

## 🚀 **QUICK FIX (Manual - Use This Immediately)**

### Step 1: Get the correct API Gateway URL from CloudFormation
```bash
aws cloudformation describe-stacks --stack-name SnapMagic-dev --region us-east-1 --query 'Stacks[0].Outputs[?OutputKey==`APIGatewayURL`].OutputValue' --output text
```

### Step 2: Apply the direct fix (Replace OLD_URL with actual old URL, NEW_URL with correct URL)
```bash
# Direct sed command to fix API URL in frontend
sed -i "s|API_URL: 'https://OLD_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/dev/'|API_URL: 'https://NEW_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/dev/'|g" frontend/public/index.html

# Verify the change
grep -A 1 -B 1 "API_URL:" frontend/public/index.html

# Commit and push
git add frontend/public/index.html
git commit -m "Fix: Update API Gateway URL to resolve failed to fetch error"
git push origin main
```

### Step 3: Wait for Amplify build to complete (~2-3 minutes)
```bash
# Monitor build status
aws amplify list-jobs --app-id YOUR_APP_ID --branch-name main --max-results 1 --region us-east-1
```

## 🔧 **Example of Actual Fix Used**
```bash
# This was the exact command that worked:
sed -i "s|API_URL: 'https://tfhqgndae5.execute-api.us-east-1.amazonaws.com/dev/'|API_URL: 'https://0fxew5t0q0.execute-api.us-east-1.amazonaws.com/dev/'|g" frontend/public/index.html
```

## ✅ **Verification Steps**
1. **Check frontend has correct URL:**
   ```bash
   curl -s https://main.YOUR_APP_ID.amplifyapp.com/ | grep -A 1 -B 1 "API_URL:"
   ```

2. **Test login API directly:**
   ```bash
   curl -s -X POST https://NEW_API_URL/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "d", "password": "d"}'
   ```

3. **Test frontend login:** Open app in browser and login with d/d

## 🎯 **Why This Happens**
- CDK deploys new infrastructure with new API Gateway ID
- Frontend code in GitHub repo still has old hardcoded API URL
- Amplify builds from GitHub repo without updating the URL
- Result: Frontend tries to call non-existent API endpoint

## 🛠️ **Long-term Solution (For Future)**
Update `amplify.yml` to automatically replace API URL during build:
```yaml
build:
  commands:
    - sed -i "s|API_URL: 'https://[^']*'|API_URL: '$SNAPMAGIC_API_URL'|g" frontend/public/index.html
```

## ⚡ **Time to Resolution**
- **Manual Fix:** ~5 minutes (immediate)
- **Build Time:** ~3 minutes
- **Total:** ~8 minutes

## 📝 **Notes**
- This bug occurs on every fresh CDK deployment
- The fix is always the same: update the hardcoded API URL
- Single point of failure: `window.SNAPMAGIC_CONFIG.API_URL` in index.html
- Once fixed, all API calls work (login, transform, video, rating)

## 🚨 **Emergency Command**
When user says "use the fix" - run this immediately:
```bash
# 1. Get current API URL from CloudFormation
API_URL=$(aws cloudformation describe-stacks --stack-name SnapMagic-dev --region us-east-1 --query 'Stacks[0].Outputs[?OutputKey==`APIGatewayURL`].OutputValue' --output text)

# 2. Apply the fix
sed -i "s|API_URL: 'https://[^']*'|API_URL: '$API_URL'|g" frontend/public/index.html

# 3. Commit and push
git add frontend/public/index.html
git commit -m "Fix: Update API Gateway URL to resolve failed to fetch error"
git push origin main

echo "✅ Fix applied! API URL updated to: $API_URL"
```

---
**Last Updated:** 2025-06-21  
**Status:** RESOLVED - Manual fix documented for immediate use
