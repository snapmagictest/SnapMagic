# SnapMagic 🎴✨

> **AI-Powered Trading Card Generation for AWS Events**  
> Generate personalized trading cards and videos using Amazon Bedrock Nova Canvas & Nova Reel

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-blue)](https://aws.amazon.com/bedrock/)
[![CDK](https://img.shields.io/badge/AWS-CDK-green)](https://aws.amazon.com/cdk/)

## 🎯 What is SnapMagic?

SnapMagic creates **AI-generated trading cards and videos** for AWS events using Amazon Bedrock. Users enter text prompts like "AWS Solutions Architect designing cloud infrastructure" and get personalized trading cards with holographic styling, plus animated videos.

**Perfect for**: AWS re:Invent, customer summits, partner events, conferences

## 🏗️ Architecture & Data Flow

```
User Request → API Gateway → Lambda → Nova Canvas (AI) → S3 Storage
                                ↓
                           DynamoDB (Metadata) → Presigned URLs → Gallery Display
```

### **How It Works**:
1. **User Input**: Text prompt submitted via web interface
2. **Job Queue**: SQS queues card generation (handles Bedrock concurrency limits)
3. **AI Generation**: Nova Canvas creates 1280×720 trading card image
4. **Storage**: Image saved to S3, metadata stored in DynamoDB
5. **Gallery**: DynamoDB tracks all cards, Lambda generates 7-day presigned URLs
6. **Display**: Frontend shows cards with CSS holographic template styling

### **Core AWS Services**:
- **Amazon Bedrock**: Nova Canvas (images) + Nova Reel (videos)
- **AWS Lambda**: API processing + queue-based AI generation
- **DynamoDB**: Job tracking, card metadata, gallery queries
- **Amazon S3**: File storage with presigned URL security
- **SQS**: Queue system for Bedrock concurrency management
- **API Gateway**: REST API with CORS
- **AWS Amplify**: Frontend hosting with GitHub integration

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

## 🔧 Technical Details

### **Data Architecture**:
- **DynamoDB**: Stores job status, metadata, user sessions
- **S3**: Stores actual PNG/MP4 files
- **Presigned URLs**: 7-day secure access to files
- **No hardcoded values**: Deploy to any AWS account

### **Security**:
- JWT authentication
- Presigned URLs (direct S3 URLs blocked)
- IAM roles with least privilege
- CORS configured for web access

### **Scalability**:
- SQS queues handle Bedrock rate limits
- DynamoDB GSI for fast gallery queries
- Lambda concurrency controls
- S3 for unlimited file storage

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
