# SnapMagic Prerequisites

This document outlines everything you need to successfully deploy SnapMagic in your own AWS account.

## 📋 Required Prerequisites

### 1. AWS Account & CLI Setup

#### AWS Account
- Active AWS account with administrative privileges
- Billing configured (SnapMagic uses pay-per-use services)

#### AWS CLI Installation & Configuration
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

#### AWS Profile Configuration
```bash
# Configure AWS profile (replace 'snap' with your preferred profile name)
aws configure --profile snap

# You'll need to provide:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (recommend: us-east-1)
# - Default output format (recommend: json)
```

### 2. GitHub Setup

#### GitHub Repository
1. **Fork or Clone** the SnapMagic repository to your GitHub account
2. **Repository URL**: `https://github.com/YOUR_USERNAME/SnapMagic`

#### GitHub Personal Access Token (Required for Amplify CI/CD)
1. **Go to GitHub Settings**: https://github.com/settings/tokens
2. **Click "Generate new token (classic)"**
3. **Configure token settings**:
   - **Note**: `SnapMagic Amplify Integration`
   - **Expiration**: 90 days (or as per your security policy)
   - **Scopes** (check these boxes):
     - ✅ `repo` (Full control of private repositories)
     - ✅ `admin:repo_hook` (Full control of repository hooks)
     - ✅ `read:user` (Read access to user profile data)

4. **Copy the token** - you'll need it for deployment

⚠️ **IMPORTANT**: Save this token securely - GitHub only shows it once!

### 3. Development Tools

#### Node.js & npm
```bash
# Install Node.js 18+ (required for CDK)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version
```

#### AWS CDK CLI
```bash
# Install CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version
```

#### Git
```bash
# Install Git (if not already installed)
sudo apt-get update
sudo apt-get install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🚀 Deployment Steps

### Step 1: Clone Repository
```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/SnapMagic.git
cd SnapMagic
```

### Step 2: Bootstrap CDK (One-time setup)
```bash
# Bootstrap CDK in your AWS account
cdk bootstrap --profile snap
```

### Step 3: Deploy Infrastructure
```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Deploy the infrastructure
npm run deploy
```

### Step 4: Store GitHub Token Securely
```bash
# Run the secure setup script
cd ..
./scripts/setup-secrets.sh

# When prompted, enter your GitHub Personal Access Token
# The token will be securely stored in AWS Secrets Manager
```

### Step 5: Connect GitHub to Amplify
1. **Open AWS Console**: Go to the Amplify service
2. **Find your app**: Look for `snapmagic-dev` (or your environment name)
3. **Connect repository**:
   - Click "Connect repository"
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub account
   - Select your forked SnapMagic repository
   - Choose the `main` branch
4. **Deploy**: Click "Save and deploy"

## 🔧 Configuration Options

### Environment Variables
You can customize the deployment by setting these environment variables:

```bash
# Optional: Change environment name (default: dev)
export ENVIRONMENT=staging

# Optional: Change AWS region (default: us-east-1)
export AWS_DEFAULT_REGION=us-west-2
```

### Multi-Environment Deployment
```bash
# Deploy to different environments
cdk deploy --context environment=staging --profile snap
cdk deploy --context environment=production --profile snap
```

## 🔍 Verification Steps

### 1. Check AWS Resources
After deployment, verify these resources exist in your AWS account:
- **Amplify App**: `snapmagic-dev` (or your environment name)
- **IAM Role**: `SnapMagic-dev-AmplifyRole*`
- **Secrets Manager**: `snapmagic/dev/github/token`
- **Parameter Store**: `/snapmagic/dev/amplify/*`

### 2. Run Security Check
```bash
# Verify no credentials are exposed
./scripts/security-check.sh
```

### 3. Test Application
- **Amplify Console**: Check build status and logs
- **Application URL**: Access your deployed application
- **GitHub Integration**: Verify automatic deployments work

## 💰 Cost Considerations

### Expected Monthly Costs (Development)
- **AWS Amplify**: ~$0-5 (depends on build minutes)
- **Secrets Manager**: ~$0.40 per secret
- **Parameter Store**: Free tier
- **KMS**: ~$1 per key
- **Total**: ~$2-7 per month for development

### Cost Optimization
- Use the auto-shutdown feature for temporary deployments
- Delete stacks when not in use: `npm run destroy`
- Monitor costs with AWS Cost Explorer

## 🛠️ Troubleshooting

### Common Issues

#### CDK Bootstrap Fails
```bash
# Ensure you have admin permissions
aws sts get-caller-identity --profile snap

# Try bootstrapping with explicit region
cdk bootstrap aws://ACCOUNT-ID/us-east-1 --profile snap
```

#### GitHub Token Issues
```bash
# Verify token is stored correctly
aws secretsmanager get-secret-value \
  --secret-id snapmagic/dev/github/token \
  --profile snap
```

#### Amplify Build Fails
1. Check build logs in Amplify Console
2. Verify `frontend/` directory exists with valid Next.js app
3. Check build settings match the CDK configuration

#### Permission Errors
```bash
# Verify your AWS credentials have sufficient permissions
aws iam get-user --profile snap
```

## 📞 Support & Resources

### Documentation
- **AWS CDK**: https://docs.aws.amazon.com/cdk/
- **AWS Amplify**: https://docs.aws.amazon.com/amplify/
- **GitHub Tokens**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

### Security
- Review `SECURITY.md` for security best practices
- Never commit credentials to git
- Use AWS Secrets Manager for all sensitive data

### Getting Help
1. Check the troubleshooting section above
2. Review AWS CloudFormation events for deployment issues
3. Check Amplify build logs for frontend issues
4. Ensure all prerequisites are met

## ✅ Pre-Deployment Checklist

Before deploying SnapMagic, ensure you have:

- [ ] AWS account with admin privileges
- [ ] AWS CLI installed and configured with profile
- [ ] GitHub repository forked/cloned
- [ ] GitHub Personal Access Token created with correct scopes
- [ ] Node.js 18+ installed
- [ ] AWS CDK CLI installed
- [ ] Git configured with your details
- [ ] CDK bootstrapped in your AWS account
- [ ] Reviewed cost implications
- [ ] Read security guidelines

Once all prerequisites are met, you're ready to deploy SnapMagic! 🚀

---

**Need help?** Check the troubleshooting section or review the security guidelines in `SECURITY.md`.
