#!/bin/bash

# SnapMagic Security Verification Script
# This script checks for potential security issues

set -e

echo "🔒 SnapMagic Security Check"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Function to report issues
report_issue() {
    echo -e "${RED}❌ SECURITY ISSUE: $1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "🔍 Checking for exposed credentials in git history..."

# Check for actual credential files in git history (not just mentions)
if git log --all --name-only --pretty=format: | grep -E "credentials$|\.pem$|\.key$|id_rsa|id_dsa" | grep -q "."; then
    report_issue "Actual credential files found in git history"
else
    report_success "No credential files in git history"
fi

# Check for hardcoded AWS keys
if git grep -i "AKIA\|aws_access_key\|aws_secret_access_key" 2>/dev/null | grep -v ".gitignore" | grep -v "SECURITY.md" | grep -v "security-check.sh"; then
    report_issue "Potential AWS credentials found in code"
else
    report_success "No hardcoded AWS credentials found"
fi

# Check for hardcoded tokens (excluding documentation)
if git grep -i "ghp_[a-zA-Z0-9]" 2>/dev/null | grep -v ".gitignore" | grep -v "SECURITY.md" | grep -v "security-check.sh" | grep -v "connect-github.md" | grep -v "README.md" | grep -v "deploy.sh"; then
    report_issue "Potential GitHub tokens found in code"
else
    report_success "No hardcoded GitHub tokens found"
fi

echo ""
echo "🔍 Checking .gitignore configuration..."

# Check if .gitignore exists and has security patterns
if [ -f ".gitignore" ]; then
    if grep -q "\.aws/" .gitignore && grep -q "\.env" .gitignore && grep -q "\*secret\*" .gitignore; then
        report_success ".gitignore has security patterns"
    else
        report_warning ".gitignore missing some security patterns"
    fi
else
    report_issue ".gitignore file not found"
fi

echo ""
echo "🔍 Checking for environment files..."

# Check for .env files (excluding node_modules and examples)
if find . -name ".env*" -not -name ".env.example" -not -path "*/node_modules/*" | grep -q "."; then
    report_warning "Environment files found - ensure they're in .gitignore"
else
    report_success "No environment files found"
fi

echo ""
echo "🔍 Checking AWS credentials..."

# Check for local AWS credentials
if [ -f "$HOME/.aws/credentials" ]; then
    report_warning "Local AWS credentials file exists - consider using temporary credentials"
else
    report_success "No local AWS credentials file found"
fi

echo ""
echo "🔍 Checking file permissions..."

# Check for overly permissive files
if find . -type f -perm /o+w | grep -q "."; then
    report_warning "World-writable files found"
else
    report_success "No world-writable files found"
fi

echo ""
echo "📊 Security Check Summary"
echo "========================"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 No security issues found!${NC}"
    echo ""
    echo "✅ Repository is secure"
    echo "✅ No credentials exposed"
    echo "✅ Security best practices followed"
else
    echo -e "${RED}⚠️  $ISSUES_FOUND security issue(s) found!${NC}"
    echo ""
    echo "Please review and fix the issues above before proceeding."
    exit 1
fi

echo ""
echo "🔗 Additional Security Resources:"
echo "- SECURITY.md: Comprehensive security guidelines"
echo "- scripts/setup-secrets.sh: Secure secrets management"
echo "- AWS Secrets Manager: For storing sensitive data"
echo ""
echo "Remember: Security is an ongoing process, not a one-time check!"
