#!/bin/bash

# SnapMagic Full Deployment Script
# This script deploys the complete SnapMagic application

set -e  # Exit on any error

echo "🚀 Starting SnapMagic Full Deployment"
echo "======================================"

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity || {
    echo "❌ AWS credentials not configured or expired"
    echo "Please set up AWS credentials first:"
    echo "export AWS_ACCESS_KEY_ID=your_access_key"
    echo "export AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "export AWS_SESSION_TOKEN=your_session_token"
    exit 1
}

# Navigate to infrastructure directory
cd infrastructure

# Install dependencies if needed
echo "📦 Installing CDK dependencies..."
npm install

# Build the CDK project
echo "🔨 Building CDK project..."
npm run build

# Bootstrap CDK if needed (safe to run multiple times)
echo "🏗️  Bootstrapping CDK..."
npx cdk bootstrap

# Deploy the CDK stack
echo "🚀 Deploying CDK stack..."
npx cdk deploy --require-approval never --outputs-file ../cdk-outputs.json

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ CDK deployment successful!"
    
    # Extract outputs
    if [ -f ../cdk-outputs.json ]; then
        echo "📋 Deployment Outputs:"
        cat ../cdk-outputs.json | jq -r '.SnapMagicStack | to_entries[] | "\(.key): \(.value)"'
        
        # Extract Amplify configuration commands
        echo ""
        echo "🔧 Next Steps - Configure Amplify:"
        echo "=================================="
        
        # Get the Amplify configuration commands from outputs
        STEP1_CMD=$(cat ../cdk-outputs.json | jq -r '.SnapMagicStack.ConfigureAmplifyStep1 // empty')
        STEP2_CMD=$(cat ../cdk-outputs.json | jq -r '.SnapMagicStack.ConfigureAmplifyStep2 // empty')
        
        if [ ! -z "$STEP1_CMD" ]; then
            echo "Step 1: Configure Amplify environment variables"
            echo "$STEP1_CMD"
            echo ""
            echo "Step 2: Trigger Amplify build"
            echo "$STEP2_CMD"
            echo ""
            
            # Automatically run the Amplify configuration
            echo "🔄 Automatically configuring Amplify..."
            eval "$STEP1_CMD"
            
            if [ $? -eq 0 ]; then
                echo "✅ Amplify environment variables configured"
                echo "🚀 Triggering Amplify build..."
                eval "$STEP2_CMD"
                
                if [ $? -eq 0 ]; then
                    echo "✅ Amplify build triggered successfully"
                else
                    echo "⚠️  Amplify build trigger failed, but you can run it manually"
                fi
            else
                echo "⚠️  Amplify configuration failed, but you can run it manually"
            fi
        fi
        
        # Show final URLs
        echo ""
        echo "🌐 Application URLs:"
        echo "==================="
        API_URL=$(cat ../cdk-outputs.json | jq -r '.SnapMagicStack.ApiGatewayUrl // empty')
        APP_URL=$(cat ../cdk-outputs.json | jq -r '.SnapMagicStack.AmplifyAppUrl // empty')
        
        if [ ! -z "$API_URL" ]; then
            echo "API Gateway: $API_URL"
        fi
        
        if [ ! -z "$APP_URL" ]; then
            echo "Frontend App: $APP_URL"
        fi
        
    else
        echo "⚠️  CDK outputs file not found"
    fi
    
else
    echo "❌ CDK deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Your SnapMagic application is now deployed and ready to use."
echo ""
echo "Login credentials: demo / demo"
echo ""
echo "Note: It may take a few minutes for Amplify to complete the build"
echo "and for the frontend to be fully available."
