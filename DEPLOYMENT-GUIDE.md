# SnapMagic Deployment Guide

## 🚀 Complete Step-by-Step Deployment

### Prerequisites
- **Node.js 22.x+** installed
- **AWS CLI** configured with your credentials ⚠️ **REQUIRED**
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub account** with a personal access token

### Step 0: Setup AWS CLI (REQUIRED)
Before you can deploy SnapMagic, you must configure AWS CLI:

#### Install AWS CLI
```bash
# Windows: Download from https://aws.amazon.com/cli/
# macOS: 
brew install awscli

# Linux:
sudo apt-get update
sudo apt-get install awscli
```

#### Configure AWS CLI
```bash
aws configure
```

You'll be prompted for:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

#### Get AWS Credentials
1. **Go to AWS Console**: https://console.aws.amazon.com/
2. **Click your username** (top right) → **Security credentials**
3. **Scroll to Access keys** → **Create access key**
4. **Copy the Access Key ID and Secret Access Key**
5. **Use these in `aws configure`**

#### Verify AWS CLI Works
```bash
aws sts get-caller-identity
```

Should return something like:
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourUsername"
}
```

**⚠️ If this doesn't work, CDK deployment will fail!**

### Step 1: Verify Prerequisites
Before starting, verify everything is installed and configured:

```bash
# Check Node.js version (should be 22.x+)
node --version

# Check AWS CLI is configured
aws sts get-caller-identity

# Check CDK is installed
cdk --version

# Check you can access GitHub
curl -s https://api.github.com/user -H "Authorization: token YOUR_GITHUB_TOKEN"
```

All commands should work without errors before proceeding.

**Quick Check Script:**
```bash
# After cloning the repository
cd SnapMagic
./scripts/check-prerequisites.sh
```
This script will verify all prerequisites automatically.

### Step 2: Fork & Clone Repository
```bash
# 1. Go to https://github.com/snapmagictest/SnapMagic
# 2. Click the "Fork" button (top right)
# 3. Clone YOUR fork (not the original)
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic
```

### Step 3: Navigate to Infrastructure
```bash
cd infrastructure
npm run setup
```

### Step 4: Start Deployment
```bash
npm run deploy
```

### Step 5: Interactive Prompts
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

### Step 6: Wait for Deployment
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

### Step 7: Get Your Live URL
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

### Step 8: Share with Event Attendees
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

### "Unable to locate credentials"
```
Error: Unable to locate credentials. You can configure credentials by running "aws configure".
```
**Solution:** You haven't configured AWS CLI. Run `aws configure` and provide your AWS credentials.

### "The security token included in the request is invalid"
```
Error: The security token included in the request is invalid
```
**Solution:** Your AWS credentials are invalid or expired. Run `aws configure` with new credentials.

### "Access Denied" errors
```
Error: User: arn:aws:iam::123456789012:user/username is not authorized to perform: amplify:CreateApp
```
**Solution:** Your AWS user needs permissions for Amplify, CloudFormation, and IAM. Contact your AWS administrator.

### "Invalid GitHub repository URL format"
- Make sure URL includes `github.com` and has format: `https://github.com/username/repo`

### "GitHub token is required and must be valid"
- Token must be at least 10 characters
- Must have `repo` permissions
- Check token hasn't expired

### "Password is required when basic auth is enabled"
- If you choose password protection, you must provide a password
- Password cannot be empty

### CDK Bootstrap Required
```
Error: This stack uses assets, so the toolkit stack must be deployed to the environment
```
**Solution:** Run CDK bootstrap first:
```bash
cdk bootstrap
```

## 🗑️ Cleanup After Event
```bash
cd infrastructure
npm run destroy
```

This will remove all AWS resources and stop any charges.
