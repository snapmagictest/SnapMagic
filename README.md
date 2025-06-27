# SnapMagic Trading Cards

AI-powered trading card generation for AWS events and conferences.

## 🚀 Quick Start

**One-command deployment:**
```bash
./deploy.sh
```

**Login credentials:** `demo` / `demo`

📖 **Full documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md)

## ✅ Deployment Ready

Everything is configured and ready for deployment:

- ✅ **Dynamic Configuration**: No hardcoded values
- ✅ **Automated Deployment**: Single script handles everything  
- ✅ **Proper Credentials**: Loaded from `secrets.json`
- ✅ **API URL Injection**: Automatically configured via Amplify
- ✅ **Clean Architecture**: Frontend, backend, and infrastructure properly separated

## 🏗️ Architecture

- **Frontend**: Static React app hosted on AWS Amplify
- **Backend**: Python Lambda functions with API Gateway
- **Infrastructure**: AWS CDK for infrastructure as code
- **Configuration**: Dynamic via environment variables and build-time replacement

## 🔐 Security

- Credentials managed via `secrets.json` (not in git)
- JWT authentication for API access
- Environment variables for sensitive data
- No hardcoded secrets in codebase
