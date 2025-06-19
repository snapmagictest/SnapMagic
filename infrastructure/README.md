# SnapMagic Infrastructure

AWS CDK infrastructure for SnapMagic application.

## Prerequisites

- Node.js 18+ installed
- AWS CLI configured with profile named "snap"
- CDK CLI installed globally: `npm install -g aws-cdk`

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy infrastructure:**
   ```bash
   ./deploy.sh
   ```

   Or manually:
   ```bash
   npm run deploy
   ```

## Available Commands

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes and compile
- `npm run deploy` - Deploy to AWS using 'snap' profile
- `npm run destroy` - Destroy the stack
- `npm run diff` - Show differences between deployed and local
- `npm run synth` - Synthesize CloudFormation template

## Architecture

### Current Components (MVP)
- **AWS Amplify**: Frontend hosting with CI/CD
- **IAM Roles**: Service roles for Amplify
- **Parameter Store**: Configuration storage
- **CloudFormation Outputs**: Key resource identifiers

### Deployment
- Uses AWS profile: `snap`
- Default region: `us-east-1`
- Environment: `dev` (configurable)

## Environment Configuration

To deploy to different environments:
```bash
cdk deploy --context environment=staging --profile snap
```

## Outputs

After deployment, you'll get:
- Amplify App ID
- Amplify App URL
- Amplify Console URL

## Next Steps

1. Connect GitHub repository to Amplify
2. Configure GitHub access token
3. Trigger first build
4. Add additional AWS services as needed

## Troubleshooting

- Ensure AWS profile 'snap' is configured
- Check CDK bootstrap status
- Verify permissions for Amplify service role
