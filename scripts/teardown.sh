#!/bin/bash

# SnapMagic Teardown Script
# Removes all AWS resources for SnapMagic

set -e

echo "🗑️  SnapMagic Teardown Script"
echo "=============================="

# Configuration
REGION="us-east-1"

# Get App ID from CDK outputs or user input
if [ -f "../infrastructure/cdk.out/outputs.json" ]; then
    APP_ID=$(cat ../infrastructure/cdk.out/outputs.json | grep -o '"AmplifyAppId":"[^"]*"' | cut -d'"' -f4)
    echo "📱 Found App ID from CDK outputs: $APP_ID"
elif [ -n "$1" ]; then
    APP_ID="$1"
    echo "📱 Using provided App ID: $APP_ID"
else
    echo "📱 App ID not found. Please provide it as an argument:"
    echo "   ./teardown.sh YOUR-APP-ID"
    echo ""
    echo "Or find it in your Amplify Console:"
    echo "   https://console.aws.amazon.com/amplify/home?region=$REGION"
    exit 1
fi

echo "📍 Region: $REGION"
echo ""

# Confirm deletion
read -p "⚠️  Are you sure you want to delete ALL SnapMagic resources? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Teardown cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting teardown..."

# Method 1: Try CDK destroy first (if CDK was used)
if [ -f "../infrastructure/cdk.json" ]; then
    echo "📦 Found CDK configuration, attempting CDK destroy..."
    cd ../infrastructure
    
    if command -v cdk &> /dev/null; then
        echo "🏗️  Running CDK destroy..."
        cdk destroy --force
        echo "✅ CDK destroy completed"
    else
        echo "⚠️  CDK CLI not found, falling back to manual deletion"
        cd ../scripts
    fi
else
    echo "📦 No CDK configuration found, using manual deletion"
fi

# Method 2: Manual AWS CLI deletion
echo "🧹 Cleaning up Amplify app..."

# Check if app exists
if aws amplify get-app --app-id $APP_ID --region $REGION &> /dev/null; then
    echo "📱 Deleting Amplify app: $APP_ID"
    aws amplify delete-app --app-id $APP_ID --region $REGION
    echo "✅ Amplify app deleted"
else
    echo "ℹ️  Amplify app not found (may already be deleted)"
fi

# Verify deletion
echo ""
echo "🔍 Verifying deletion..."
if aws amplify get-app --app-id $APP_ID --region $REGION &> /dev/null; then
    echo "❌ App still exists - manual cleanup may be required"
    echo "🔗 Console: https://console.aws.amazon.com/amplify/home?region=$REGION"
else
    echo "✅ App successfully deleted"
fi

echo ""
echo "🎉 SnapMagic teardown completed!"
echo ""
echo "📊 Cost Impact:"
echo "   - Amplify hosting: $0 (deleted)"
echo "   - CloudFront: $0 (deleted)"
echo "   - Build minutes: Already consumed (no ongoing cost)"
echo ""
echo "🧹 Optional cleanup:"
echo "   - GitHub repository: https://github.com/snapmagictest/SnapMagic"
echo "   - Local files: $(pwd)/../"
echo ""
