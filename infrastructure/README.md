# Infrastructure

This directory will contain AWS CDK infrastructure as code.

## Structure (Planned)
```
infrastructure/
├── bin/               # CDK app entry points
├── lib/               # CDK constructs and stacks
├── test/              # Infrastructure tests
├── cdk.json           # CDK configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## AWS Services to Deploy
- Amazon Cognito (Authentication)
- API Gateway (REST + WebSocket)
- AWS Lambda (Compute)
- Amazon S3 (Storage)
- Amazon DynamoDB (Analytics)
- Amazon Bedrock (AI/ML)
- Amazon Rekognition (Computer Vision)
- Amazon Transcribe (Speech-to-Text)
- AWS Step Functions (Orchestration)
- Amazon CloudWatch (Monitoring)
