# SnapMagic ✨

AI-powered image and video transformation for AWS events. Create amazing content with just a selfie and a prompt!

## 🚀 Quick Start (2 Simple Steps)

### Step 1: Fork & Clone
```bash
# 1. Fork this repository on GitHub (click the Fork button)
# 2. Clone YOUR fork
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic
```

### Step 2: Configure & Deploy
```bash
# 1. Copy the example secrets file
cp secrets.json.example secrets.json

# 2. Edit secrets.json with your values
# 3. Deploy the complete system
cd infrastructure
npm run setup
npm run deploy
```

## 🔧 Configuration (secrets.json)

Create a `secrets.json` file in the root directory with your configuration:

```json
{
  "github": {
    "repositoryUrl": "https://github.com/YOUR-USERNAME/SnapMagic",
    "token": "ghp_YOUR_GITHUB_TOKEN_HERE",
    "branch": "main"
  },
  "app": {
    "name": "my-snapmagic-app",
    "passwordProtection": {
      "enabled": true,
      "username": "demo",
      "password": "demo"
    }
  }
}
```

### 🔑 GitHub Token Setup

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select **"repo"** permissions (Full control of private repositories)
4. Copy the token and add it to your `secrets.json`

### 📋 Configuration Options

- **repositoryUrl**: Your forked SnapMagic repository URL
- **token**: Your GitHub personal access token
- **branch**: Git branch to deploy from (use "main")
- **name**: Choose any name for your Amplify app
- **passwordProtection**: 
  - **enabled**: Set to `true` for password protection
  - **username/password**: Login credentials for your app (default: demo/demo)

## ✨ Features

### 🖼️ Transform Pictures
- Take a selfie with your device camera
- AI transforms your photo using **Amazon Bedrock Nova Canvas**
- Creates professional blister pack action figures
- Download and share your creation

### 🎬 Transform Videos
- Capture a photo for video generation
- AI creates a short video reel using **Amazon Bedrock Nova Reel**
- Perfect for social media sharing

### 👍 Rate Experience
- Real-time gesture recognition using **Amazon Rekognition**
- Thumbs up/down feedback collection
- Analytics for event organizers

### 🎤 Voice Input
- Speech-to-text using **Amazon Transcribe**
- Voice prompts for transformations
- Hands-free operation

## 🛠️ Technology Stack

- **Frontend**: Modern JavaScript with AWS Amplify SDK v6.8.0
- **Backend**: Python with Amazon Bedrock integration
- **Infrastructure**: AWS CDK v2 with TypeScript
- **AI/ML**: 
  - Amazon Bedrock Nova Canvas (image transformation)
  - Amazon Bedrock Nova Reel (video generation)
  - Amazon Rekognition (gesture detection & facial analysis)
  - Amazon Transcribe (speech-to-text)
- **Hosting**: AWS Amplify with CloudFront
- **API**: AWS API Gateway + Lambda
- **Deployment**: Single CDK stack deployment

## 🏗️ Architecture

```
Frontend (Amplify)
    ↓ HTTP API calls
API Gateway
    ↓ triggers
Lambda (Rekognition + Bedrock)
    ↓ orchestrates
Amazon Bedrock Nova Canvas + Rekognition + Transcribe
    ↓ AI Results (base64 images/videos/text)
Frontend displays + download options
```

## 📋 Prerequisites

- **Node.js 22.x+** (required for AWS CDK v2)
- **Python 3.11+** (for backend services)
- **AWS CLI** configured with your credentials
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub account** with a personal access token
- **Amazon Bedrock access** to Nova Canvas and Nova Reel models

### AWS CLI Setup (Required)
Before deploying SnapMagic, you must configure AWS CLI with your credentials:

```bash
# Install AWS CLI (if not already installed)
# Windows: Download from https://aws.amazon.com/cli/
# macOS: brew install awscli
# Linux: sudo apt-get install awscli

# Configure AWS CLI with your credentials
aws configure

# You'll be prompted for:
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json
```

### Amazon Bedrock Model Access
Ensure you have access to the following models in Amazon Bedrock:
- **Amazon Nova Canvas** (amazon.nova-canvas-v1:0)
- **Amazon Nova Reel** (amazon.nova-reel-v1:0)

Request access at: https://console.aws.amazon.com/bedrock/home#/modelaccess

### Quick Prerequisites Check
Run this script to verify everything is set up correctly:
```bash
# After cloning the repository
cd SnapMagic
./scripts/check-prerequisites.sh
```

## 🎯 Perfect for AWS Events

SnapMagic is designed for temporary deployment at AWS events:

- **Professional Action Figures**: Creates viral blister pack figurines
- **Quick Setup**: Deploy entire system in 10-15 minutes
- **Event-Ready**: Password protection and custom branding
- **Cost-Optimized**: Easy teardown after events
- **Scalable**: Handles 1000+ concurrent users
- **Global**: CloudFront distribution for worldwide access

## 🚀 Deployment Commands

```bash
# Deploy complete system (uses secrets.json)
npm run deploy

# Deploy to specific environments
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# Teardown (removes all AWS resources)
npm run destroy

# Environment-specific teardown
npm run destroy:dev
npm run destroy:staging
npm run destroy:prod
```

## 🧪 Testing

### Test Backend Locally
```bash
# Test backend services
cd backend
python test_agent.py

# Run local development server
python run_local.py
```

### Test API Endpoints
```bash
# Health check
curl -X GET https://your-api-url/health

# Transform image (example)
curl -X POST https://your-api-url/api/transform-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"action": "transform_image", "image_base64": "..."}'
```

## 🗑️ Clean Teardown

### **🤖 Automatic Cleanup (NEW!)**
**SnapMagic automatically deletes itself after 7 days to prevent forgotten costs:**

```bash
# Check auto-delete status
./scripts/check-auto-delete.sh

# Example output:
# 📊 Stack: SnapMagic-dev
# 📅 Created: 2025-06-26T10:00:00Z
# ⏰ Age: 2 days
# ✅ STATUS: Stack is active
# 🗑️ Auto-delete in: 5 days
# 📆 Auto-delete date: 2025-07-03
```

### **🛑 Manual Cleanup (Before 7 Days)**
**Remove all AWS resources instantly:**
```bash
cd infrastructure
npm run destroy
```

**What gets removed:**
- ✅ AWS Amplify app
- ✅ API Gateway and Lambda function
- ✅ IAM roles and policies
- ✅ CloudFormation stack
- ✅ All associated AWS resources

**What stays safe:**
- ✅ Your GitHub repository (untouched)
- ✅ Your local code files
- ✅ Git history and commits
- ✅ Your secrets.json file (never uploaded)

## 🔒 Security

- **secrets.json is never uploaded** - protected by .gitignore
- **GitHub tokens are used only during deployment** - not stored in AWS
- **All sensitive data is handled securely** during the deployment process
- **IAM roles follow least privilege principle**
- **API endpoints are secured with JWT authentication**
- **Password protection available** for event access control

## 🎨 AI Capabilities

### Professional Action Figure Creation
- **Rekognition Analysis**: Analyzes your facial features and characteristics
- **Text-to-Image Generation**: Creates clean action figures without face distortion
- **Professional Packaging**: Viral blister pack presentation
- **Personalized Branding**: Your name on the packaging

### Example Results
- "Professional action figure in blister pack packaging"
- "Tech professional with modern business attire"
- "Orange backing with personalized name branding"
- "Complete with tech accessories and commercial presentation"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/snapmagictest/SnapMagic/issues)
- **Documentation**: Check the `docs/` directory
- **AWS Support**: For AWS-specific issues, consult AWS documentation

## 🎉 Acknowledgments

- Built for AWS Summit events and community
- Powered by AWS AI/ML services (Bedrock Nova Canvas, Rekognition, Transcribe)
- Designed for developers, by developers

---

**Ready to create some AI-powered magic? Fork, clone, configure your secrets.json, and deploy SnapMagic to your AWS account!** ✨
