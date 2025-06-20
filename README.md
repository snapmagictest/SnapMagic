# SnapMagic ✨

AI-powered image and video transformation for AWS events. Create amazing content with just a selfie and a prompt!

## 🚀 Quick Start

### For New Users
```bash
# 1. Clone the repository
git clone https://github.com/snapmagictest/SnapMagic.git
cd SnapMagic

# 2. Deploy to your AWS account
cd infrastructure
npm run quick-deploy

# 3. Follow the deployment instructions to connect your GitHub repository
```

### For Contributors
```bash
# 1. Fork this repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic

# 3. Edit configuration (optional)
nano infrastructure/config/app-config.ts

# 4. Deploy
cd infrastructure
npm run quick-deploy
```

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
- **Deployment**: One-command CDK deployment

## 📋 Prerequisites

- **Node.js 22.x+** (required for AWS CDK v2)
- **AWS CLI** configured with your credentials
- **AWS CDK** installed: `npm install -g aws-cdk`
- **GitHub account** (for repository connection)

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Complete setup instructions
- **[Teardown Guide](TEARDOWN.md)** - Clean removal after events
- **[Configuration Guide](infrastructure/config/README.md)** - Customization options

## 🎯 Perfect for AWS Events

SnapMagic is designed for temporary deployment at AWS events:

- **Quick Setup**: Deploy in minutes
- **Event-Ready**: Password protection and custom branding
- **Cost-Optimized**: Easy teardown after events
- **Scalable**: Handles 1000+ concurrent users
- **Global**: CloudFront distribution for worldwide access

## 🔧 Configuration

Customize your deployment by editing `infrastructure/config/app-config.ts`:

```typescript
export const defaultConfig: SnapMagicConfig = {
  repository: {
    url: 'https://github.com/YOUR-USERNAME/SnapMagic', // Your repo
    branch: 'main',
  },
  app: {
    name: 'my-snapmagic', // Unique app name
    description: 'My SnapMagic deployment',
  },
  // ... more options
};
```

## 🚀 Deployment Commands

```bash
# Development
npm run deploy

# Staging
npm run deploy:staging

# Production
npm run deploy:prod

# Teardown
npm run destroy
```

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

**Ready to create some magic? Deploy SnapMagic to your AWS account and start transforming!** ✨
