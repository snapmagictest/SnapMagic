# Example Logo Configurations

## 📁 **Local Logos (Recommended)**

Place your logo files in this directory and reference them like this:

### secrets.json configuration:
```json
{
  "cardTemplate": {
    "eventName": "AWS re:Invent 2024",
    "logos": [
      {
        "enabled": true,
        "url": "logos/company-logo.png",
        "alt": "My Company",
        "position": "top-left"
      },
      {
        "enabled": true,
        "url": "logos/event-sponsor.png", 
        "alt": "Event Sponsor",
        "position": "top-right"
      },
      {
        "enabled": true,
        "url": "logos/partner-logo.svg",
        "alt": "Technology Partner",
        "position": "header-center"
      }
    ]
  }
}
```

## 🌐 **External URLs (Use with Caution)**

Only use CORS-friendly URLs:

### ✅ CORS-Friendly Examples:
```json
{
  "cardTemplate": {
    "logos": [
      {
        "enabled": true,
        "url": "https://raw.githubusercontent.com/username/repo/main/logo.png",
        "alt": "GitHub Logo",
        "position": "top-left"
      },
      {
        "enabled": true,
        "url": "https://your-bucket.s3.amazonaws.com/logo.png",
        "alt": "S3 Logo",
        "position": "top-right"
      }
    ]
  }
}
```

### ❌ CORS-Blocked Examples (Will Fail):
```json
{
  "cardTemplate": {
    "logos": [
      {
        "enabled": false,
        "url": "https://company.com/logo.png",
        "alt": "Corporate Site",
        "position": "top-left",
        "note": "❌ Most corporate sites block CORS"
      },
      {
        "enabled": false,
        "url": "https://d0.awsstatic.com/logos/some-logo.png",
        "alt": "AWS Static",
        "position": "top-right",
        "note": "❌ AWS static sites don't allow CORS"
      }
    ]
  }
}
```

## 🎯 **Best Practices**

1. **Use local logos** whenever possible
2. **Test your configuration** before deploying
3. **Keep file sizes under 100KB**
4. **Use PNG format** for transparency
5. **Square or landscape** aspect ratios work best
