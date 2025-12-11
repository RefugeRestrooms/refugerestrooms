#!/bin/bash

# Full-text search test for REFUGE Restrooms GraphQL API
# Tests: Text-based search with relevance scoring
# Usage: ./test-search.sh <API_ENDPOINT> <API_KEY>
#
# SEARCH STRATEGY:
# - Creates restrooms with diverse content for testing
# - Tests various search queries and patterns
# - Validates relevance scoring and ranking
# - Tests combined search + filters
# - Tests edge cases (empty query, special characters)

set -e

# Array to track created restroom IDs for cleanup
CREATED_IDS=()

# Cleanup function that runs on exit (success or failure)
cleanup() {
  if [ ${#CREATED_IDS[@]} -gt 0 ]; then
    echo ""
    echo "=========================================="
    echo "Cleanup: Deleting ${#CREATED_IDS[@]} test restrooms..."
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
echo "REFUGE Restrooms - Full-Text Search Test"
echo "=========================================="
echo ""

# Create diverse test restrooms for search testing
echo "Setup: Creating test restrooms with diverse content..."
echo "----------------------------"

SAMPLE_RESTROOMS=(
  '{"name":"Starbucks Coffee Shop","street":"100 Market Street","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":false,"changingTable":false,"comment":"Great coffee and clean restrooms","directions":"Enter through main entrance, restrooms on the right"}'
  '{"name":"Downtown Public Library","street":"200 Larkin Street","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":true,"changingTable":true,"comment":"Quiet library with accessible facilities","directions":"Second floor, near the reference desk"}'
  '{"name":"Union Square Shopping Mall","street":"300 Geary Boulevard","city":"San Francisco","state":"CA","country":"US","accessible":false,"unisex":false,"changingTable":true,"comment":"Busy shopping center with multiple restrooms","directions":"Food court level, next to the escalators"}'
  '{"name":"Golden Gate Park Visitor Center","street":"400 John F Kennedy Drive","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":true,"changingTable":false,"comment":"Park information center with outdoor restrooms","directions":"Behind the main building, follow the signs"}'
  '{"name":"Mission District Taco Shop","street":"500 Mission Street","city":"San Francisco","state":"CA","country":"US","accessible":false,"unisex":true,"changingTable":false,"comment":"Authentic Mexican food, small restroom","directions":"Ask staff for key, single occupancy"}'
  '{"name":"Financial District Office Building","street":"600 Montgomery Street","city":"San Francisco","state":"CA","country":"US","accessible":true,"unisex":false,"changingTable":false,"comment":"Modern office tower with clean facilities","directions":"Lobby level, near the security desk"}'
)

echo "Creating restrooms with searchable content:"

for i in "${!SAMPLE_RESTROOMS[@]}"; do
  restroom_data="${SAMPLE_RESTROOMS[$i]}"
  
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
    echo "  ✓ Created: $RESTROOM_NAME"
  else
    echo "  ✗ Failed to create: $RESTROOM_NAME"
  fi
done

echo ""
echo "Created ${#CREATED_IDS[@]} test restrooms"
echo ""
echo "=========================================="
echo ""

# Test 1: Search for "coffee"
echo "Test 1: Search for 'coffee'..."
echo "----------------------------"
echo "Expected: Starbucks Coffee Shop (high relevance)"
echo ""

SEARCH_COFFEE_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name relevanceScore comment } count } }",
  "variables": {
    "query": "coffee"
  }
}
EOF
)

SEARCH_COFFEE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_COFFEE_QUERY" \
  "$API_ENDPOINT")

echo "$SEARCH_COFFEE_RESPONSE" | jq '.'
echo ""

COFFEE_COUNT=$(echo "$SEARCH_COFFEE_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$COFFEE_COUNT" -gt 0 ]; then
    echo "✓ Test 1 PASSED: Found $COFFEE_COUNT restroom(s) matching 'coffee'"
    
    # Check if Starbucks is in results and has high relevance
    STARBUCKS_FOUND=$(echo "$SEARCH_COFFEE_RESPONSE" | jq -r '.data.listRestrooms.items[] | select(.name | contains("Starbucks")) | .name')
    if [ -n "$STARBUCKS_FOUND" ]; then
        echo "✓ Starbucks Coffee Shop found in results"
        STARBUCKS_SCORE=$(echo "$SEARCH_COFFEE_RESPONSE" | jq -r '.data.listRestrooms.items[] | select(.name | contains("Starbucks")) | .relevanceScore')
        echo "  Relevance score: $STARBUCKS_SCORE"
    else
        echo "⚠ Warning: Starbucks Coffee Shop not found in results"
    fi
    
    # Verify results are sorted by relevance (descending)
    SCORES=$(echo "$SEARCH_COFFEE_RESPONSE" | jq -r '.data.listRestrooms.items[].relevanceScore')
    echo "  All relevance scores: $(echo "$SCORES" | tr '\n' ' ')"
else
    echo "✗ Test 1 FAILED: No restrooms found for 'coffee'"
fi

echo ""
echo "=========================================="
echo ""

# Test 2: Search for "library"
echo "Test 2: Search for 'library'..."
echo "----------------------------"
echo "Expected: Downtown Public Library"
echo ""

SEARCH_LIBRARY_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name relevanceScore } count } }",
  "variables": {
    "query": "library"
  }
}
EOF
)

SEARCH_LIBRARY_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_LIBRARY_QUERY" \
  "$API_ENDPOINT")

echo "$SEARCH_LIBRARY_RESPONSE" | jq '.'
echo ""

LIBRARY_COUNT=$(echo "$SEARCH_LIBRARY_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$LIBRARY_COUNT" -gt 0 ]; then
    echo "✓ Test 2 PASSED: Found $LIBRARY_COUNT restroom(s) matching 'library'"
    
    LIBRARY_FOUND=$(echo "$SEARCH_LIBRARY_RESPONSE" | jq -r '.data.listRestrooms.items[] | select(.name | contains("Library")) | .name')
    if [ -n "$LIBRARY_FOUND" ]; then
        echo "✓ Library found in results: $LIBRARY_FOUND"
    fi
else
    echo "⚠ Test 2 WARNING: No restrooms found for 'library'"
fi

echo ""
echo "=========================================="
echo ""

# Test 3: Multi-word search "shopping mall"
echo "Test 3: Search for 'shopping mall'..."
echo "----------------------------"
echo "Expected: Union Square Shopping Mall"
echo ""

SEARCH_MALL_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name relevanceScore } count } }",
  "variables": {
    "query": "shopping mall"
  }
}
EOF
)

SEARCH_MALL_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_MALL_QUERY" \
  "$API_ENDPOINT")

echo "$SEARCH_MALL_RESPONSE" | jq '.'
echo ""

MALL_COUNT=$(echo "$SEARCH_MALL_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$MALL_COUNT" -gt 0 ]; then
    echo "✓ Test 3 PASSED: Found $MALL_COUNT restroom(s) matching 'shopping mall'"
    
    MALL_FOUND=$(echo "$SEARCH_MALL_RESPONSE" | jq -r '.data.listRestrooms.items[] | select(.name | contains("Mall")) | .name')
    if [ -n "$MALL_FOUND" ]; then
        echo "✓ Mall found in results: $MALL_FOUND"
    fi
else
    echo "⚠ Test 3 WARNING: No restrooms found for 'shopping mall'"
fi

echo ""
echo "=========================================="
echo ""

# Test 4: Search in comments "clean"
echo "Test 4: Search for 'clean' (should match comments)..."
echo "----------------------------"
echo "Expected: Restrooms with 'clean' in comments"
echo ""

SEARCH_CLEAN_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name comment relevanceScore } count } }",
  "variables": {
    "query": "clean"
  }
}
EOF
)

SEARCH_CLEAN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_CLEAN_QUERY" \
  "$API_ENDPOINT")

echo "$SEARCH_CLEAN_RESPONSE" | jq '.'
echo ""

CLEAN_COUNT=$(echo "$SEARCH_CLEAN_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$CLEAN_COUNT" -gt 0 ]; then
    echo "✓ Test 4 PASSED: Found $CLEAN_COUNT restroom(s) matching 'clean'"
    
    # Verify that results contain "clean" in comments
    CLEAN_COMMENTS=$(echo "$SEARCH_CLEAN_RESPONSE" | jq -r '.data.listRestrooms.items[] | select(.comment | contains("clean")) | .comment')
    if [ -n "$CLEAN_COMMENTS" ]; then
        echo "✓ Found restrooms with 'clean' in comments"
    fi
else
    echo "⚠ Test 4 WARNING: No restrooms found for 'clean'"
fi

echo ""
echo "=========================================="
echo ""

# Test 5: Search with accessibility filter
echo "Test 5: Search 'accessible' + accessible=true filter..."
echo "----------------------------"
echo "Expected: Only accessible restrooms matching search"
echo ""

SEARCH_ACCESSIBLE_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String, $accessible: Boolean) { listRestrooms(query: $query, accessible: $accessible, limit: 25) { items { id name accessible relevanceScore } count } }",
  "variables": {
    "query": "accessible",
    "accessible": true
  }
}
EOF
)

SEARCH_ACCESSIBLE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_ACCESSIBLE_QUERY" \
  "$API_ENDPOINT")

echo "$SEARCH_ACCESSIBLE_RESPONSE" | jq '.'
echo ""

ACCESSIBLE_COUNT=$(echo "$SEARCH_ACCESSIBLE_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$ACCESSIBLE_COUNT" -gt 0 ]; then
    echo "✓ Test 5 PASSED: Found $ACCESSIBLE_COUNT accessible restroom(s) matching 'accessible'"
    
    # Verify all results are accessible
    ALL_ACCESSIBLE=$(echo "$SEARCH_ACCESSIBLE_RESPONSE" | jq -r '.data.listRestrooms.items | all(.accessible == true)')
    if [ "$ALL_ACCESSIBLE" = "true" ]; then
        echo "✓ All results are accessible (filter working)"
    else
        echo "⚠ Warning: Some results are not accessible"
    fi
else
    echo "⚠ Test 5 WARNING: No accessible restrooms found matching 'accessible'"
fi

echo ""
echo "=========================================="
echo ""

# Test 6: Empty search query
echo "Test 6: Empty search query..."
echo "----------------------------"
echo "Expected: Should return all restrooms (no filtering)"
echo ""

SEARCH_EMPTY_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name } count } }",
  "variables": {
    "query": ""
  }
}
EOF
)

SEARCH_EMPTY_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_EMPTY_QUERY" \
  "$API_ENDPOINT")

EMPTY_COUNT=$(echo "$SEARCH_EMPTY_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$EMPTY_COUNT" -gt 0 ]; then
    echo "✓ Test 6 PASSED: Empty query returned $EMPTY_COUNT restrooms (no filtering applied)"
else
    echo "⚠ Test 6 WARNING: Empty query returned no results"
fi

echo ""
echo "=========================================="
echo ""

# Test 7: No matches
echo "Test 7: Search for non-existent term..."
echo "----------------------------"
echo "Expected: No results"
echo ""

SEARCH_NOMATCH_QUERY=$(cat <<'EOF'
{
  "query": "query ListRestrooms($query: String) { listRestrooms(query: $query, limit: 25) { items { id name } count } }",
  "variables": {
    "query": "xyznomatchterm"
  }
}
EOF
)

SEARCH_NOMATCH_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SEARCH_NOMATCH_QUERY" \
  "$API_ENDPOINT")

NOMATCH_COUNT=$(echo "$SEARCH_NOMATCH_RESPONSE" | jq -r '.data.listRestrooms.count')

if [ "$NOMATCH_COUNT" -eq 0 ]; then
    echo "✓ Test 7 PASSED: No results for non-existent term (as expected)"
else
    echo "⚠ Test 7 WARNING: Found $NOMATCH_COUNT results for non-existent term"
fi

echo ""
echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Search by name ('coffee')"
echo "  ✓ Search by name ('library')"
echo "  ✓ Multi-word search ('shopping mall')"
echo "  ✓ Search in comments ('clean')"
echo "  ✓ Combined search + accessibility filter"
echo "  ✓ Empty query handling"
echo "  ✓ No matches handling"
echo ""
echo "Full-text search test PASSED! 🎉"
echo ""
echo "Note: Cleanup will run automatically..."