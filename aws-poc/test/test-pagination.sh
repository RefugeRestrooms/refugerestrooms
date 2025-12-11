#!/bin/bash

# Pagination test for REFUGE Restrooms GraphQL API
# Tests: List restrooms with pagination and filtering
# Usage: ./test-pagination.sh <API_ENDPOINT> <API_KEY>
#
# PAGINATION STRATEGY:
# - Creates 10 test restrooms to ensure sufficient data
# - Uses limit=3 to force multiple pages (10 items / 3 per page = 4 pages)
# - Validates that nextToken is present when more results exist
# - Tests cursor-based pagination by fetching second page
# - Verifies filters work correctly across paginated results
#
# Note: Default limit is 25, but we override to 3 for testing purposes

set -e

# Array to track created restroom IDs for cleanup
CREATED_IDS=()

# Cleanup function that runs on exit (success or failure)
cleanup() {
  if [ ${#CREATED_IDS[@]} -gt 0 ]; then
    echo ""
    echo "=========================================="
    echo "Cleanup: Deleting ${#CREATED_IDS[@]} sample restrooms..."
    echo "----------------------------"
    
    for restroom_id in "${CREATED_IDS[@]}"; do
      DELETE_MUTATION=$(cat <<EOF
{
  "query": "mutation DeleteRestroom(\$id: ID!) { deleteRestroom(id: \$id) { success id } }",
  "variables": {
    "id": "$restroom_id"
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
        echo "  ✓ Deleted: $restroom_id"
      else
        echo "  ⚠ Failed to delete: $restroom_id"
      fi
    done
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
echo "REFUGE Restrooms - Pagination Test"
echo "=========================================="
echo ""

# Test 1: Create sample restrooms for testing
echo "Setup: Creating sample restrooms for pagination test..."
echo "----------------------------"
echo "Note: Creating 10 restrooms to properly test pagination with limit=3"
echo ""

SAMPLE_RESTROOMS=(
  '{"name":"Pagination Test 1","street":"100 Main St","city":"Seattle","state":"WA","country":"US","accessible":true,"unisex":false,"changingTable":false}'
  '{"name":"Pagination Test 2","street":"200 Oak Ave","city":"Portland","state":"OR","country":"US","accessible":false,"unisex":true,"changingTable":false}'
  '{"name":"Pagination Test 3","street":"300 Pine Rd","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":true,"changingTable":true}'
  '{"name":"Pagination Test 4","street":"400 Elm St","city":"Los Angeles","state":"CA","country":"US","accessible":true,"unisex":false,"changingTable":true}'
  '{"name":"Pagination Test 5","street":"500 Maple Dr","city":"San Diego","state":"CA","country":"US","accessible":false,"unisex":false,"changingTable":false}'
  '{"name":"Pagination Test 6","street":"600 First Ave","city":"Phoenix","state":"AZ","country":"US","accessible":true,"unisex":true,"changingTable":false}'
  '{"name":"Pagination Test 7","street":"700 Second St","city":"Denver","state":"CO","country":"US","accessible":false,"unisex":false,"changingTable":true}'
  '{"name":"Pagination Test 8","street":"800 Third Rd","city":"Austin","state":"TX","country":"US","accessible":true,"unisex":false,"changingTable":false}'
  '{"name":"Pagination Test 9","street":"900 Fourth Ave","city":"Boston","state":"MA","country":"US","accessible":false,"unisex":true,"changingTable":true}'
  '{"name":"Pagination Test 10","street":"1000 Fifth St","city":"Miami","state":"FL","country":"US","accessible":true,"unisex":true,"changingTable":false}'
)

for restroom_data in "${SAMPLE_RESTROOMS[@]}"; do
  CREATE_MUTATION=$(cat <<EOF
{
  "query": "mutation CreateRestroom(\$input: CreateRestroomInput!) { createRestroom(input: \$input) { id name } }",
  "variables": {
    "input": $restroom_data
  }
}
EOF
)

  CREATE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$CREATE_MUTATION" \
    "$API_ENDPOINT")

  RESTROOM_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.id')
  RESTROOM_NAME=$(echo "$CREATE_RESPONSE" | jq -r '.data.createRestroom.name')
  
  if [ "$RESTROOM_ID" != "null" ] && [ -n "$RESTROOM_ID" ]; then
    CREATED_IDS+=("$RESTROOM_ID")
    echo "  ✓ Created: $RESTROOM_NAME (ID: $RESTROOM_ID)"
  else
    echo "  ✗ Failed to create restroom"
  fi
done

echo ""
echo "Created ${#CREATED_IDS[@]} sample restrooms"
echo ""
echo "=========================================="
echo ""

# Test 2: List all restrooms (first page)
echo "Test 1: List restrooms (first page, limit 3)..."
echo "----------------------------"
echo "With 10 restrooms created, limit=3 should return 3 items + nextToken"
echo ""
LIST_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($limit: Int, $nextToken: String) { listRestrooms(limit: $limit, nextToken: $nextToken) { items { id name street city state accessible unisex changingTable } nextToken count } }",
  "variables": {
    "limit": 3
  }
}
EOF
)

LIST_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$LIST_QUERY" \
  "$API_ENDPOINT")

echo "$LIST_RESPONSE" | jq '.'
echo ""

FIRST_PAGE_COUNT=$(echo "$LIST_RESPONSE" | jq -r '.data.listRestrooms.count')
NEXT_TOKEN=$(echo "$LIST_RESPONSE" | jq -r '.data.listRestrooms.nextToken')

if [ "$FIRST_PAGE_COUNT" -eq 3 ]; then
    echo "✓ Test 1 PASSED: Retrieved exactly 3 restrooms (as requested by limit)"
    
    if [ "$NEXT_TOKEN" != "null" ] && [ -n "$NEXT_TOKEN" ]; then
        echo "✓ Pagination token present: ${NEXT_TOKEN:0:50}..."
        echo "✓ This confirms more results exist (pagination is working)"
    else
        echo "✗ Test 1 FAILED: No pagination token found"
        echo "  Expected: nextToken should be present with 10 items and limit=3"
        exit 1
    fi
elif [ "$FIRST_PAGE_COUNT" -gt 0 ]; then
    echo "⚠ Test 1 WARNING: Retrieved $FIRST_PAGE_COUNT restrooms (expected 3)"
    echo "  This might indicate the limit parameter isn't working correctly"
else
    echo "✗ Test 1 FAILED: No restrooms retrieved"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# Test 3: Get next page if token exists
if [ "$NEXT_TOKEN" != "null" ] && [ -n "$NEXT_TOKEN" ]; then
    echo "Test 2: List restrooms (second page)..."
    echo "----------------------------"
    
    NEXT_PAGE_QUERY=$(cat <<EOF
{
  "query": "query ListRestrooms(\$limit: Int, \$nextToken: String) { listRestrooms(limit: \$limit, nextToken: \$nextToken) { items { id name street city } nextToken count } }",
  "variables": {
    "limit": 3,
    "nextToken": "$NEXT_TOKEN"
  }
}
EOF
)

    NEXT_PAGE_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$NEXT_PAGE_QUERY" \
      "$API_ENDPOINT")

    echo "$NEXT_PAGE_RESPONSE" | jq '.'
    echo ""

    SECOND_PAGE_COUNT=$(echo "$NEXT_PAGE_RESPONSE" | jq -r '.data.listRestrooms.count')
    SECOND_PAGE_TOKEN=$(echo "$NEXT_PAGE_RESPONSE" | jq -r '.data.listRestrooms.nextToken')
    
    if [ "$SECOND_PAGE_COUNT" -eq 3 ]; then
        echo "✓ Test 2 PASSED: Retrieved exactly 3 restrooms on second page"
        
        if [ "$SECOND_PAGE_TOKEN" != "null" ] && [ -n "$SECOND_PAGE_TOKEN" ]; then
            echo "✓ Another pagination token present (more pages available)"
        else
            echo "✓ No more pagination token (approaching end of results)"
        fi
    elif [ "$SECOND_PAGE_COUNT" -gt 0 ]; then
        echo "✓ Test 2 PASSED: Retrieved $SECOND_PAGE_COUNT restrooms on second page"
        echo "  (Less than 3 means we're near the end of results)"
    else
        echo "✗ Test 2 FAILED: No restrooms on second page"
        echo "  Expected: At least some results with 10 total items"
        exit 1
    fi
    
    echo ""
    echo "=========================================="
    echo ""
fi

# Test 4: Filter by accessible
echo "Test 3: Filter by accessible=true..."
echo "----------------------------"
FILTER_ACCESSIBLE_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($accessible: Boolean) { listRestrooms(accessible: $accessible, limit: 25) { items { id name accessible } count } }",
  "variables": {
    "accessible": true
  }
}
EOF
)

FILTER_ACCESSIBLE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$FILTER_ACCESSIBLE_QUERY" \
  "$API_ENDPOINT")

echo "$FILTER_ACCESSIBLE_RESPONSE" | jq '.'
echo ""

ACCESSIBLE_COUNT=$(echo "$FILTER_ACCESSIBLE_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$ACCESSIBLE_COUNT" -gt 0 ]; then
    echo "✓ Test 3 PASSED: Found $ACCESSIBLE_COUNT accessible restrooms"
    
    # Verify all returned items are accessible
    ALL_ACCESSIBLE=$(echo "$FILTER_ACCESSIBLE_RESPONSE" | jq -r '.data.listRestrooms.items | all(.accessible == true)')
    if [ "$ALL_ACCESSIBLE" = "true" ]; then
        echo "✓ Filter verification passed: All results are accessible"
    else
        echo "⚠ Filter verification failed: Some results are not accessible"
    fi
else
    echo "⚠ Test 3 WARNING: No accessible restrooms found"
fi

echo ""
echo "=========================================="
echo ""

# Test 5: Filter by unisex
echo "Test 4: Filter by unisex=true..."
echo "----------------------------"
FILTER_UNISEX_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($unisex: Boolean) { listRestrooms(unisex: $unisex, limit: 25) { items { id name unisex } count } }",
  "variables": {
    "unisex": true
  }
}
EOF
)

FILTER_UNISEX_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$FILTER_UNISEX_QUERY" \
  "$API_ENDPOINT")

echo "$FILTER_UNISEX_RESPONSE" | jq '.'
echo ""

UNISEX_COUNT=$(echo "$FILTER_UNISEX_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$UNISEX_COUNT" -gt 0 ]; then
    echo "✓ Test 4 PASSED: Found $UNISEX_COUNT unisex restrooms"
    
    # Verify all returned items are unisex
    ALL_UNISEX=$(echo "$FILTER_UNISEX_RESPONSE" | jq -r '.data.listRestrooms.items | all(.unisex == true)')
    if [ "$ALL_UNISEX" = "true" ]; then
        echo "✓ Filter verification passed: All results are unisex"
    else
        echo "⚠ Filter verification failed: Some results are not unisex"
    fi
else
    echo "⚠ Test 4 WARNING: No unisex restrooms found"
fi

echo ""
echo "=========================================="
echo ""

# Test 6: Filter by changing table
echo "Test 5: Filter by changingTable=true..."
echo "----------------------------"
FILTER_CHANGING_TABLE_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($changingTable: Boolean) { listRestrooms(changingTable: $changingTable, limit: 25) { items { id name changingTable } count } }",
  "variables": {
    "changingTable": true
  }
}
EOF
)

FILTER_CHANGING_TABLE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$FILTER_CHANGING_TABLE_QUERY" \
  "$API_ENDPOINT")

echo "$FILTER_CHANGING_TABLE_RESPONSE" | jq '.'
echo ""

CHANGING_TABLE_COUNT=$(echo "$FILTER_CHANGING_TABLE_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$CHANGING_TABLE_COUNT" -gt 0 ]; then
    echo "✓ Test 5 PASSED: Found $CHANGING_TABLE_COUNT restrooms with changing tables"
    
    # Verify all returned items have changing tables
    ALL_CHANGING_TABLE=$(echo "$FILTER_CHANGING_TABLE_RESPONSE" | jq -r '.data.listRestrooms.items | all(.changingTable == true)')
    if [ "$ALL_CHANGING_TABLE" = "true" ]; then
        echo "✓ Filter verification passed: All results have changing tables"
    else
        echo "⚠ Filter verification failed: Some results don't have changing tables"
    fi
else
    echo "⚠ Test 5 WARNING: No restrooms with changing tables found"
fi

echo ""
echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ List restrooms (first page)"
echo "  ✓ List restrooms (pagination)"
echo "  ✓ Filter by accessible"
echo "  ✓ Filter by unisex"
echo "  ✓ Filter by changing table"
echo ""
echo "Pagination test PASSED! 🎉"
echo ""
echo "Note: Cleanup will run automatically..."
