#!/bin/bash

# SnapMagic Prerequisites Checker
# This script validates that all required prerequisites are installed and configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0
WARNINGS_FOUND=0

# Function to report issues
report_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

report_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🔍 SnapMagic Prerequisites Checker${NC}"
echo "=================================="
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        report_success "Node.js $NODE_VERSION (✓ >= 18.0.0)"
    else
        report_error "Node.js $NODE_VERSION is too old. Required: >= 18.0.0"
    fi
else
    report_error "Node.js not found. Please install Node.js 18+"
fi

# Check npm
echo ""
echo "🔍 Checking npm..."
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    report_success "npm $NPM_VERSION"
else
    report_error "npm not found. Please install npm"
fi

# Check AWS CLI
echo ""
echo "🔍 Checking AWS CLI..."
if command -v aws >/dev/null 2>&1; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    report_success "AWS CLI $AWS_VERSION"
else
    report_error "AWS CLI not found. Please install AWS CLI v2"
fi

# Check CDK CLI
echo ""
echo "🔍 Checking AWS CDK..."
if command -v cdk >/dev/null 2>&1; then
    CDK_VERSION=$(cdk --version 2>&1 | cut -d' ' -f1)
    report_success "AWS CDK $CDK_VERSION"
else
    report_error "AWS CDK not found. Please install: npm install -g aws-cdk"
fi

# Check Git
echo ""
echo "🔍 Checking Git..."
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    report_success "Git $GIT_VERSION"
    
    # Check Git configuration
    if git config --global user.name >/dev/null 2>&1 && git config --global user.email >/dev/null 2>&1; then
        GIT_NAME=$(git config --global user.name)
        GIT_EMAIL=$(git config --global user.email)
        report_success "Git configured: $GIT_NAME <$GIT_EMAIL>"
    else
        report_warning "Git not configured. Run: git config --global user.name 'Your Name' && git config --global user.email 'your.email@example.com'"
    fi
else
    report_error "Git not found. Please install Git"
fi

# Check AWS Profile
echo ""
echo "🔍 Checking AWS Profile..."
if aws configure list-profiles 2>/dev/null | grep -q "snap"; then
    report_success "AWS profile 'snap' exists"
    
    # Test AWS credentials
    if aws sts get-caller-identity --profile snap >/dev/null 2>&1; then
        ACCOUNT_ID=$(aws sts get-caller-identity --profile snap --query Account --output text)
        USER_ARN=$(aws sts get-caller-identity --profile snap --query Arn --output text)
        report_success "AWS credentials working: $USER_ARN"
        report_info "Account ID: $ACCOUNT_ID"
    else
        report_error "AWS credentials not working. Please run: aws configure --profile snap"
    fi
else
    report_error "AWS profile 'snap' not found. Please run: aws configure --profile snap"
fi

# Check CDK Bootstrap
echo ""
echo "🔍 Checking CDK Bootstrap..."
if aws cloudformation describe-stacks --stack-name CDKToolkit --profile snap >/dev/null 2>&1; then
    report_success "CDK is bootstrapped"
else
    report_warning "CDK not bootstrapped. Run: cdk bootstrap --profile snap"
fi

# Check GitHub Token in Secrets Manager
echo ""
echo "🔍 Checking GitHub Token..."
if aws secretsmanager describe-secret --secret-id "snapmagic/dev/github/token" --profile snap >/dev/null 2>&1; then
    report_success "GitHub token stored in Secrets Manager"
else
    report_warning "GitHub token not found. Run: ./scripts/setup-secrets.sh"
fi

# Check if we're in the right directory
echo ""
echo "🔍 Checking Project Structure..."
if [ -f "package.json" ] || [ -f "infrastructure/package.json" ]; then
    report_success "In SnapMagic project directory"
else
    report_warning "Not in SnapMagic project directory. Please cd to the project root."
fi

# Check for required files
if [ -f "PREREQUISITES.md" ] && [ -f "SECURITY.md" ] && [ -f "README.md" ]; then
    report_success "Required documentation files present"
else
    report_warning "Some documentation files missing"
fi

# Summary
echo ""
echo "📊 Prerequisites Check Summary"
echo "=============================="

if [ $ISSUES_FOUND -eq 0 ]; then
    if [ $WARNINGS_FOUND -eq 0 ]; then
        echo -e "${GREEN}🎉 All prerequisites met! You're ready to deploy SnapMagic.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. cd infrastructure && npm install"
        echo "2. npm run deploy"
        echo "3. ./scripts/setup-secrets.sh (if not done already)"
        echo "4. Connect GitHub repository in Amplify Console"
    else
        echo -e "${YELLOW}⚠️  $WARNINGS_FOUND warning(s) found, but you can proceed with deployment.${NC}"
        echo ""
        echo "Consider addressing the warnings above for the best experience."
    fi
else
    echo -e "${RED}❌ $ISSUES_FOUND error(s) found. Please fix these before deploying.${NC}"
    echo ""
    echo "Review the errors above and install missing prerequisites."
    echo "See PREREQUISITES.md for detailed installation instructions."
    exit 1
fi

echo ""
echo "📚 Helpful Resources:"
echo "- PREREQUISITES.md: Detailed setup instructions"
echo "- SECURITY.md: Security best practices"
echo "- README.md: Project overview and usage"
echo ""
echo "🚀 Ready to deploy? Run: cd infrastructure && npm run deploy"
