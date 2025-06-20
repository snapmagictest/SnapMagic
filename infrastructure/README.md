# SnapMagic Infrastructure

AWS CDK infrastructure for SnapMagic - AI-powered transformation for AWS events.

## Current State
This CDK currently deploys only what we have implemented:
- ✅ **AWS Amplify App** (frontend hosting)
- ✅ **GitHub integration** (CI/CD)
- ✅ **Custom routing** (SPA support)

## Structure
```
infrastructure/
├── bin/
│   └── snapmagic.ts           # CDK app entry point
├── lib/
│   └── snapmagic-stack.ts     # Main stack (Amplify only)
├── cdk.json                   # CDK configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Prerequisites

### System Requirements
- **Node.js**: 22.x or later (required by AWS CDK v2)
- **TypeScript**: 3.8 or later
- **AWS CLI**: Latest version, configured with credentials
- **AWS CDK CLI**: Latest version (`npm install -g aws-cdk`)

### Check Prerequisites
```bash
# Check Node.js version (should be 22.x+)
node --version

# Check TypeScript version (should be 3.8+)
tsc --version

# Check AWS CLI configuration
aws sts get-caller-identity

# Check CDK CLI version
cdk --version
```

## Installation

### 1. Install Dependencies
```bash
cd infrastructure
npm install
```

### 2. Bootstrap CDK (First Time Only)
```bash
# Bootstrap your AWS account for CDK
cdk bootstrap

# Or bootstrap with specific account/region
cdk bootstrap aws://123456789012/us-east-1
```

## Deployment

### Development Environment
```bash
# Deploy to development (default)
npm run deploy

# Or explicitly specify dev
cdk deploy -c environment=dev
```

### Production Environment
```bash
# Deploy to production
cdk deploy -c environment=prod
```

### Custom Account/Region
```bash
# Deploy to specific account/region
cdk deploy -c account=123456789012 -c region=us-west-2
```

## Management Commands

### View Changes Before Deploy
```bash
cdk diff
```

### Synthesize CloudFormation Template
```bash
cdk synth
```

### List All Stacks
```bash
cdk list
```

### Destroy Stack
```bash
npm run destroy

# Or for specific environment
cdk destroy -c environment=prod
```

## Outputs
After deployment, you'll get:
- **AmplifyAppId**: The Amplify application ID
- **AmplifyAppUrl**: The live application URL
- **AmplifyConsoleUrl**: Direct link to Amplify console
- **StackName**: The CDK stack name

## Best Practices Implemented

### ✅ CDK v2 Current Standards
- **Latest CDK version**: ^2.170.0 (no deprecated dependencies)
- **Modern TypeScript**: ES2022 target with strict mode
- **Proper imports**: Individual class imports from aws-cdk-lib
- **Environment validation**: Required account/region validation
- **Termination protection**: Enabled for production

### ✅ Tagging Strategy
- **Project**: SnapMagic
- **Environment**: dev/staging/prod
- **Purpose**: AWS-Event-Demo
- **CostCenter**: Events
- **ManagedBy**: CDK
- **Repository**: GitHub URL

### ✅ Security & Operations
- **Node.js 22.x**: Latest LTS requirement
- **TypeScript strict mode**: Enhanced type safety
- **Environment isolation**: Separate stacks per environment
- **Build optimization**: Proper caching and artifacts

## Troubleshooting

### Common Issues

**Deprecated Package Warnings**
- ✅ **Fixed**: Updated to CDK v2.170.0+ (no deprecated glob/inflight)

**Node.js Version Issues**
```bash
# Update Node.js to 22.x+
nvm install 22
nvm use 22
```

**CDK Bootstrap Required**
```bash
# Bootstrap your account
cdk bootstrap
```

**Permission Errors**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Ensure proper IAM permissions for CDK deployment
```

## Future Additions
As we add more services, this CDK will be updated to include:
- API Gateway + Lambda functions
- S3 buckets for media storage
- Bedrock permissions for AI/ML
- Rekognition for gesture detection
- Transcribe for voice-to-text

## Environment Configuration
- **dev**: Development environment (default)
- **staging**: Staging environment  
- **prod**: Production environment (termination protection enabled)

Each environment gets its own isolated stack with proper tagging.
