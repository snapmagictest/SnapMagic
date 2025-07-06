# SnapMagic Development Guide

## 🎯 Recovery Points (Known Good States)

### **Current: 58327a0** - "Complete simple model configuration"
- ✅ **Working login** (demo/demo)
- ✅ **Model configuration** in exactly 3 places
- ✅ **Clean flow**: secrets.json → CDK → Lambda env vars → Python os.environ.get()
- ✅ **Models**: Nova Canvas v1:0, Nova Reel v1:1
- ✅ **Application URL**: https://main.d1qiuiqc1u6moe.amplifyapp.com

### **Previous: cf8e8f4** - "Original working baseline"
- ✅ Basic working deployment
- ✅ Hardcoded model IDs in Python files
- ✅ Streamlined deployment with auto-build

## 🏗️ Architecture Patterns

### **Configuration Pattern (CRITICAL)**
**ALWAYS follow this exact pattern for ANY configuration:**

1. **secrets.json** - Store the configuration value
2. **CDK (infrastructure/)** - Read from secrets.json, set as Lambda environment variable
3. **Python (backend/src/)** - Read from environment using `os.environ.get()`

**Example (Model Configuration):**
```json
// secrets.json
"models": {
  "novaCanvas": "amazon.nova-canvas-v1:0",
  "novaReel": "amazon.nova-reel-v1:1"
}
```

```typescript
// CDK - infrastructure/lib/snapmagic-stack.ts
environment: {
  NOVA_CANVAS_MODEL: inputs.novaCanvasModel,
  NOVA_REEL_MODEL: inputs.novaReelModel
}
```

```python
# Python - backend/src/card_generator.py
MODEL_ID = os.environ.get('NOVA_CANVAS_MODEL', 'amazon.nova-canvas-v1:0')
```

### **Auth Pattern (Reference)**
This is the **gold standard** - all configs should follow this:
```python
# backend/src/auth_simple.py
self.event_username = os.environ.get('EVENT_USERNAME', 'demo')
self.event_password = os.environ.get('EVENT_PASSWORD', 'demo')
```

## 🔧 Development Rules

### **Model Configuration Updates**
When updating model versions, update **exactly 3 places**:
1. `secrets.json` + `secrets.json.example`
2. `infrastructure/lib/snapmagic-stack.ts` (env vars + IAM permissions)
3. `backend/src/card_generator.py` + `backend/src/video_generator.py`

### **Deployment Flow**
```bash
# Standard deployment sequence
git add .
git commit -m "feat: descriptive message with what/why/pattern"
git push origin main
cd infrastructure && cdk deploy SnapMagic-dev --region us-east-1
```

### **Never Do This**
- ❌ **No config.py files** - keep it simple
- ❌ **No fallbacks with try/catch** - let it fail properly for debugging
- ❌ **No hardcoded values in CDK** - always read from secrets.json
- ❌ **No direct file reading in Lambda** - use environment variables

## 🐛 Common Issues & Fixes

### **Login Broken**
**Symptom**: Can't login with demo/demo
**Cause**: Usually Lambda can't read configuration
**Fix**: Check CloudWatch logs, verify environment variables are set

### **Model Access Denied**
**Symptom**: Bedrock access denied errors
**Fix**: AWS Console → Bedrock → Model Access → Request access to Nova models in us-east-1

### **CDK TypeScript Errors**
**Symptom**: Cannot find name 'secrets' or missing properties
**Fix**: Ensure all DeploymentInputs interface properties are provided in all input objects

### **Lambda Import Errors**
**Symptom**: "attempted relative import with no known parent package"
**Fix**: Usually means trying to read files that don't exist in Lambda package

## 📁 File Structure & Responsibilities

### **Configuration Files**
- `secrets.json` - Local configuration (not committed)
- `secrets.json.example` - Template for users
- `infrastructure/lib/deployment-inputs.d.ts` - TypeScript interface

### **Backend Files**
- `backend/src/lambda_handler.py` - Main Lambda entry point
- `backend/src/auth_simple.py` - Authentication (REFERENCE PATTERN)
- `backend/src/card_generator.py` - Nova Canvas integration
- `backend/src/video_generator.py` - Nova Reel integration

### **Infrastructure Files**
- `infrastructure/bin/snapmagic.ts` - CDK entry point, loads secrets.json
- `infrastructure/lib/snapmagic-stack.ts` - Main CDK stack definition

## 🚀 Deployment Architecture

### **Current Setup**
- **Environment**: dev
- **Region**: us-east-1 (REQUIRED for Nova models)
- **Stack Name**: SnapMagic-dev
- **Lambda**: SnapMagic-dev-SnapMagicAIFunction9B219E3A-6d4IetiOWiQV

### **AWS Services**
- **Amplify**: Frontend hosting with GitHub auto-deploy
- **Lambda**: Backend API processing
- **API Gateway**: REST API endpoints
- **S3**: Video storage
- **Bedrock**: Nova Canvas (images) + Nova Reel (videos)

## 🔄 Development Workflow

### **Adding New Configuration**
1. Add to `secrets.json` and `secrets.json.example`
2. Update `DeploymentInputs` interface
3. Update CDK to read from secrets and set env var
4. Update Python to read from `os.environ.get()`
5. Test, commit, deploy

### **Adding New Features**
1. Start from current recovery point
2. Follow established patterns
3. Test thoroughly
4. Create new recovery point if major milestone

### **Debugging Issues**
1. Check CloudWatch logs: `/aws/lambda/SnapMagic-dev-*`
2. Verify environment variables in Lambda console
3. Test API endpoints directly
4. Check Amplify build logs

## 📝 Commit Message Format
```
feat: Brief description

- What was changed
- Why it was changed  
- What pattern was followed
- Models/versions if applicable

Updated exactly X places:
1. File/location
2. File/location
```

## 🎯 Next Development Areas

### **Potential Enhancements**
- [ ] Model version management
- [ ] Error handling improvements
- [ ] Performance optimizations
- [ ] Additional AI models
- [ ] Enhanced logging

### **Technical Debt**
- [ ] None currently - clean architecture established

---

**Last Updated**: 2025-07-06  
**Current Recovery Point**: 58327a0  
**Status**: ✅ Stable, ready for new features
