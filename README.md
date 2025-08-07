# SnapMagic 🎴✨

> **AI-Powered Trading Card Generation for AWS Events**  
> Generate personalized trading cards and videos using Amazon Bedrock Nova Canvas & Nova Reel

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-blue)](https://aws.amazon.com/bedrock/)
[![CDK](https://img.shields.io/badge/AWS-CDK-green)](https://aws.amazon.com/cdk/)

## 🎯 What is SnapMagic?

SnapMagic creates **AI-generated trading cards and videos** for AWS events using Amazon Bedrock. Users enter text prompts like "AWS Solutions Architect designing cloud infrastructure" and get personalized trading cards with holographic styling, plus animated videos.

**Perfect for**: AWS re:Invent, customer summits, partner events, conferences

## 🏗️ Complete Architecture & Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS AMPLIFY   │    │  API GATEWAY    │    │  MAIN LAMBDA    │    │      SQS        │
│                 │    │                 │    │                 │    │                 │
│ • Frontend Host │───▶│ • REST API      │───▶│ • Authentication│───▶│ • Card Queue    │
│ • GitHub Deploy│    │ • CORS Config   │    │ • Job Creation  │    │ • Concurrency   │
│ • Auto Build    │    │ • JWT Validation│    │ • Gallery Load  │    │ • Dead Letter Q │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │                        │
                                                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    DYNAMODB     │    │       S3        │    │ QUEUE PROCESSOR │    │  AMAZON BEDROCK │
│                 │◀───│                 │◀───│     LAMBDA      │───▶│                 │
│ • Job Tracking  │    │ • File Storage  │    │ • AI Generation │    │ • Nova Canvas   │
│ • Metadata      │    │ • Presigned URLs│    │ • File Upload   │    │ • Nova Reel     │
│ • GSI Queries   │    │ • 7-day Access  │    │ • Status Update │    │ • Text-to-Image │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Complete Data Flow**:
1. **Frontend (Amplify)**: User enters prompt via web interface
2. **API Gateway**: Routes request to Main Lambda with CORS/JWT validation
3. **Main Lambda**: Creates job in DynamoDB, sends message to SQS queue
4. **SQS Queue**: Manages Bedrock concurrency (max 2 concurrent generations)
5. **Queue Processor Lambda**: Picks up job, calls Nova Canvas for AI generation
6. **Bedrock Nova Canvas**: Generates 1280×720 trading card image from text
7. **S3 Storage**: Queue Processor saves image, updates DynamoDB with S3 key
8. **Gallery Loading**: Main Lambda queries DynamoDB, generates 7-day presigned URLs
9. **Frontend Display**: Shows cards with CSS holographic template styling

### **Complete AWS Services Stack**:
- **AWS Amplify**: Frontend hosting, GitHub integration, auto-build, environment variables
- **API Gateway**: REST API endpoints, CORS configuration, request routing
- **AWS Lambda (2 functions)**:
  - **Main Lambda**: API processing, authentication, job management, gallery loading
  - **Queue Processor Lambda**: AI generation, file storage, status updates
- **Amazon SQS**: Card generation queue + Dead Letter Queue for failed jobs
- **Amazon DynamoDB**: Job tracking table with GSI for device-based queries
- **Amazon S3**: File storage with presigned URL security and CORS configuration
- **Amazon Bedrock**: Nova Canvas (images) + Nova Reel (videos) AI models
- **CloudWatch**: Logging and monitoring for all components

## 🚀 Quick Deploy

### **Prerequisites** (5 minutes):
1. **AWS Account** with admin access
2. **Bedrock Access**: Go to AWS Console → Bedrock → Model Access → Request access to:
   - ✅ **Amazon Nova Canvas** (image generation)
   - ✅ **Amazon Nova Reel** (video generation)
3. **GitHub Token**: [Generate here](https://github.com/settings/tokens) with `repo` scope
4. **Fork this repo** to your GitHub account

### **Deploy Steps**:

#### 1. **Clone & Configure**
```bash
git clone https://github.com/YOUR-USERNAME/SnapMagic.git
cd SnapMagic
cp secrets.json.example secrets.json
```

#### 2. **Edit `secrets.json`** (REQUIRED):
```json
{
  "github": {
    "repositoryUrl": "https://github.com/YOUR-USERNAME/SnapMagic",
    "token": "ghp_YOUR_GITHUB_TOKEN_HERE",
    "branch": "main"
  },
  "app": {
    "name": "my-snapmagic-app",
    "region": "us-east-1"
  }
}
```

**⚠️ Critical**: 
- Use **YOUR forked repository URL**
- **Must be `us-east-1`** region (Bedrock Nova models)
- GitHub token needs `repo` permissions

#### 3. **Deploy Infrastructure**
```bash
cd infrastructure
npm install
cdk bootstrap --region us-east-1
cdk deploy SnapMagic-dev --region us-east-1
```

#### 4. **Access Your App**
- **Frontend URL**: Shown in CDK output as `AmplifyAppUrl`
- **Login**: `demo` / `demo` (or your configured credentials)
- **Ready**: Generate cards immediately!

## 🎨 How to Use

### **Generate Cards**:
1. Login with demo credentials
2. Enter prompt: *"AWS Lambda expert building serverless applications"*
3. Wait 30 seconds for AI generation
4. Download PNG or generate video

### **Gallery System**:
- All your cards saved automatically
- 7-day presigned URL access
- Mobile-friendly display
- Social sharing ready

### **Video Generation**:
- Click "Generate Video" on any card
- Nova Reel animates your trading card
- Download MP4 for social media

## 🔧 Technical Architecture Details

### **Two-Lambda Design**:
- **Main Lambda** (`SnapMagicAIFunction`):
  - Handles all API requests (login, job creation, gallery loading)
  - JWT authentication and validation
  - DynamoDB job creation and queries
  - Presigned URL generation for gallery
  - SQS message sending for card generation
  - 700 concurrent executions for high API traffic

- **Queue Processor Lambda** (`QueueProcessorFunction`):
  - Dedicated to AI generation only
  - Triggered by SQS messages
  - Calls Amazon Bedrock Nova Canvas
  - Uploads generated images to S3
  - Updates DynamoDB job status
  - 200 concurrent executions (respects Bedrock limits)

### **SQS Queue System**:
- **Main Queue**: `snapmagic-card-generation-dev`
  - 90-second visibility timeout (AI generation time)
  - 20-second long polling for instant pickup
  - Handles Bedrock concurrency limits (max 2 simultaneous)
- **Dead Letter Queue**: `snapmagic-card-generation-dlq-dev`
  - 3 retry attempts before moving to DLQ
  - 14-day retention for failed jobs

### **DynamoDB Design**:
- **Table**: `snapmagic-jobs-dev-{timestamp}`
  - Primary Key: `jobId` (UUID)
  - **GSI**: `device-override-index` for fast gallery queries
  - Tracks: job status, prompts, S3 keys, timestamps, user metadata
  - Pay-per-request billing for cost efficiency

### **S3 Configuration**:
- **Bucket**: `snapmagic-videos-dev-{account}-{timestamp}`
  - **Security**: Direct URLs blocked, presigned URLs allowed
  - **CORS**: Configured for GET, HEAD, PUT methods
  - **Presigned URLs**: 7-day expiration (maximum AWS allows)
  - **Auto-cleanup**: Files deleted when CDK stack destroyed

### **Amplify Integration**:
- **GitHub Connection**: Auto-deploys on code changes
- **Environment Variables**: API Gateway URL injected automatically
- **Build Process**: Replaces placeholders with actual API endpoints
- **Custom Domain**: Optional custom domain support

## 💰 Cost Estimate

**For 100 users generating 5 cards each**:
- Bedrock Nova Canvas: ~$67 (500 images)
- Lambda: ~$1 (processing)
- DynamoDB: ~$1 (metadata)
- S3: ~$2 (storage)
- **Total**: ~$71 ($0.71 per user)

*Compare to traditional event engagement: $50-100 per person*

## 🛠️ Customization

### **Event Branding**:
- Add logos to `frontend/public/logos/` as `1.png`, `2.png`, etc.
- Update event name in `secrets.json`
- Logos appear automatically in card template

### **Authentication**:
- Demo mode: `demo`/`demo`
- Custom credentials in `secrets.json`
- JWT-based with configurable expiration

### **Limits** (configurable in `secrets.json`):
- Cards per user: 5 (default)
- Videos per user: 3 (default)
- Override system for staff unlimited access

## 🔍 Troubleshooting

### **Common Issues**:
- **"Access Denied" for Bedrock**: Request Nova Canvas/Reel access in us-east-1
- **Cards not generating**: Check CloudWatch logs for Lambda errors
- **Gallery images not loading**: Verify S3 presigned URL configuration
- **Frontend shows API errors**: Confirm API Gateway URL in Amplify environment

### **Logs & Monitoring**:
- **CloudWatch**: `/aws/lambda/SnapMagic-*` log groups
- **DynamoDB**: Check job status in `snapmagic-jobs-*` table
- **S3**: Verify files in `snapmagic-videos-*` bucket

## 📊 Architecture Benefits

### **Why This Design**:
- **Serverless**: Zero server management, infinite scale
- **Cost-Effective**: Pay only for usage, not idle time
- **Reliable**: AWS managed services, 99.9%+ uptime
- **Secure**: IAM roles, presigned URLs, encrypted storage
- **Fast**: DynamoDB queries, S3 CDN-ready storage

### **Production Ready**:
- Well-Architected Framework compliance
- Infrastructure as Code (CDK)
- Monitoring and logging built-in
- Account-agnostic deployment

## 🎉 Success Metrics

After deployment, you'll have:
- ✅ **AI Card Generation**: 30-second creation time
- ✅ **Gallery System**: Instant loading with presigned URLs
- ✅ **Video Creation**: 60-second animated videos
- ✅ **Mobile Experience**: Works on all devices
- ✅ **Social Sharing**: 7-day accessible links

**Transform your AWS events with AI-powered engagement!** 🚀

---

**Built with ❤️ for the AWS Community**  
*Questions? Check CloudWatch logs or create an issue.*
