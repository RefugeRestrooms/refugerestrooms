#!/bin/bash

# Template for REFUGE Restrooms API tests
# Usage: ./test-template.sh <GRAPHQL_ENDPOINT> <API_KEY>
# 
# This template provides the standard structure for all test scripts
# including proper cleanup, error handling, and consistent output format.

set -e

ENDPOINT=$1
API_KEY=$2

if [ -z "$ENDPOINT" ] || [ -z "$API_KEY" ]; then
    echo "Usage: $0 <GRAPHQL_ENDPOINT> <API_KEY>"
    exit 1
fi

echo "🧪 Testing [FEATURE NAME] for REFUGE Restrooms API"
echo "Endpoint: $ENDPOINT"
echo ""

# Array to track created restroom IDs for cleanup
CREATED_RESTROOMS=()

# Cleanup function that runs on exit (success or failure)
cleanup() {
    if [ ${#CREATED_RESTROOMS[@]} -gt 0 ]; then
        echo ""
        echo "🧹 Cleaning up ${#CREATED_RESTROOMS[@]} test restrooms..."
        
        for restroom_id in "${CREATED_RESTROOMS[@]}"; do
            if [ -n "$restroom_id" ]; then
                DELETE_MUTATION='{
                  "query": "mutation DeleteRestroom($id: ID!) { deleteRestroom(id: $id) { success message } }",
                  "variables": {
                    "id": "'$restroom_id'"
                  }
                }'
                
                RESPONSE=$(curl -s -X POST \
                  -H "Content-Type: application/json" \
                  -H "x-api-key: $API_KEY" \
                  -d "$DELETE_MUTATION" \
                  "$ENDPOINT" 2>/dev/null || true)
                
                if echo "$RESPONSE" | grep -q '"success":true'; then
                    echo "✅ Deleted: $restroom_id"
                else
                    echo "⚠️  Failed to delete: $restroom_id"
                fi
            fi
        done
        echo ""
    fi
    
    # Add cleanup for other resources (feedback, etc.) if needed
    echo "📝 Note: Other test data (feedback, rate limits) will be cleaned up automatically via TTL"
}

# Register cleanup function to run on exit (success, failure, or interruption)
trap cleanup EXIT

# Helper function to extract restroom ID from GraphQL response
extract_restroom_id() {
    local response="$1"
    echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
}

# Helper function to create a test restroom
create_test_restroom() {
    local name="$1"
    local street="$2"
    local city="$3"
    local state="$4"
    local comment="$5"
    
    local mutation='{
      "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name approved } }",
      "variables": {
        "input": {
          "name": "'$name'",
          "street": "'$street'",
          "city": "'$city'",
          "state": "'$state'",
          "country": "US",
          "accessible": true,
          "unisex": false,
          "changingTable": false,
          "comment": "'$comment'"
        }
      }
    }'
    
    local response=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$mutation" \
      "$ENDPOINT")
    
    local restroom_id=$(extract_restroom_id "$response")
    if [ -n "$restroom_id" ]; then
        CREATED_RESTROOMS+=("$restroom_id")
        echo "Created test restroom: $name (ID: $restroom_id)"
    else
        echo "❌ Failed to create restroom: $name"
        echo "Response: $response"
    fi
    
    echo "$restroom_id"
}

# =============================================================================
# TEST IMPLEMENTATION STARTS HERE
# =============================================================================

echo "Test 1: [Description of test]..."

# Example test - replace with actual test logic
TEST_RESTROOM_ID=$(create_test_restroom "Test Template Restroom" "123 Test St" "Test City" "CA" "Template test restroom")

if [ -n "$TEST_RESTROOM_ID" ]; then
    echo "✅ Test 1 passed"
else
    echo "❌ Test 1 failed"
fi
echo ""

# Add more tests here...

echo "🏁 [FEATURE NAME] tests completed!"
echo ""
echo "Summary:"
echo "- ✅ Test cleanup automatically handled"
echo "- ✅ Consistent error handling"
echo "- ✅ Proper resource tracking"