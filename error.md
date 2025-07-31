# SnapMagic Error Log

## Gallery Loading Error - Lambda Response Size Limit (413)

**Date**: 2025-07-31  
**Context**: Gallery fails to load when 3+ cards exist  
**Status**: **ROOT CAUSE IDENTIFIED**

### Error Details

```
Access to fetch at 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card' 
from origin 'https://main.d1qiuiqc1u6moe.amplifyapp.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.

POST https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev/api/transform-card 
net::ERR_FAILED 502 (Bad Gateway)

❌ Error loading existing cards: TypeError: Failed to fetch
    at SnapMagicApp.loadExistingCards (app.js:4094:36)
    at SnapMagicApp.handleLogin (app.js:804:28)
```

### **ROOT CAUSE IDENTIFIED**

**Primary Issue**: **Lambda Response Size Limit Exceeded (413 Payload Too Large)**  
**Secondary Issue**: 502 Bad Gateway when Lambda fails to return response  
**Tertiary Issue**: CORS error due to missing headers when Lambda crashes  

### CloudWatch Evidence

```
[ERROR] [1753682494501] LAMBDA_RUNTIME Failed to post handler success response. Http response code: 413.
[ERROR] [1753682539077] LAMBDA_RUNTIME Failed to post handler success response. Http response code: 413.
[ERROR] [1753682698394] LAMBDA_RUNTIME Failed to post handler success response. Http response code: 413.
```

### Technical Root Cause

**Problem**: `load_session_cards` endpoint returns **base64 image data** for ALL cards in single response

**Code Issue** (lambda_handler.py lines 1842-1850):
```python
# Gets base64 data for EVERY card
image_base64 = base64.b64encode(image_data).decode('utf-8')
card_data = {
    'result': image_base64,  # PROBLEM: Huge base64 strings
    'finalImageSrc': presigned_url,
    'imageSrc': presigned_url,
    # ... other data
}
```

**Math**: 
- Each card image ~2-4MB base64 data
- 3 cards = 6-12MB response
- **Lambda response limit = 6MB**
- Result: 413 Payload Too Large → 502 Bad Gateway → CORS error

### Why It Happens at 3+ Cards

- **1-2 cards**: Response under 6MB limit ✅
- **3+ cards**: Response exceeds 6MB limit ❌
- **NOT related to**: Memory exhaustion, pagination, or footer changes

### Solution Required

**Remove base64 data from gallery loading response:**

```python
# REMOVE this line from load_session_cards:
'result': image_base64,  # Delete this

# Gallery only needs S3 URLs:
'finalImageSrc': presigned_url,  # Keep this
'imageSrc': presigned_url,       # Keep this
```

**Why this works:**
- Gallery displays images via S3 URLs, not base64 data
- Base64 data only needed for download functionality
- Can fetch base64 on-demand when user clicks download

### Implementation Steps

1. **Edit lambda_handler.py**: Remove `'result': image_base64` from `load_session_cards` response
2. **Update frontend**: Fetch base64 data on-demand for downloads if needed
3. **Deploy**: CDK deploy to update Lambda function
4. **Test**: Verify gallery loads with 3+ cards

### Previous Misdiagnosis

- ❌ **Memory exhaustion**: Lambda has sufficient memory
- ❌ **Pagination needed**: Response count not the issue, response SIZE is
- ❌ **Footer changes**: Completely unrelated frontend rendering
- ❌ **Missing deployment**: Code is deployed, but has wrong logic

### Notes

- This is a **design flaw**, not a deployment issue
- Gallery loading should never return full image data
- S3 presigned URLs are sufficient for display
- Base64 data should be fetched on-demand only

---

**Status**: **ROOT CAUSE IDENTIFIED - READY FOR FIX**  
**Priority**: High (blocks gallery functionality)  
**Category**: Lambda Response Size Limit / API Design Flaw  
**Fix Required**: Remove base64 data from gallery loading response
