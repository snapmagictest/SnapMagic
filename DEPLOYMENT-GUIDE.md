# SnapMagic Deployment Guide

## 🚀 Complete Step-by-Step Deployment

### Prerequisites
- **Node.js 22.x+** installed
- **AWS CLI** configured with your credentials
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub account** with a personal access token

### Step 1: Fork & Clone Repository
```bash
# 1. Go to https://github.com/snapmagictest/SnapMagic
# 2. Click the "Fork" button (top right)
# 3. Clone YOUR fork (not the original)
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic
```

### Step 2: Navigate to Infrastructure
```bash
cd infrastructure
npm run setup
```

### Step 3: Start Deployment
```bash
npm run deploy
```

### Step 4: Interactive Prompts
The deployment will ask you for the following information:

#### 📁 **GitHub Repository URL**
```
Prompt: GitHub Repository URL (e.g., https://github.com/username/SnapMagic):
Enter: https://github.com/YOUR-USERNAME/SnapMagic
```

#### 🔑 **GitHub Personal Access Token**
```
Prompt: Token: 
Enter: [paste your GitHub token - will be hidden with asterisks]
```
**How to get token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select "repo" permissions
4. Copy the token

#### 🌿 **GitHub Branch**
```
Prompt: GitHub Branch (default: main):
Enter: main
```
(or press Enter for default)

#### 📱 **Amplify App Name**
```
Prompt: Amplify App Name (default: snapmagic-abc123):
Enter: my-snapmagic-app
```
(choose a unique name)

#### 🔒 **Password Protection**
```
Prompt: Enable password protection? (y/N):
Enter: y
```

If you choose `y`, you'll be asked for:

#### 👤 **Username**
```
Prompt: Username (for attendees):
Enter: summit2024
```
(this is what event attendees will use to login)

#### 🔐 **Password**
```
Prompt: Password (for attendees):
Enter: AWSRocks123!
```
(this will be hidden with asterisks)

### Step 5: Wait for Deployment
```
✅ Configuration collected successfully!
🚀 Deploying SnapMagic to AWS...

✅ CDK stack configured for environment: dev
📁 Repository: https://github.com/YOUR-USERNAME/SnapMagic
🌿 Branch: main
📱 App Name: my-snapmagic-app
🔒 Basic Auth: Enabled (summit2024)

🚀 Deploying to AWS...
```

### Step 6: Get Your Live URL
After deployment completes (5-10 minutes), you'll get:
```
✅ SnapMagic-dev

Outputs:
SnapMagic-dev.AmplifyAppUrl = https://main.d1a2b3c4d5e6f7.amplifyapp.com
SnapMagic-dev.AmplifyConsoleUrl = https://console.aws.amazon.com/amplify/...
SnapMagic-dev.RepositoryConnected = https://github.com/YOUR-USERNAME/SnapMagic
SnapMagic-dev.BranchConnected = main
SnapMagic-dev.DeploymentStatus = Repository connected - build will start automatically
```

**Your SnapMagic is now live!** 🎉

### Step 7: Share with Event Attendees
If you enabled password protection, share these credentials:
- **URL**: https://main.d1a2b3c4d5e6f7.amplifyapp.com
- **Username**: summit2024
- **Password**: AWSRocks123!

## 🎯 Example Complete Flow
```bash
$ cd infrastructure
$ npm run setup
$ npm run deploy

🎯 SnapMagic requires some information to connect to your GitHub repository...

🚀 SnapMagic Deployment Setup
==============================
Please provide the following information:

📁 GitHub Repository URL (e.g., https://github.com/username/SnapMagic): https://github.com/johndoe/SnapMagic

🔑 GitHub Personal Access Token:
   Create at: https://github.com/settings/tokens
   Required permissions: repo (Full control of private repositories)
   Token: ****************************************

🌿 GitHub Branch (default: main): main

📱 Amplify App Name (default: snapmagic-abc123): johndoe-snapmagic

🔒 Password Protection:
   This will protect your SnapMagic app with username/password.
   Perfect for AWS events - share credentials with attendees.
   Enable password protection? (y/N): y

   👤 Username (for attendees): summit2024
   🔐 Password (for attendees): ********

   ✅ Basic Auth configured: summit2024 / [password hidden]

✅ Configuration collected successfully!
🚀 Deploying SnapMagic to AWS...

✅ CDK stack configured for environment: dev
📁 Repository: https://github.com/johndoe/SnapMagic
🌿 Branch: main
📱 App Name: johndoe-snapmagic
🔒 Basic Auth: Enabled (summit2024)

🚀 Deploying to AWS...

[CDK deployment output...]

✅ Your SnapMagic is live at: https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

## 🆘 Troubleshooting

### "Invalid GitHub repository URL format"
- Make sure URL includes `github.com` and has format: `https://github.com/username/repo`

### "GitHub token is required and must be valid"
- Token must be at least 10 characters
- Must have `repo` permissions
- Check token hasn't expired

### "Password is required when basic auth is enabled"
- If you choose password protection, you must provide a password
- Password cannot be empty

## 🗑️ Cleanup After Event
```bash
cd infrastructure
npm run destroy
```

This will remove all AWS resources and stop any charges.
