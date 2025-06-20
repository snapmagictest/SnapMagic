# SnapMagic ✨

AI-powered image and video transformation for AWS events. Create amazing content with just a selfie and a prompt!

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Fork & Clone
```bash
# 1. Fork this repository on GitHub (click the Fork button)
# 2. Clone YOUR fork
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic
```

### Step 2: Deploy Complete System
```bash
cd infrastructure
npm run setup
npm run deploy
```

### Step 3: Provide Information During Deployment
The deployment will prompt you for the following information:

**📁 GitHub Repository URL:**
```
https://github.com/YOUR-USERNAME/SnapMagic
```

**🔑 GitHub Personal Access Token:**
- Create at: https://github.com/settings/tokens
- Required permissions: `repo` (Full control of private repositories)
- Enter your token (will be hidden with asterisks)

**🌿 GitHub Branch:**
```
main
```
(or your preferred branch name)

**📱 Amplify App Name:**
```
my-snapmagic-app
```
(choose a unique name for your deployment)

**🔒 Password Protection (Optional):**
- Enable password protection? `y` or `N`
- If yes, provide:
  - **👤 Username:** `summit2024` (for event attendees)
  - **🔐 Password:** `AWSRocks123!` (for event attendees)

**That's it! Your complete SnapMagic system will be live in 10-15 minutes!** 🎉

### Step 4: Trigger First Build & Configure API (One-Time Only)
After deployment completes, CDK will output commands like this:

**1. Trigger First Build:**
```bash
aws amplify start-job --app-id YOUR-APP-ID --branch-name main --job-type RELEASE --region us-east-1
```

**2. Configure Frontend API:**
```bash
echo "window.SNAPMAGIC_API_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/';" > frontend/public/api-config.js
```

**Copy and run both commands.** After this, your SnapMagic will have:
- ✅ **Working frontend** with camera functionality
- ✅ **AI backend** with Bedrock Nova Canvas/Reel
- ✅ **Complete integration** from camera to AI transformation

## ✨ Features

### 🖼️ Transform Pictures
- Take a selfie with your device camera
- Add a creative prompt (text or voice)
- AI transforms your photo using **Amazon Bedrock Nova Canvas**
- Download and share your creation

### 🎬 Transform Videos
- Capture a photo for video generation
- Describe your desired video scene
- AI creates a short video reel using **Amazon Bedrock Nova Reel**
- Perfect for social media sharing

### 👍 Rate Experience
- Real-time gesture recognition using **Amazon Rekognition**
- Thumbs up/down feedback collection
- Analytics for event organizers
- Instant feedback processing

### 🎤 Voice Input
- Speech-to-text using **Amazon Transcribe**
- Voice prompts for transformations
- Hands-free operation

## 🛠️ Technology Stack

- **Frontend**: Modern JavaScript with AWS Amplify SDK v6.8.0
- **Backend**: Python with Strands Agents SDK
- **Infrastructure**: AWS CDK v2 with TypeScript
- **AI/ML**: 
  - Amazon Bedrock Nova Canvas (image transformation)
  - Amazon Bedrock Nova Reel (video generation)
  - Amazon Rekognition (gesture detection)
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
Lambda (Strands Agents)
    ↓ orchestrates
Amazon Bedrock Nova Canvas/Reel + Rekognition + Transcribe
    ↓ AI Results (base64 images/videos/text)
Frontend displays + download options
```

## 📋 Prerequisites

- **Node.js 22.x+** (required for AWS CDK v2)
- **Python 3.11+** (for Strands Agents backend)
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
- **Anthropic Claude 3.7 Sonnet** (us.anthropic.claude-3-7-sonnet-20250219-v1:0)

Request access at: https://console.aws.amazon.com/bedrock/home#/modelaccess

### Quick Prerequisites Check
Run this script to verify everything is set up correctly:
```bash
# After cloning the repository
cd SnapMagic
./scripts/check-prerequisites.sh
```

## 🔑 GitHub Token Setup

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select **"repo"** permissions (Full control of private repositories)
4. Copy the token (you'll need it during deployment)

## 🎯 Perfect for AWS Events

SnapMagic is designed for temporary deployment at AWS events:

- **Complete AI Integration**: Real Bedrock Nova Canvas/Reel transformations
- **Quick Setup**: Deploy entire system in 10-15 minutes
- **Event-Ready**: Password protection and custom branding
- **Cost-Optimized**: Easy teardown after events
- **Scalable**: Handles 1000+ concurrent users
- **Global**: CloudFront distribution for worldwide access

## 🚀 Deployment Commands

```bash
# Deploy complete system (frontend + backend)
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
# Test Strands Agents backend
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
  -d '{"prompt": "Transform me into a superhero", "image_base64": "..."}'
```

## 🗑️ Clean Teardown

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

## 🔒 Security

- **GitHub tokens are used only during deployment** - not stored in AWS
- **Tokens are never logged or persisted** anywhere
- **All sensitive data is handled securely** during the deployment process
- **No credentials are stored in the repository** or AWS resources
- **IAM roles follow least privilege principle**
- **API endpoints are secured with proper CORS configuration**

## 🎨 AI Capabilities

### Image Transformation Examples
- "Transform my picture into me sitting on a beach sipping a cold beverage"
- "Make me look like a superhero flying over the city"
- "Put me in a professional AWS re:Invent presentation setting"
- "Transform me into a character from a sci-fi movie"

### Video Generation Examples
- "Create a video of me flying through the clouds"
- "Generate a video where I'm presenting at AWS Summit"
- "Make a video of me surfing on digital waves"
- "Create a time-lapse video of me coding"

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
- Powered by AWS AI/ML services (Bedrock Nova Canvas/Reel, Rekognition, Transcribe)
- Integrated with Strands Agents for advanced AI orchestration
- Designed for developers, by developers

---

**Ready to create some AI-powered magic? Fork, clone, and deploy SnapMagic to your AWS account!** ✨
