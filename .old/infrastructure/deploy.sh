#!/bin/bash

# SnapMagic Infrastructure Deployment Script
set -e

echo "🚀 SnapMagic Infrastructure Deployment"
echo "======================================"

# Check if AWS profile 'snap' exists
if ! aws configure list-profiles | grep -q "snap"; then
    echo "❌ AWS profile 'snap' not found. Please configure it first:"
    echo "   aws configure --profile snap"
    exit 1
fi

# Check if CDK is bootstrapped
echo "🔍 Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --profile snap >/dev/null 2>&1; then
    echo "⚠️  CDK not bootstrapped. Bootstrapping now..."
    npx cdk bootstrap --profile snap
else
    echo "✅ CDK already bootstrapped"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy infrastructure
echo "🚀 Deploying infrastructure..."
npm run deploy

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Connect your GitHub repository to Amplify"
echo "2. Configure GitHub access token in Amplify console"
echo "3. Trigger first build"
echo ""
echo "🔗 Check the Amplify console URL from the output above"
