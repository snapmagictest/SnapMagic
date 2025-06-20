# SnapMagic Deployment Guide

Deploy SnapMagic to your AWS account in minutes!

## 🚀 Quick Start (Any User)

### Prerequisites
- **Node.js 22.x+** installed
- **AWS CLI** configured with your credentials
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub repository** (your fork or the original)

### Option 1: Deploy Original SnapMagic (Easiest)
```bash
# 1. Clone the repository
git clone https://github.com/snapmagictest/SnapMagic.git
cd SnapMagic

# 2. Deploy infrastructure
cd infrastructure
npm run quick-deploy
```

### Option 2: Deploy Your Own Fork
```bash
# 1. Fork SnapMagic on GitHub to your account
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic

# 3. Configure for your repository
cd infrastructure
nano config/app-config.ts  # Edit repository URL

# 4. Deploy
npm run quick-deploy
```

## 📝 Configuration

### Basic Configuration
Edit `infrastructure/config/app-config.ts`:

```typescript
export const defaultConfig: SnapMagicConfig = {
  repository: {
    // CHANGE THIS to your repository
    url: 'https://github.com/YOUR-USERNAME/SnapMagic',
    branch: 'main',
    useGitHubApp: true,
  },
  
  app: {
    // CHANGE THIS to avoid naming conflicts
    name: 'my-snapmagic',
    description: 'My SnapMagic deployment',
  },
  
  // ... rest stays the same
};
```

### Advanced Configuration

#### Custom Domain
```typescript
app: {
  name: 'snapmagic',
  description: 'SnapMagic for AWS Summit',
  domain: 'snapmagic.mycompany.com', // Add custom domain
},
```

#### Password Protection
```typescript
environments: {
  prod: {
    name: 'production',
    stage: 'PRODUCTION',
    enableBasicAuth: true,
    basicAuthUsername: 'summit',
    basicAuthPassword: 'SecurePassword123!',
  }
}
```

## 🎯 Deployment Commands

### Single Environment
```bash
# Development (default)
npm run deploy

# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

### Multiple Environments
```bash
# Deploy all environments
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

## 🔧 Post-Deployment Setup

### For Public Repositories
✅ **No additional setup required!**
- Deployment starts automatically
- App will be live in 5-10 minutes

### For Private Repositories
After deployment, connect your repository:

1. **Go to Amplify Console** (URL provided in deployment output)
2. **Click "Connect repository"**
3. **Authorize GitHub access**
4. **Select your repository and branch**
5. **Deploy automatically starts**

## 📊 Deployment Outputs

After successful deployment, you'll get:

```
✅ SnapMagic-dev

Outputs:
SnapMagic-dev.AmplifyAppId = d1a2b3c4d5e6f7
SnapMagic-dev.AmplifyAppUrl = https://main.d1a2b3c4d5e6f7.amplifyapp.com
SnapMagic-dev.AmplifyConsoleUrl = https://console.aws.amazon.com/amplify/...
SnapMagic-dev.RepositoryUrl = https://github.com/YOUR-USERNAME/SnapMagic
SnapMagic-dev.DeploymentInstructions = Repository connected - deployment will start automatically
```

**Your SnapMagic URL**: Use the `AmplifyAppUrl` to access your deployed app!

## 🛠️ Troubleshooting

### "Repository not found"
- Check repository URL in `config/app-config.ts`
- Ensure repository is public or you have access
- Verify branch name exists

### "App name already exists"
- Change app name in `config/app-config.ts`
- Use unique names like `yourname-snapmagic`

### "Authentication failed"
- For private repos: Connect manually via Amplify Console
- Check GitHub permissions
- Try refreshing GitHub authorization

### "Build failed"
- Check build logs in Amplify Console
- Verify Node.js version (should be 22.x)
- Check frontend dependencies

## 🗑️ Cleanup

### Remove Single Environment
```bash
npm run destroy        # Development
npm run destroy:staging
npm run destroy:prod
```

### Remove All Resources
```bash
# Destroy all environments
npm run destroy:dev
npm run destroy:staging  
npm run destroy:prod

# Remove CDK bootstrap (optional)
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
```

## 💡 Tips for Events

### Quick Event Setup
1. **Fork SnapMagic** to your organization's GitHub
2. **Customize branding** in frontend files
3. **Deploy with password protection**:
   ```typescript
   enableBasicAuth: true,
   basicAuthUsername: 'summit2024',
   basicAuthPassword: 'AWSRocks123!',
   ```
4. **Share URL and credentials** with attendees
5. **Tear down after event** to avoid costs

### Multiple Events
Deploy different environments for different events:
```bash
# AWS Summit London
cdk deploy -c environment=london

# AWS Summit Tokyo  
cdk deploy -c environment=tokyo
```

## 📞 Support

### Common Issues
- **GitHub connection**: Use Amplify Console for private repos
- **Build failures**: Check Node.js version and dependencies
- **Domain issues**: Verify DNS settings for custom domains

### Getting Help
- Check AWS Amplify documentation
- Review CloudFormation stack events
- Check Amplify build logs in console

---

**🎉 That's it! Your SnapMagic should be deployed and ready for your AWS event!**
