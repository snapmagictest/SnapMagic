# SnapMagic Deployment Guide

This guide walks you through deploying SnapMagic in your AWS account.

## 🚀 Quick Deployment

### 1. Prerequisites Check
```bash
# Run the prerequisites checker
./scripts/check-prerequisites.sh
```

If any errors are found, see [PREREQUISITES.md](PREREQUISITES.md) for detailed setup instructions.

### 2. Deploy Infrastructure
```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Deploy to AWS
npm run deploy
```

### 3. Secure Secrets Setup
```bash
# Return to project root
cd ..

# Store GitHub token securely
./scripts/setup-secrets.sh
```

### 4. Connect GitHub Repository
1. Open the **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. Find your app: `snapmagic-dev`
3. Click **"Connect repository"**
4. Select **GitHub** and authorize AWS Amplify
5. Choose your **SnapMagic repository** and **main branch**
6. Click **"Save and deploy"**

### 5. Verify Deployment
```bash
# Run security check
./scripts/security-check.sh

# Check application status in Amplify Console
```

## 🔧 Advanced Deployment Options

### Multi-Environment Deployment
```bash
# Deploy to staging
cdk deploy --context environment=staging --profile snap

# Deploy to production  
cdk deploy --context environment=production --profile snap
```

### Custom Configuration
```bash
# Use different AWS profile
npm run deploy -- --profile myprofile

# Deploy to different region
export AWS_DEFAULT_REGION=us-west-2
npm run deploy
```

### Cleanup/Destroy
```bash
# Destroy infrastructure (saves costs)
npm run destroy

# Or via CDK directly
cdk destroy --profile snap
```

## 📊 Post-Deployment

### Verify Resources
After successful deployment, you should have:
- ✅ **Amplify App**: Hosting your frontend
- ✅ **IAM Roles**: For secure service access
- ✅ **Secrets Manager**: Storing GitHub token
- ✅ **Parameter Store**: Configuration values

### Access Your Application
- **Amplify Console**: Check build status and logs
- **Application URL**: `https://main.{APP_ID}.amplifyapp.com`
- **GitHub Integration**: Automatic deployments on push

### Monitor Costs
- Use AWS Cost Explorer to monitor spending
- Expected cost: ~$2-7/month for development
- Use auto-shutdown for temporary deployments

## 🛠️ Troubleshooting

### Common Issues

#### Deployment Fails
1. Check AWS credentials: `aws sts get-caller-identity --profile snap`
2. Verify CDK bootstrap: `cdk bootstrap --profile snap`
3. Review CloudFormation events in AWS Console

#### GitHub Connection Issues
1. Verify token permissions (repo, admin:repo_hook, read:user)
2. Check token is stored: `aws secretsmanager get-secret-value --secret-id snapmagic/dev/github/token --profile snap`
3. Re-run setup: `./scripts/setup-secrets.sh`

#### Build Failures
1. Check Amplify build logs in console
2. Verify frontend directory structure
3. Check build settings match CDK configuration

### Getting Help
1. Run prerequisites checker: `./scripts/check-prerequisites.sh`
2. Run security check: `./scripts/security-check.sh`
3. Review [PREREQUISITES.md](PREREQUISITES.md)
4. Check [SECURITY.md](SECURITY.md) for security issues

## 📚 Additional Resources

- **[PREREQUISITES.md](PREREQUISITES.md)**: Complete setup requirements
- **[SECURITY.md](SECURITY.md)**: Security best practices
- **[README.md](README.md)**: Project overview
- **AWS Documentation**: 
  - [CDK Guide](https://docs.aws.amazon.com/cdk/)
  - [Amplify Guide](https://docs.aws.amazon.com/amplify/)

---

**Ready to deploy?** Start with `./scripts/check-prerequisites.sh` 🚀
