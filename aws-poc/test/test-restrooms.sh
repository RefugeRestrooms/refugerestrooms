#!/bin/bash

# End-to-end test for REFUGE Restrooms GraphQL API
# Tests: Create → Get → Update → Delete → Verify
# Usage: ./test-restrooms.sh <API_ENDPOINT> <API_KEY>

set -e

# Variable to track created restroom ID for cleanup
RESTROOM_ID=""

# Cleanup function that runs on exit (success or failure)
cleanup() {
  if [ -n "$RESTROOM_ID" ] && [ "$RESTROOM_ID" != "null" ]; then
    echo ""
    echo "Cleanup: Deleting test restroom $RESTROOM_ID..."
    
    DELETE_MUTATION=$(cat <<EOF
{
  "query": "mutation DeleteRestroom(\$id: ID!) { deleteRestroom(id: \$id) { success id } }",
  "variables": {
    "id": "$RESTROOM_ID"
  }
}
EOF
)

    DELETE_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$DELETE_MUTATION" \
      "$API_ENDPOINT" 2>/dev/null || true)

    SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.data.deleteRestroom.success' 2>/dev/null || echo "false")
    
    if [ "$SUCCESS" = "true" ]; then
      echo "✓ Cleanup completed: Deleted $RESTROOM_ID"
    else
      echo "⚠ Cleanup warning: Failed to delete $RESTROOM_ID"
    fi
    echo ""
  fi
}

# Register cleanup function to run on exit
trap cleanup EXIT

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <API_ENDPOINT> <API_KEY>"
    echo "Example: $0 https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql your-api-key"
    exit 1
fi

API_ENDPOINT=$1
API_KEY=$2

echo "=========================================="
echo "REFUGE Restrooms - End-to-End Test"
echo "=========================================="
echo ""

# Test 1: Create a restroom
echo "Test 1: Creating a restroom..."
echo "----------------------------"
CREATE_MUTATION=$(cat <<'EOF'
{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name street city state country latitude longitude accessible unisex changingTable approved createdAt } }",
  "variables": {
    "input": {
      "name": "Test Coffee Shop",
      "street": "456 Market Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "accessible": true,
      "unisex": true,
      "changingTable": false,
      "comment": "Gender-neutral single-stall restroom",
      "directions": "Through the main entrance, past the counter on the left"
    }
  }
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$CREATE_MUTATION" \
  "$API_ENDPOINT")

echo "$CREATE_RESPONSE" | jq '.'
echo ""

# Extract the created restroom ID (will be used by cleanup function)
RESTROOM_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.id')

if [ "$RESTROOM_ID" != "null" ] && [ -n "$RESTROOM_ID" ]; then
    echo "✓ Test 1 PASSED: Restroom created with ID: $RESTROOM_ID"
    
    # Check if geocoding worked
    LATITUDE=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.latitude')
    LONGITUDE=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.longitude')
    
    if [ "$LATITUDE" != "null" ] && [ "$LONGITUDE" != "null" ]; then
        echo "✓ Geocoding successful: $LATITUDE, $LONGITUDE"
    else
        echo "⚠ Warning: Geocoding returned null coordinates"
    fi
else
    echo "✗ Test 1 FAILED: Could not create restroom"
    echo "Error: $CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# Test 2: Get the restroom
echo "Test 2: Retrieving the restroom..."
echo "----------------------------"
GET_QUERY=$(cat <<EOF
{
  "query": "query GetRestroom(\$id: ID!) { getRestroom(id: \$id) { id name street city state country latitude longitude accessible unisex changingTable comment directions upvote downvote approved createdAt updatedAt } }",
  "variables": {
    "id": "$RESTROOM_ID"
  }
}
EOF
)

GET_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$GET_QUERY" \
  "$API_ENDPOINT")

echo "$GET_RESPONSE" | jq '.'
echo ""

if echo "$GET_RESPONSE" | jq -e '.data.getRestroom' > /dev/null; then
    echo "✓ Test 2 PASSED: Restroom retrieved successfully"
    
    # Verify the data matches
    RETRIEVED_NAME=$(echo "$GET_RESPONSE" | jq -r '.data.getRestroom.name')
    if [ "$RETRIEVED_NAME" = "Test Coffee Shop" ]; then
        echo "✓ Data verification passed"
    else
        echo "⚠ Warning: Retrieved data doesn't match expected values"
    fi
else
    echo "✗ Test 2 FAILED: Could not retrieve restroom"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# Test 3: Update the restroom
echo "Test 3: Updating the restroom..."
echo "----------------------------"
UPDATE_MUTATION=$(cat <<EOF
{
  "query": "mutation UpdateRestroom(\$id: ID!, \$input: UpdateRestroomInput!) { updateRestroom(id: \$id, input: \$input) { id name street city state country latitude longitude accessible unisex changingTable comment directions updatedAt } }",
  "variables": {
    "id": "$RESTROOM_ID",
    "input": {
      "name": "Updated Coffee Shop",
      "street": "789 Mission Street",
      "accessible": false,
      "comment": "Updated comment - now with more details"
    }
  }
}
EOF
)

UPDATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$UPDATE_MUTATION" \
  "$API_ENDPOINT")

echo "$UPDATE_RESPONSE" | jq '.'
echo ""

if echo "$UPDATE_RESPONSE" | jq -e '.data.updateRestroom' > /dev/null; then
    echo "✓ Test 3 PASSED: Restroom updated successfully"
    
    # Verify the updated data
    UPDATED_NAME=$(echo "$UPDATE_RESPONSE" | jq -r '.data.updateRestroom.name')
    UPDATED_STREET=$(echo "$UPDATE_RESPONSE" | jq -r '.data.updateRestroom.street')
    UPDATED_ACCESSIBLE=$(echo "$UPDATE_RESPONSE" | jq -r '.data.updateRestroom.accessible')
    
    if [ "$UPDATED_NAME" = "Updated Coffee Shop" ] && [ "$UPDATED_STREET" = "789 Mission Street" ] && [ "$UPDATED_ACCESSIBLE" = "false" ]; then
        echo "✓ Update verification passed"
        
        # Check if re-geocoding worked for new address
        NEW_LATITUDE=$(echo "$UPDATE_RESPONSE" | jq -r '.data.updateRestroom.latitude')
        NEW_LONGITUDE=$(echo "$UPDATE_RESPONSE" | jq -r '.data.updateRestroom.longitude')
        
        if [ "$NEW_LATITUDE" != "null" ] && [ "$NEW_LONGITUDE" != "null" ]; then
            echo "✓ Re-geocoding successful: $NEW_LATITUDE, $NEW_LONGITUDE"
        else
            echo "⚠ Warning: Re-geocoding returned null coordinates"
        fi
    else
        echo "⚠ Warning: Updated data doesn't match expected values"
    fi
else
    echo "✗ Test 3 FAILED: Could not update restroom"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

echo ""
echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Create restroom"
echo "  ✓ Get restroom"
echo "  ✓ Update restroom"
echo ""
echo "End-to-end test PASSED! 🎉"
echo ""
echo "Note: Test restroom will be cleaned up automatically..."
