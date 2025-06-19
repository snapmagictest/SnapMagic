# Connect GitHub Repository to AWS Amplify

## Current Status
✅ **Infrastructure Deployed Successfully**
- Amplify App ID: `d3ektdqj3lnzss`
- Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d3ektdqj3lnzss
- App URL (after connection): https://main.d3ektdqj3lnzss.amplifyapp.com

## Next Steps to Complete CI/CD Setup

### 1. Connect GitHub Repository
1. **Open Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d3ektdqj3lnzss
2. **Click "Connect repository"**
3. **Select GitHub** as the source
4. **Authorize AWS Amplify** to access your GitHub account
5. **Select Repository**: `snapmagictest/SnapMagic`
6. **Select Branch**: `main`

### 2. Configure Build Settings
The build settings are already configured in the CDK deployment:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### 3. Environment Variables (Already Set)
- `AMPLIFY_MONOREPO_APP_ROOT`: `frontend`
- `AMPLIFY_DIFF_DEPLOY`: `false`
- `_LIVE_UPDATES`: Configured for Next.js

### 4. Deploy
1. **Review settings** and click "Save and deploy"
2. **Wait for build** to complete (first build may take 5-10 minutes)
3. **Access your app** at: https://main.d3ektdqj3lnzss.amplifyapp.com

## Automatic CI/CD
Once connected:
- ✅ Every push to `main` branch will trigger automatic deployment
- ✅ Build logs available in Amplify console
- ✅ Rollback capability if needed
- ✅ Preview deployments for pull requests (can be enabled)

## Troubleshooting
- **Build fails**: Check build logs in Amplify console
- **GitHub connection issues**: Ensure personal access token has repo permissions
- **Frontend not loading**: Verify Next.js build configuration

## Manual Connection Alternative
If you prefer to connect via CLI:
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Connect existing app
amplify pull --appId d3ektdqj3lnzss --envName dev
```
