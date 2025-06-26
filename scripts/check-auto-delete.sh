#!/bin/bash

# Check SnapMagic stack auto-delete status
# Usage: ./scripts/check-auto-delete.sh

echo "🔍 Checking SnapMagic stack auto-delete status..."

# Get stack name from CDK
STACK_NAME=$(cd infrastructure && npx cdk list 2>/dev/null | head -1)

if [ -z "$STACK_NAME" ]; then
    echo "❌ No CDK stack found"
    exit 1
fi

echo "📊 Stack: $STACK_NAME"

# Get stack creation time
CREATION_TIME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].CreationTime' \
    --output text 2>/dev/null)

if [ -z "$CREATION_TIME" ]; then
    echo "❌ Stack not found in AWS"
    exit 1
fi

# Calculate age in days
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CREATION_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${CREATION_TIME%.*}" "+%s" 2>/dev/null)
else
    # Linux
    CREATION_EPOCH=$(date -d "$CREATION_TIME" +%s 2>/dev/null)
fi

CURRENT_EPOCH=$(date +%s)
AGE_SECONDS=$((CURRENT_EPOCH - CREATION_EPOCH))
AGE_DAYS=$((AGE_SECONDS / 86400))
REMAINING_DAYS=$((7 - AGE_DAYS))

echo "📅 Created: $CREATION_TIME"
echo "⏰ Age: $AGE_DAYS days"

if [ $AGE_DAYS -ge 7 ]; then
    echo "🗑️  STATUS: Stack is scheduled for AUTO-DELETE (overdue)"
    echo "⚠️  The stack should have been deleted automatically"
else
    echo "✅ STATUS: Stack is active"
    echo "🗑️  Auto-delete in: $REMAINING_DAYS days"
    
    # Calculate exact deletion date
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DELETE_DATE=$(date -j -v+7d -f "%Y-%m-%dT%H:%M:%S" "${CREATION_TIME%.*}" "+%Y-%m-%d" 2>/dev/null)
    else
        DELETE_DATE=$(date -d "$CREATION_TIME + 7 days" "+%Y-%m-%d" 2>/dev/null)
    fi
    
    echo "📆 Auto-delete date: $DELETE_DATE"
fi

echo ""
echo "🛑 To delete manually before auto-delete:"
echo "   cd infrastructure && cdk destroy --force"
echo ""
echo "📋 To disable auto-delete:"
echo "   aws events disable-rule --name ${STACK_NAME}-AutoDeleteRule"
