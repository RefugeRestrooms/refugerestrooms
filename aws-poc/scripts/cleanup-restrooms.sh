#!/bin/bash

# Cleanup script for REFUGE Restrooms development/staging environments
# SAFETY: This script will ONLY work on dev/staging tables, NOT production
# Usage: ./cleanup-restrooms.sh <environment>
# Example: ./cleanup-restrooms.sh dev

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
    echo -e "${RED}Usage: $0 <environment> [aws-profile]${NC}"
    echo "Example: $0 dev"
    echo "Example: $0 dev personal"
    echo "Example: $0 staging"
    exit 1
fi

ENVIRONMENT=$1
AWS_PROFILE="${2:-${AWS_PROFILE:-}}"

# SAFETY CHECK: Only allow dev or staging
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}ERROR: This script can ONLY be used with 'dev' or 'staging' environments${NC}"
    echo -e "${RED}Provided environment: $ENVIRONMENT${NC}"
    echo ""
    echo "This is a safety feature to prevent accidental deletion of production data."
    echo ""
    echo "Allowed environments:"
    echo "  - dev"
    echo "  - staging"
    exit 1
fi

TABLE_NAME="refuge-restrooms-${ENVIRONMENT}"
REGION="${AWS_REGION:-us-east-1}"

# Build AWS CLI command prefix with optional profile
AWS_CMD="aws"
if [ -n "$AWS_PROFILE" ]; then
    AWS_CMD="aws --profile $AWS_PROFILE"
fi

echo -e "${YELLOW}=========================================="
echo "REFUGE Restrooms - Cleanup Script"
echo "==========================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Table: $TABLE_NAME"
echo "Region: $REGION"
if [ -n "$AWS_PROFILE" ]; then
    echo "AWS Profile: $AWS_PROFILE"
fi
echo ""

# Verify AWS CLI is configured
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Verify jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}ERROR: jq is not installed${NC}"
    echo "Please install jq:"
    echo "  macOS: brew install jq"
    echo "  Ubuntu: sudo apt-get install jq"
    exit 1
fi

# Verify table exists
echo "Verifying table exists..."
if ! $AWS_CMD dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Table '$TABLE_NAME' not found in $REGION${NC}"
    echo "Please verify:"
    echo "  - Environment name is correct (dev or staging)"
    echo "  - AWS credentials are configured (run: aws configure)"
    echo "  - Region is correct (set AWS_REGION env var if not us-east-1)"
    echo "  - You have permissions to access DynamoDB"
    exit 1
fi

echo -e "${GREEN}✓ Table found${NC}"
echo ""

# Count items before deletion
echo "Counting items in table..."
ITEM_COUNT=$($AWS_CMD dynamodb scan \
    --table-name "$TABLE_NAME" \
    --select "COUNT" \
    --region "$REGION" \
    --output json | jq -r '.Count')

echo "Found $ITEM_COUNT restroom(s) in $TABLE_NAME"
echo ""

if [ "$ITEM_COUNT" -eq 0 ]; then
    echo -e "${GREEN}Table is already empty. Nothing to delete.${NC}"
    exit 0
fi

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will delete ALL $ITEM_COUNT restroom(s) from the $ENVIRONMENT environment.${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    echo -e "${RED}Deletion cancelled.${NC}"
    exit 0
fi

echo ""
echo "Starting deletion..."
echo ""

# Scan and delete all items
DELETED_COUNT=0
NEXT_TOKEN=""

while true; do
    # Scan for items
    if [ -z "$NEXT_TOKEN" ]; then
        SCAN_RESULT=$($AWS_CMD dynamodb scan \
            --table-name "$TABLE_NAME" \
            --region "$REGION" \
            --output json)
    else
        SCAN_RESULT=$($AWS_CMD dynamodb scan \
            --table-name "$TABLE_NAME" \
            --region "$REGION" \
            --starting-token "$NEXT_TOKEN" \
            --output json)
    fi

    # Extract items
    ITEMS=$(echo "$SCAN_RESULT" | jq -c '.Items[]')
    
    # Delete each item
    while IFS= read -r item; do
        if [ -n "$item" ]; then
            RESTROOM_ID=$(echo "$item" | jq -r '.id.S')
            
            $AWS_CMD dynamodb delete-item \
                --table-name "$TABLE_NAME" \
                --key "{\"id\": {\"S\": \"$RESTROOM_ID\"}}" \
                --region "$REGION" \
                > /dev/null 2>&1
            
            DELETED_COUNT=$((DELETED_COUNT + 1))
            echo "  Deleted: $RESTROOM_ID (${DELETED_COUNT}/${ITEM_COUNT})"
        fi
    done <<< "$ITEMS"

    # Check for more items
    NEXT_TOKEN=$(echo "$SCAN_RESULT" | jq -r '.NextToken // empty')
    
    if [ -z "$NEXT_TOKEN" ]; then
        break
    fi
done

echo ""
echo -e "${GREEN}=========================================="
echo "Cleanup Complete!"
echo "==========================================${NC}"
echo ""
echo "Deleted: $DELETED_COUNT restroom(s)"
echo "Environment: $ENVIRONMENT"
echo "Table: $TABLE_NAME"
echo ""

# Verify table is empty
FINAL_COUNT=$($AWS_CMD dynamodb scan \
    --table-name "$TABLE_NAME" \
    --select "COUNT" \
    --region "$REGION" \
    --output json | jq -r '.Count')

if [ "$FINAL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Table is now empty${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Table still contains $FINAL_COUNT item(s)${NC}"
    echo "This might indicate a deletion error. Please verify manually."
fi

echo ""
