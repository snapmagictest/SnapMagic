# Getting Started with SnapMagic

Welcome to SnapMagic! This guide will get you up and running quickly.

## 🎯 What is SnapMagic?

SnapMagic is an AI-powered image and video transformation application built for AWS events. It allows attendees to:
- Transform selfies into creative AI-generated images
- Create short video reels from photos
- Rate their experience using gesture recognition

## 🚀 Quick Start (5 Minutes)

### 1. Check Prerequisites
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SnapMagic.git
cd SnapMagic

# Run prerequisites check
./scripts/check-prerequisites.sh
```

### 2. Fix Any Issues
If the checker finds issues, see [PREREQUISITES.md](PREREQUISITES.md) for detailed setup instructions.

### 3. Deploy
```bash
# Deploy infrastructure
cd infrastructure
npm install
npm run deploy

# Setup GitHub token
cd ..
./scripts/setup-secrets.sh
```

### 4. Connect GitHub
1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Find your `snapmagic-dev` app
3. Connect your GitHub repository
4. Deploy!

## 📚 Documentation Overview

| Document | Purpose |
|----------|---------|
| **[README.md](README.md)** | Project overview and quick start |
| **[PREREQUISITES.md](PREREQUISITES.md)** | Complete setup requirements |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Detailed deployment guide |
| **[SECURITY.md](SECURITY.md)** | Security best practices |
| **[GETTING-STARTED.md](GETTING-STARTED.md)** | This quick start guide |

## 🛠️ Available Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/check-prerequisites.sh` | Validate all prerequisites |
| `./scripts/setup-secrets.sh` | Securely store GitHub token |
| `./scripts/security-check.sh` | Verify no credentials exposed |
| `cd infrastructure && npm run deploy` | Deploy infrastructure |
| `cd infrastructure && npm run destroy` | Clean up resources |

## 🔍 Troubleshooting

### Prerequisites Issues
```bash
# Check what's missing
./scripts/check-prerequisites.sh

# Common fixes
aws configure --profile snap          # Configure AWS
cdk bootstrap --profile snap          # Bootstrap CDK
npm install -g aws-cdk               # Install CDK CLI
```

### Deployment Issues
```bash
# Check AWS credentials
aws sts get-caller-identity --profile snap

# Check CDK status
cdk diff --profile snap

# View CloudFormation events in AWS Console
```

### GitHub Connection Issues
```bash
# Verify token is stored
aws secretsmanager get-secret-value --secret-id snapmagic/dev/github/token --profile snap

# Re-setup token
./scripts/setup-secrets.sh
```

## 💰 Cost Management

### Expected Costs
- **Development**: ~$2-7/month
- **Production**: Scales with usage
- **Auto-shutdown**: Available for cost savings

### Cost Optimization
```bash
# Destroy when not needed
cd infrastructure
npm run destroy

# Monitor costs
# Use AWS Cost Explorer
```

## 🔒 Security

SnapMagic follows security best practices:
- ✅ No credentials in code
- ✅ AWS Secrets Manager for tokens
- ✅ KMS encryption
- ✅ IAM least privilege
- ✅ Automated security checks

```bash
# Run security check
./scripts/security-check.sh
```

## 🎯 Next Steps

After successful deployment:

1. **Test the Application**: Access your Amplify URL
2. **Monitor Costs**: Set up billing alerts
3. **Customize**: Modify for your specific needs
4. **Scale**: Add additional AWS services as needed

## 📞 Need Help?

1. **Check Prerequisites**: [PREREQUISITES.md](PREREQUISITES.md)
2. **Deployment Issues**: [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Security Questions**: [SECURITY.md](SECURITY.md)
4. **Run Diagnostics**: `./scripts/check-prerequisites.sh`

## 🎉 Success!

Once deployed, you'll have:
- ✅ Secure AWS infrastructure
- ✅ Automated CI/CD pipeline
- ✅ Production-ready application
- ✅ Cost-optimized architecture

**Ready to build something amazing with SnapMagic!** 🚀

---

*For detailed information, see the specific documentation files linked above.*
