#!/bin/bash

# SnapMagic Prerequisites Checker
# Verifies all requirements before deployment

echo "🔍 SnapMagic Prerequisites Checker"
echo "=================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
    
    # Check if version is 22.x or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 22 ]; then
        echo "✅ Node.js version is compatible (22.x+)"
    else
        echo "❌ Node.js version too old. Need 22.x+, found $NODE_VERSION"
        echo "   Install from: https://nodejs.org/"
        exit 1
    fi
else
    echo "❌ Node.js not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

echo ""

# Check AWS CLI
echo "☁️  Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1)
    echo "✅ AWS CLI installed: $AWS_VERSION"
    
    # Check if AWS CLI is configured
    if aws sts get-caller-identity &> /dev/null; then
        ACCOUNT_INFO=$(aws sts get-caller-identity --output text --query 'Account')
        USER_INFO=$(aws sts get-caller-identity --output text --query 'Arn' | cut -d'/' -f2)
        echo "✅ AWS CLI configured successfully"
        echo "   Account: $ACCOUNT_INFO"
        echo "   User: $USER_INFO"
    else
        echo "❌ AWS CLI not configured"
        echo "   Run: aws configure"
        echo "   Get credentials from: https://console.aws.amazon.com/"
        exit 1
    fi
else
    echo "❌ AWS CLI not installed"
    echo "   Install from: https://aws.amazon.com/cli/"
    exit 1
fi

echo ""

# Check CDK
echo "🏗️  Checking AWS CDK..."
if command -v cdk &> /dev/null; then
    CDK_VERSION=$(cdk --version)
    echo "✅ AWS CDK installed: $CDK_VERSION"
else
    echo "❌ AWS CDK not installed"
    echo "   Run: npm install -g aws-cdk"
    exit 1
fi

echo ""

# Check Git
echo "📂 Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git installed: $GIT_VERSION"
else
    echo "❌ Git not installed"
    echo "   Install from: https://git-scm.com/"
    exit 1
fi

echo ""

# Summary
echo "🎉 All prerequisites met!"
echo ""
echo "📋 Next steps:"
echo "1. Fork SnapMagic repository on GitHub"
echo "2. Clone your fork: git clone https://github.com/YOUR-USERNAME/SnapMagic.git"
echo "3. Navigate to infrastructure: cd SnapMagic/infrastructure"
echo "4. Deploy: npm run setup && npm run deploy"
echo ""
echo "🔑 Don't forget to create a GitHub personal access token:"
echo "   https://github.com/settings/tokens"
echo "   Required permissions: repo (Full control of private repositories)"
echo ""
