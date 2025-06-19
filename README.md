# SnapMagic

AI-powered image and video transformation app for AWS events - Quack the Code Challenge 2025

## Introduction

This is SnapMagic, a native AWS application built for AWS events such as summits. The project is part of the "2025 Quack the Code Challenge", an internal contest for building applications using Q CLI. The project, including all files and code, will be implemented by the Q CLI agent through interactive discussion with the user via the Q CLI chat interface.

## Use case

SnapMagic solves the challenge of creating engaging, personalized content at AWS events. Event attendees can capture selfies and transform them into creative AI-generated images and videos using natural language prompts. The application also provides real-time experience rating through gesture recognition, helping event organizers gather immediate feedback about attendee satisfaction.

## Value proposition

SnapMagic provides immediate value to AWS event organizers and attendees by:
- **Enhancing Engagement**: Interactive AI-powered photo/video transformation creates memorable experiences
- **Streamlining Feedback**: Real-time gesture-based rating system eliminates traditional survey friction  
- **Ensuring Security**: Enterprise-grade security with 2FA admin access and encrypted personal data storage
- **Optimizing Costs**: Serverless architecture with easy shutdown/startup capabilities for cost management
- **Scaling Automatically**: Built on AWS native services to handle summit-scale traffic loads

## Quick Start

### Prerequisites
Before deploying SnapMagic, ensure you have all required tools and accounts set up:

📋 **[Read PREREQUISITES.md](PREREQUISITES.md)** - Complete setup guide

🔍 **Quick Check**: Run the prerequisites checker:
```bash
./scripts/check-prerequisites.sh
```

### Deployment
Once prerequisites are met:

1. **Deploy Infrastructure**:
   ```bash
   cd infrastructure
   npm install
   npm run deploy
   ```

2. **Store GitHub Token**:
   ```bash
   ./scripts/setup-secrets.sh
   ```

3. **Connect GitHub to Amplify**:
   - Open AWS Amplify Console
   - Connect your forked repository
   - Deploy the application

🔗 **Detailed Instructions**: See [PREREQUISITES.md](PREREQUISITES.md)

## Project layout 

* **planning/requirements.md**: Defines the requirements for this project
* **planning/design.md**: Defines the design and architecture for this project  
* **planning/tasks.md**: Lists the discrete tasks that need to be executed in order to successfully implement the project. Each task has a check box [ ] that is checked off when the task has been successfully completed. A git commit should be performed after any task is successfully completed.

Additional files may be added as needed:
* **planning/test-plan.md**: Unit test, integration, non-functional, performance test plans
* **planning/threat-model.md**: Comprehensive application security threat model and security testing plan
* **planning/a11y.md**: Accessibility goals and accessibility testing plan

## Repository

- **GitHub**: https://github.com/snapmagictest/SnapMagic (Private)
- **Owner**: snapmagictest
- **Created**: 2025-06-19

---

*This README will be updated as development progresses.*
