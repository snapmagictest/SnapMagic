# SnapMagic - Project Context & Implementation Tracker

## Project Overview
**SnapMagic** is an AWS-native application designed for AWS Summit events that provides AI-powered image and video transformation capabilities along with real-time experience rating functionality. The system is designed for temporary deployment with automatic shutdown capabilities.

## Core Business Requirements

### Target Users
- **Primary**: AWS Summit attendees seeking engaging, personalized content creation
- **Secondary**: AWS event organizers needing real-time feedback collection
- **Admin**: Event staff managing the application during events

### Value Proposition
- Create memorable, shareable content at AWS events
- Streamline feedback collection through gesture recognition
- Demonstrate AWS AI/ML capabilities in an interactive format
- Provide global accessibility with low latency through AWS CloudFront

## Core Features (3 Main Functions)

### 1. Transform Pictures
- Camera integration for selfie capture using device camera
- Text prompt input field for transformation description
- Speech-to-text option for prompt input using AWS Transcribe
- AI-powered image transformation using Amazon Bedrock Nova Canvas
- Display transformed image with download option
- Example: "Transform my picture into me sitting on a beach sipping a cold beverage on a hot summers day"

### 2. Transform Video
- Camera integration for selfie capture (same as pictures)
- Text prompt input with speech-to-text option
- AI-powered video generation from static image using Amazon Bedrock Nova Reel
- Generate short video reel (15-30 seconds)
- Display generated video with download option

### 3. Rate Experience
- Real-time camera streaming for gesture capture
- Gesture recognition using Amazon Rekognition (thumbs up/down detection)
- Automatic classification and storage of feedback results
- Visual feedback confirmation to user
- Analytics dashboard for event organizers

## Technical Architecture

### AWS Services Stack
- **Frontend**: AWS Amplify + Amazon CloudFront
- **Authentication**: Amazon Cognito (simplified, no 2FA)
- **Compute**: AWS Lambda (serverless)
- **API**: Amazon API Gateway (REST + WebSocket)
- **AI/ML**: 
  - Amazon Bedrock (Nova Canvas for images, Nova Reel for videos)
  - Amazon Rekognition (gesture detection)
  - Amazon Transcribe (speech-to-text)
- **Storage**: Amazon S3 with KMS encryption and lifecycle policies
- **Orchestration**: AWS Step Functions
- **Monitoring**: Amazon CloudWatch
- **Caching**: Amazon ElastiCache (if needed)
- **Automation**: AWS EventBridge (auto-shutdown)
- **IaC**: AWS CDK with TypeScript

### Architecture Principles
- **Serverless-first**: Minimize idle costs
- **Event-driven**: Asynchronous processing
- **Well-Architected**: All 6 pillars compliance
- **Temporary deployment**: Easy shutdown/startup for cost management
- **Global accessibility**: US hosting with CloudFront for Africa
- **Mobile-first**: Responsive design for event attendees

## Key Constraints & Requirements

### Operational Constraints
- Event duration: 1-3 days typically
- Automatic shutdown after 2 weeks
- Budget: <$2 per user for entire event
- Scale: 1000+ concurrent users
- Performance: <30s image transform, <60s video generation
- Uptime: 99.9% during event hours

### Security Requirements
- Simple login (username/password)
- Encryption at rest and in transit
- No permanent storage of personal images
- GDPR compliance considerations
- Secure API endpoints with authentication

### Development Requirements
- Infrastructure as Code (AWS CDK)
- CI/CD pipeline (GitHub Actions)
- Multi-environment deployment (dev/staging/prod)
- Git-based workflow
- SDLC agile practices with MVP approach

## Project Structure Requirements
```
SnapMagic/
├── infrastructure/     # AWS CDK infrastructure code
├── frontend/          # Web application (Amplify hosted)
├── backend/           # Lambda functions and API code
├── docs/              # Documentation and planning
├── .old/              # Previous iteration files
└── context.md         # This file - project context tracker
```

## Current Implementation Status

### ✅ COMPLETED PHASES

#### Phase 0: Security Foundation (COMPLETED)
- [x] Comprehensive .gitignore for sensitive data
- [x] AWS Secrets Manager integration planning
- [x] Security documentation and guidelines
- [x] Prerequisites documentation (PREREQUISITES.md)
- [x] Deployment guides and troubleshooting

#### Phase 1: Infrastructure Foundation (COMPLETED)
- [x] AWS CDK project initialized with TypeScript
- [x] Basic project structure and dependencies configured
- [x] Multi-environment deployment scripts
- [x] AWS Amplify integration for static hosting
- [x] GitHub integration for CI/CD

#### Frontend MVP (COMPLETED)
- [x] AWS Amplify App created (App ID: d3ektdqj3lnzss)
- [x] Basic HTML/CSS/JS structure
- [x] Login page with authentication
- [x] Main app interface with camera integration
- [x] Three feature buttons (Transform Picture, Transform Video, Rate Experience)
- [x] Responsive design for mobile/tablet/desktop
- [x] Camera preview functionality
- [x] Basic styling and user interface

### 🚧 CURRENT PHASE: Amplify Framework Migration

#### Phase 2: Convert to Amplify Framework (IN PROGRESS)
- [ ] Initialize Amplify CLI in project (`amplify init`)
- [ ] Update package.json with core Amplify SDK dependencies
- [ ] Convert vanilla HTML/JS to use basic Amplify SDK structure
- [ ] Test that existing functionality still works
- [ ] Deploy and verify site still functions

**Note**: Add additional Amplify services (auth, api, storage, predictions) incrementally as we develop features, not all at once.

#### Phase 3: Core AWS Services Infrastructure (UPCOMING)
- [ ] Bedrock Nova Canvas integration (image transformation)
- [ ] Bedrock Nova Reel integration (video generation)
- [ ] Rekognition integration (gesture detection)
- [ ] Transcribe integration (speech-to-text)
- [ ] Step Functions for workflow orchestration
- [ ] DynamoDB for analytics and session storage

### 📋 UPCOMING PHASES

#### Phase 3: AI/ML Services Integration
- [ ] Amazon Bedrock Nova Canvas integration (image transformation)
- [ ] Amazon Bedrock Nova Reel integration (video generation)
- [ ] Amazon Rekognition stream processor (gesture detection)
- [ ] Amazon Transcribe integration (speech-to-text)

#### Phase 4: Feature Implementation
- [ ] Transform Pictures feature complete implementation
- [ ] Transform Video feature complete implementation
- [ ] Rate Experience feature complete implementation
- [ ] Error handling and retry mechanisms

#### Phase 5: Production Readiness
- [ ] Monitoring and alerting setup
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Auto-shutdown mechanisms
- [ ] Cost monitoring and alerts

## Development Workflow

### MVP Approach
1. **Frontend First**: Get UI up and running to capture attention
2. **Backend Integration**: Connect features one by one
3. **AI/ML Integration**: Add transformation capabilities
4. **Polish & Production**: Monitoring, security, optimization

### Git Workflow
- Main branch for production deployments
- Feature branches for development
- Commit after each completed task
- Update this context.md file after major milestones

## Key URLs & Resources
- **Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d3ektdqj3lnzss
- **App URL**: https://main.d3ektdqj3lnzss.amplifyapp.com (after GitHub connection)
- **GitHub Repo**: Connected for automated deployments
- **AWS Region**: us-east-1 (primary)

## Next Steps
1. Reorganize folder structure (infrastructure/, backend/, frontend/, docs/)
2. Deploy core AWS services infrastructure (Cognito, API Gateway, S3, DynamoDB)
3. Implement Lambda functions for each feature
4. Integrate AI/ML services (Bedrock, Rekognition, Transcribe)
5. Connect frontend to backend APIs
6. Test end-to-end functionality
7. Deploy to production environment

## Notes for Continuation
- Always check this context.md file when resuming work
- Update implementation status after completing each phase
- Commit changes to git after major milestones
- Follow serverless-first and cost-optimization principles
- Maintain security best practices throughout development
- Test on mobile devices due to event attendee usage patterns

---
**Last Updated**: 2025-06-20 08:45:00 UTC
**Current Phase**: Amplify Framework Migration
**Next Milestone**: Initialize Amplify CLI and convert to full framework

## LATEST PROGRESS UPDATE (2025-06-20)
✅ **Frontend Deployment Complete**: 
- Working URL: https://main.d2j6ejtnu13yb2.amplifyapp.com/
- Fixed UI blackout issues (CSS/JS paths corrected)
- Direct login flow implemented (no admin concept)
- Amplify + CloudFront integration confirmed working
- Clean project structure with proper folder organization

🚧 **Next: Simple Amplify Framework Conversion**: 
- Just initialize Amplify and convert basic structure
- Keep existing functionality working
- Add services incrementally as we develop features (not big bang approach)
