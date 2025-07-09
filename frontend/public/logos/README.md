# SnapMagic Logos Directory

This directory contains logos that will be used in your trading card templates.

## 🎯 **Recommended Approach: Local Logos**

Place your logo files in this directory for the best performance and reliability:

```
frontend/public/logos/
├── my-company-logo.png
├── event-sponsor.png
├── partner-logo.svg
└── custom-brand.png
```

### **Benefits of Local Logos:**
- ✅ **No CORS issues** - Always works
- ✅ **Fast loading** - No network requests
- ✅ **Reliable** - Files won't disappear
- ✅ **Secure** - No external requests
- ✅ **High quality** - You control the image

## 📝 **Configuration in secrets.json**

### **Local Logo Configuration (Recommended):**
```json
{
  "cardTemplate": {
    "logos": [
      {
        "enabled": true,
        "url": "logos/my-company-logo.png",
        "alt": "My Company",
        "position": "top-left"
      }
    ]
  }
}
```

### **External URL Configuration (Not Recommended):**
```json
{
  "cardTemplate": {
    "logos": [
      {
        "enabled": true,
        "url": "https://example.com/logo.png",
        "alt": "External Logo",
        "position": "top-right"
      }
    ]
  }
}
```

## ⚠️ **CORS Warning for External URLs**

If you use external URLs, they **MUST** have proper CORS headers or they will fail to load:

### **CORS-Friendly Services:**
- ✅ **GitHub Raw**: `https://raw.githubusercontent.com/user/repo/main/logo.png`
- ✅ **Your own S3 bucket** with CORS enabled
- ✅ **CDNs with CORS** (Cloudflare, etc.)

### **CORS-Blocked Services:**
- ❌ **Most corporate websites** (no CORS headers)
- ❌ **Social media images** (Facebook, LinkedIn, etc.)
- ❌ **Google Images** or random web images
- ❌ **AWS Static sites** without CORS (like d0.awsstatic.com)

## 🖼️ **Image Requirements**

### **Supported Formats:**
- PNG (recommended for transparency)
- JPG/JPEG
- SVG
- WebP

### **Recommended Specifications:**
- **Size**: 100x100 to 400x400 pixels
- **Format**: PNG with transparency
- **File size**: Under 100KB for fast loading
- **Aspect ratio**: Square (1:1) or landscape (2:1) work best

## 🔧 **Logo Positions**

Available positions in the trading card template:

- `top-left` - Upper left corner
- `top-right` - Upper right corner  
- `top-center` - Top center
- `header-left` - Header area left
- `header-right` - Header area right
- `header-center` - Header area center

## 🚨 **Important Notes**

1. **AWS "Powered by" logo is mandatory** and always appears in the footer
2. **Local logos are processed faster** than external URLs
3. **External URLs may fail** due to CORS restrictions
4. **Test your logos** before deploying to production
5. **Keep file sizes small** for better performance

## 🛠️ **Testing Your Logos**

After adding logos to this directory:

1. Update your `secrets.json` configuration
2. Deploy your changes: `cdk deploy SnapMagicStack`
3. Generate a test trading card
4. Verify all logos appear correctly

## 📞 **Troubleshooting**

### **Logo not appearing:**
- Check file path in `secrets.json`
- Verify file exists in `logos/` directory
- Check browser console for CORS errors
- Ensure file format is supported

### **CORS errors with external URLs:**
- Move logo to `logos/` directory (recommended)
- Or find a CORS-friendly URL
- Or set up your own CDN with CORS headers

---

**💡 Pro Tip**: Use local logos in the `logos/` directory for the most reliable experience!
