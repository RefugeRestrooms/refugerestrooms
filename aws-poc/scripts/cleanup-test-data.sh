#!/bin/bash

# Cleanup test data from REFUGE Restrooms API
# Usage: ./cleanup-test-data.sh <GRAPHQL_ENDPOINT> <API_KEY>

set -e

ENDPOINT=$1
API_KEY=$2

if [ -z "$ENDPOINT" ] || [ -z "$API_KEY" ]; then
    echo "Usage: $0 <GRAPHQL_ENDPOINT> <API_KEY>"
    exit 1
fi

echo "🧹 Cleaning up test data from REFUGE Restrooms API"
echo "Endpoint: $ENDPOINT"
echo ""

# Test restroom patterns to identify and clean up
TEST_PATTERNS=(
    "Test Feedback Restroom"
    "Downtown Library"
    "Free Bitcoin Casino"
    "Visit https://spam-site.com for deals"
    "Normal Cafe"
    "Rate Test Restroom"
)

echo "Searching for test restrooms to clean up..."

# Query all restrooms to find test data
LIST_QUERY='{
  "query": "query ListRestrooms { listRestrooms(limit: 100) { items { id name street city } } }"
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$LIST_QUERY" \
  "$ENDPOINT")

if ! echo "$RESPONSE" | grep -q '"items"'; then
    echo "❌ Failed to retrieve restrooms list"
    echo "Response: $RESPONSE"
    exit 1
fi

# Extract restroom data and find test entries
echo "$RESPONSE" | grep -o '"id":"[^"]*","name":"[^"]*"' | while IFS= read -r line; do
    RESTROOM_ID=$(echo "$line" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    RESTROOM_NAME=$(echo "$line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    # Check if this looks like a test restroom
    IS_TEST_RESTROOM=false
    for pattern in "${TEST_PATTERNS[@]}"; do
        if [[ "$RESTROOM_NAME" == *"$pattern"* ]]; then
            IS_TEST_RESTROOM=true
            break
        fi
    done
    
    # Also check for other test indicators
    if [[ "$RESTROOM_NAME" == *"Test"* ]] || \
       [[ "$RESTROOM_NAME" == *"test"* ]] || \
       [[ "$RESTROOM_NAME" == *"Bitcoin"* ]] || \
       [[ "$RESTROOM_NAME" == *"Casino"* ]] || \
       [[ "$RESTROOM_NAME" == *"https://"* ]] || \
       [[ "$RESTROOM_NAME" == *"Rate Test"* ]]; then
        IS_TEST_RESTROOM=true
    fi
    
    if [ "$IS_TEST_RESTROOM" = true ]; then
        echo "Found test restroom: $RESTROOM_NAME (ID: $RESTROOM_ID)"
        
        # Ask for confirmation before deleting
        read -p "Delete this restroom? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            DELETE_MUTATION='{
              "query": "mutation DeleteRestroom($id: ID!) { deleteRestroom(id: $id) { success message } }",
              "variables": {
                "id": "'$RESTROOM_ID'"
              }
            }'
            
            DELETE_RESPONSE=$(curl -s -X POST \
              -H "Content-Type: application/json" \
              -H "x-api-key: $API_KEY" \
              -d "$DELETE_MUTATION" \
              "$ENDPOINT")
            
            if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
                echo "✅ Deleted: $RESTROOM_NAME"
            else
                echo "❌ Failed to delete: $RESTROOM_NAME"
                echo "   Response: $DELETE_RESPONSE"
            fi
        else
            echo "⏭️  Skipped: $RESTROOM_NAME"
        fi
        echo ""
    fi
done

echo ""
echo "🏁 Cleanup completed!"
echo ""
echo "📝 Additional cleanup notes:"
echo "- Feedback records: No automatic cleanup (no TTL configured)"
echo "- Rate limit records: Auto-cleanup via 7-day TTL"
echo "- Spam protection records: Auto-cleanup via 24-hour TTL"
echo ""
echo "If you need to clean up feedback records manually:"
echo "1. Query the feedback table by restroomId"
echo "2. Delete associated feedback records"
echo "3. Consider adding TTL to feedback table for future cleanup"