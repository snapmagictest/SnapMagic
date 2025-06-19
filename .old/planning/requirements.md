# SnapMagic - Requirements

## Project Overview
SnapMagic is an AWS-native application designed for AWS events (summits) that provides AI-powered image and video transformation capabilities along with real-time experience rating functionality. The system is designed for temporary deployment with automatic shutdown capabilities.

## Business Requirements

### Target Users
- **Primary**: AWS Summit attendees seeking engaging, personalized content creation
- **Secondary**: AWS event organizers needing real-time feedback collection
- **Admin**: Event staff managing the application during events

### Core Value Proposition
- Create memorable, shareable content at AWS events
- Streamline feedback collection through gesture recognition
- Demonstrate AWS AI/ML capabilities in an interactive format
- Provide global accessibility with low latency through AWS CloudFront

## Functional Requirements

### FR1: Admin Authentication & Access Control
- **FR1.1**: Simple admin login page with username/password (no 2FA required)
- **FR1.2**: Basic access control to prevent public access and cost incurrence
- **FR1.3**: Application remains accessible throughout event duration without re-authentication

### FR2: Transform Pictures Feature
- **FR2.1**: Camera integration for selfie capture using device camera
- **FR2.2**: Text prompt input field for transformation description
- **FR2.3**: Speech-to-text option for prompt input using AWS Transcribe
- **FR2.4**: AI-powered image transformation using Amazon Bedrock Nova Canvas
- **FR2.5**: Display transformed image with download option
- **FR2.6**: Example prompts: "Transform my picture into me sitting on a beach sipping a cold beverage on a hot summers day"

### FR3: Transform Video Feature
- **FR3.1**: Camera integration for selfie capture (same as FR2.1)
- **FR3.2**: Text prompt input with speech-to-text option (same as FR2.2-2.3)
- **FR3.3**: AI-powered video generation from static image using Amazon Bedrock Nova Reel
- **FR3.4**: Generate short video reel (15-30 seconds)
- **FR3.5**: Display generated video with download option

### FR4: Rate Experience Feature
- **FR4.1**: Real-time camera streaming for gesture capture
- **FR4.2**: Gesture recognition using Amazon Rekognition (thumbs up/down detection)
- **FR4.3**: Automatic classification and storage of feedback results
- **FR4.4**: Visual feedback confirmation to user
- **FR4.5**: Analytics dashboard for event organizers

### FR5: User Interface Requirements
- **FR5.1**: Responsive web design for mobile, tablet, and desktop using AWS Amplify
- **FR5.2**: Immediate camera display after admin login to capture attention
- **FR5.3**: Intuitive navigation between three main features
- **FR5.4**: Real-time processing status indicators
- **FR5.5**: Error handling with user-friendly messages and retry capabilities
- **FR5.6**: Global content delivery through Amazon CloudFront for low latency

### FR6: System Lifecycle Management
- **FR6.1**: Easy deployment capability for any AWS account
- **FR6.2**: Manual shutdown capability when event concludes
- **FR6.3**: Automatic shutdown after 2 weeks post-deployment
- **FR6.4**: Complete resource cleanup to prevent ongoing costs
- **FR6.5**: Deployment status monitoring and cost tracking

## Non-Functional Requirements

### NFR1: Performance & Scalability
- **NFR1.1**: Handle AWS Summit scale traffic (1000+ concurrent users)
- **NFR1.2**: Sub-second response times for camera operations
- **NFR1.3**: Image transformation completion within 30 seconds
- **NFR1.4**: Video generation completion within 60 seconds
- **NFR1.5**: Auto-scaling based on demand

### NFR2: Security & Privacy
- **NFR2.1**: Encryption at rest for all stored images/videos (S3 with KMS)
- **NFR2.2**: Encryption in transit for all data transfers (HTTPS/TLS)
- **NFR2.3**: Personal data protection compliance (GDPR considerations)
- **NFR2.4**: Secure API endpoints with authentication
- **NFR2.5**: No permanent storage of personal images beyond event duration

### NFR3: Reliability & Availability
- **NFR3.1**: 99.9% uptime during event hours
- **NFR3.2**: Graceful degradation if AI services are temporarily unavailable
- **NFR3.3**: Automatic retry mechanisms for failed operations
- **NFR3.4**: Circuit breaker patterns for external service calls
- **NFR3.5**: Comprehensive monitoring and alerting
- **NFR3.6**: Content caching for retry scenarios and failure recovery
- **NFR3.7**: Multi-region failover capabilities using CloudFront
- **NFR3.8**: Resilient architecture to handle network interruptions

### NFR4: Cost Optimization
- **NFR4.1**: Serverless architecture to minimize idle costs
- **NFR4.2**: Easy shutdown/startup capability for cost management
- **NFR4.3**: Automatic cleanup of temporary files
- **NFR4.4**: Resource tagging for cost allocation and tracking
- **NFR4.5**: Pay-per-use pricing model alignment
- **NFR4.6**: Automatic resource termination after 2 weeks
- **NFR4.7**: Cost monitoring and alerting for budget control
- **NFR4.8**: Efficient caching to reduce repeated AI processing costs

## Technical Requirements

### TR1: AWS Services Integration
- **TR1.1**: Amazon Cognito for basic authentication (simplified)
- **TR1.2**: Amazon Bedrock with Nova Canvas for image transformation
- **TR1.3**: Amazon Bedrock with Nova Reel for video generation
- **TR1.4**: Amazon Rekognition for gesture detection
- **TR1.5**: Amazon Transcribe for speech-to-text conversion
- **TR1.6**: Amazon S3 for secure file storage with lifecycle policies
- **TR1.7**: AWS Lambda for serverless compute
- **TR1.8**: Amazon API Gateway for REST API management
- **TR1.9**: AWS Step Functions for workflow orchestration
- **TR1.10**: Amazon CloudWatch for monitoring and logging
- **TR1.11**: Amazon CloudFront for global content delivery and caching
- **TR1.12**: AWS Amplify for frontend hosting and deployment
- **TR1.13**: Amazon ElastiCache for application-level caching (if needed)
- **TR1.14**: AWS EventBridge for scheduled auto-shutdown
- **TR1.15**: AWS Systems Manager for parameter management

### TR2: Architecture Requirements
- **TR2.1**: Well-Architected Framework compliance (all 6 pillars)
- **TR2.2**: Serverless-first architecture approach
- **TR2.3**: Event-driven architecture patterns
- **TR2.4**: Microservices design for feature separation
- **TR2.5**: Infrastructure as Code using AWS CDK

### TR3: Development & Deployment
- **TR3.1**: CI/CD pipeline using GitHub Actions
- **TR3.2**: Multi-environment deployment (dev, staging, prod)
- **TR3.3**: Automated testing integration
- **TR3.4**: Blue/green deployment strategy
- **TR3.5**: Rollback capabilities

## Constraints & Assumptions

### Constraints
- **C1**: Must use AWS native services where possible (CloudFront, Amplify, etc.)
- **C2**: Budget constraints require cost-effective serverless solutions
- **C3**: Event duration limited (typically 1-3 days)
- **C4**: Mobile-first design due to event attendee device usage patterns
- **C5**: Real-time processing requirements for user engagement
- **C6**: Global accessibility required (US hosting, Africa usage via CloudFront)
- **C7**: Temporary deployment model with automatic cleanup
- **C8**: Must handle network interruptions and provide retry capabilities

### Assumptions
- **A1**: Users have modern smartphones with camera capabilities
- **A2**: Reliable internet connectivity at event venues (with fallback for interruptions)
- **A3**: AWS Bedrock Nova models are available in deployment region
- **A4**: Event organizers provide admin credentials
- **A5**: Legal approval for image/video processing and temporary storage
- **A6**: CloudFront provides adequate performance for Africa from US regions
- **A7**: Events typically last 1-3 days with known end dates
- **A8**: Cost monitoring and automatic shutdown prevent runaway expenses

## Success Criteria
- **SC1**: Successful deployment and operation during AWS Summit event
- **SC2**: 95%+ user satisfaction with transformation quality
- **SC3**: Zero security incidents or data breaches
- **SC4**: Cost per user under $2 for entire event duration
- **SC5**: 90%+ uptime during peak event hours
- **SC6**: Positive feedback from event organizers on engagement metrics

## Out of Scope (Future Enhancements)
- Multi-language support
- Social media integration
- Advanced video editing features
- User account creation and management
- Long-term content storage
- Analytics dashboard for attendees
