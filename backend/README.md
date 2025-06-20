# SnapMagic AI Backend

AI-powered backend service using Strands Agents for image transformation, video generation, and gesture detection.

## 🚀 Features

- **Image Transformation**: Transform selfies using Amazon Bedrock Nova Canvas
- **Video Generation**: Create short videos using Amazon Bedrock Nova Reel  
- **Gesture Detection**: Detect thumbs up/down using Amazon Rekognition
- **Speech-to-Text**: Convert voice prompts using Amazon Transcribe
- **Strands Agents Integration**: Advanced AI orchestration and tool management

## 🏗️ Architecture

```
Frontend (Amplify)
    ↓ API calls
Strands Agents Backend (FastAPI/Lambda)
    ↓ Built-in Bedrock integration
Amazon Bedrock Nova Canvas/Reel + Rekognition
    ↓ Returns results
Frontend displays + download
```

## 📋 Prerequisites

- Python 3.9+
- AWS CLI configured with appropriate permissions
- Access to Amazon Bedrock models (Nova Canvas, Nova Reel)
- Strands Agents SDK

## 🛠️ Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Test the agent
python test_agent.py

# Run local development server
python run_local.py
```

## 🔧 Configuration

### AWS Permissions Required

The backend needs the following AWS permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-canvas-v1:0",
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-reel-v1:0"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectCustomLabels"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "transcribe:StartTranscriptionJob",
                "transcribe:GetTranscriptionJob"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Image Transformation
```
POST /api/transform-image
{
    "prompt": "Transform me into a superhero",
    "image_base64": "base64_encoded_image_data"
}
```

### Video Generation
```
POST /api/generate-video
{
    "prompt": "Create a flying video",
    "image_base64": "base64_encoded_image_data"
}
```

### Gesture Detection
```
POST /api/detect-gesture
{
    "image_base64": "base64_encoded_image_data"
}
```

### Speech Transcription
```
POST /api/transcribe-audio
{
    "audio_base64": "base64_encoded_audio_data"
}
```

### Generic AI Query
```
POST /api/snapmagic
{
    "query": "Your AI query here"
}
```

## 🧪 Testing

```bash
# Test the Strands agent
python test_agent.py

# Run local server for testing
python run_local.py

# Test API endpoints
curl -X GET http://localhost:8000/health
```

## 🚀 Deployment Options

### Option 1: AWS Lambda (Serverless)
- Use `lambda_handler.py` for serverless deployment
- Deploy via CDK or SAM
- Cost-effective for event-based usage

### Option 2: Container Deployment
- Use `main.py` with FastAPI
- Deploy to ECS, EKS, or App Runner
- Better for high-throughput scenarios

### Option 3: Local Development
- Use `run_local.py` for local testing
- Perfect for development and debugging

## 🔍 Monitoring

The backend includes comprehensive logging:
- Request/response logging
- Error tracking
- Performance metrics
- AWS service call monitoring

## 🛡️ Security

- CORS configured for frontend integration
- Input validation on all endpoints
- Error handling without sensitive data exposure
- AWS IAM role-based permissions

## 📚 Strands Agents Integration

This backend leverages Strands Agents for:
- **Simplified Bedrock Integration**: No manual SDK setup
- **Built-in Authentication**: Automatic AWS credential handling
- **Tool Orchestration**: Perfect for SnapMagic's AI features
- **Error Handling**: Automatic retries and fallbacks
- **Model Management**: Easy switching between AI models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
