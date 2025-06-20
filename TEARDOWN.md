# SnapMagic Teardown Guide

Quick reference for tearing down SnapMagic after an event.

## 🚀 Quick Teardown (Recommended)

### Option 1: CDK Destroy
```bash
cd infrastructure
cdk destroy
```

### Option 2: Automated Script
```bash
cd scripts
./teardown.sh
```

### Option 3: AWS CLI
```bash
aws amplify delete-app --app-id YOUR-APP-ID --region us-east-1
```

## 🎯 What Gets Deleted

### ✅ AWS Resources Removed:
- **Amplify App** (snapmagic-hello-world)
- **CloudFront Distribution** (automatic)
- **Build artifacts** and logs
- **Custom domain** (if configured)
- **Environment variables**
- **Branch configurations**

### 💰 Cost Impact:
- **Hosting**: $0/month (deleted)
- **Build minutes**: Already consumed (no ongoing cost)
- **Data transfer**: No ongoing cost after deletion

## 🧹 Optional Cleanup

### GitHub Repository
- Repository: https://github.com/snapmagictest/SnapMagic
- Action: Keep for future events or delete if no longer needed

### Local Files
- Location: Current project directory
- Action: Archive or delete as needed

## 🔍 Verification

After teardown, verify deletion:

1. **Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1
2. **App URL**: https://main.YOUR-APP-ID.amplifyapp.com/ (should return 404)
3. **AWS CLI**: `aws amplify list-apps --region us-east-1`

## 🚨 Emergency Teardown

If you need to tear down immediately during an event:

```bash
# Single command - no confirmation
aws amplify delete-app --app-id YOUR-APP-ID --region us-east-1 --force
```

## 📞 Support

If teardown fails:
1. Check AWS Console manually
2. Verify IAM permissions
3. Contact AWS Support if needed

---

**⚠️ Important**: Teardown is irreversible. Ensure you have backups of any important data before proceeding.
