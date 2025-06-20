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
- Node.js 18+ 
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Deployment

### Install Dependencies
```bash
cd infrastructure
npm install
```

### Deploy to Development
```bash
npm run deploy
```

### Deploy to Production
```bash
cdk deploy -c environment=prod
```

### Destroy Stack
```bash
npm run destroy
```

## Outputs
After deployment, you'll get:
- **AmplifyAppId**: The Amplify application ID
- **AmplifyAppUrl**: The live application URL
- **AmplifyConsoleUrl**: Direct link to Amplify console

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
- **prod**: Production environment

Each environment gets its own isolated stack.
