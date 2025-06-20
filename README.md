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

### Step 2: Deploy Infrastructure
```bash
cd infrastructure
npm run setup
npm run deploy
```

### Step 3: Provide Information
During deployment, you'll be asked for:
- **GitHub Repository URL**: `https://github.com/YOUR-USERNAME/SnapMagic`
- **GitHub Token**: [Create here](https://github.com/settings/tokens) (needs `repo` permissions)
- **Branch**: `main` (or your preferred branch)
- **App Name**: Choose a unique name
- **Password Protection**: Optional for events

**That's it! Your SnapMagic will be live in 5-10 minutes!** 🎉

## ✨ Features

### 🖼️ Transform Pictures
- Take a selfie with your device camera
- Add a creative prompt (text or voice)
- AI transforms your photo into amazing scenes
- Download and share your creation

### 🎬 Transform Videos
- Capture a photo for video generation
- Describe your desired video scene
- AI creates a short video reel from your image
- Perfect for social media sharing

### 👍 Rate Experience
- Real-time gesture recognition
- Thumbs up/down feedback collection
- Analytics for event organizers
- Instant feedback processing

## 🛠️ Technology Stack

- **Frontend**: Modern JavaScript with AWS Amplify SDK v6.8.0
- **Infrastructure**: AWS CDK v2 with TypeScript
- **AI/ML**: Amazon Bedrock (Nova Canvas & Nova Reel)
- **Computer Vision**: Amazon Rekognition
- **Speech**: Amazon Transcribe
- **Hosting**: AWS Amplify with CloudFront
- **Deployment**: Interactive CDK deployment

## 📋 Prerequisites

- **Node.js 22.x+** (required for AWS CDK v2)
- **AWS CLI** configured with your credentials
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub account** with a personal access token

## 🔑 GitHub Token Setup

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select **"repo"** permissions (Full control of private repositories)
4. Copy the token (you'll need it during deployment)

## 🎯 Perfect for AWS Events

SnapMagic is designed for temporary deployment at AWS events:

- **Quick Setup**: Deploy in minutes with interactive prompts
- **Event-Ready**: Password protection and custom branding
- **Cost-Optimized**: Easy teardown after events
- **Scalable**: Handles 1000+ concurrent users
- **Global**: CloudFront distribution for worldwide access

## 🚀 Deployment Commands

```bash
# Development (default)
npm run deploy

# Staging
npm run deploy:staging

# Production
npm run deploy:prod

# Teardown
npm run destroy
```

## 🔒 Security

- **GitHub tokens are used only during deployment** - not stored in AWS
- **Tokens are never logged or persisted** anywhere
- **All sensitive data is handled securely** during the deployment process
- **No credentials are stored in the repository** or AWS resources

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
- Powered by AWS AI/ML services
- Designed for developers, by developers

---

**Ready to create some magic? Fork, clone, and deploy SnapMagic to your AWS account!** ✨
