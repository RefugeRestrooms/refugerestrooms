#!/bin/bash

# Test spam protection functionality
# Usage: ./test-spam-protection.sh <GRAPHQL_ENDPOINT> <API_KEY>

set -e

ENDPOINT=$1
API_KEY=$2

if [ -z "$ENDPOINT" ] || [ -z "$API_KEY" ]; then
    echo "Usage: $0 <GRAPHQL_ENDPOINT> <API_KEY>"
    exit 1
fi

echo "🧪 Testing Spam Protection for REFUGE Restrooms API"
echo "Endpoint: $ENDPOINT"
echo ""

# Test 1: Normal restroom creation (should succeed)
echo "Test 1: Creating legitimate restroom..."
LEGITIMATE_MUTATION='{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name approved spamScore } }",
  "variables": {
    "input": {
      "name": "Downtown Library",
      "street": "123 Main St",
      "city": "Seattle",
      "state": "WA",
      "country": "US",
      "accessible": true,
      "unisex": false,
      "changingTable": true,
      "comment": "Clean restroom on the first floor near the entrance"
    }
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$LEGITIMATE_MUTATION" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"approved":true'; then
    echo "✅ Legitimate restroom created and auto-approved"
else
    echo "⚠️  Legitimate restroom created but requires approval"
fi
echo ""

# Test 2: Spam keywords (should be flagged)
echo "Test 2: Creating restroom with spam keywords..."
SPAM_MUTATION='{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name approved spamScore } }",
  "variables": {
    "input": {
      "name": "Free Bitcoin Casino",
      "street": "456 Spam Ave",
      "city": "Las Vegas",
      "state": "NV",
      "country": "US",
      "accessible": false,
      "unisex": true,
      "changingTable": false,
      "comment": "Click here to make money fast! Free lottery tickets!"
    }
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SPAM_MUTATION" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
    echo "✅ Spam content rejected"
elif echo "$RESPONSE" | grep -q '"approved":false'; then
    echo "✅ Spam content flagged for review"
else
    echo "❌ Spam content was not detected"
fi
echo ""

# Test 3: URL in name (should be flagged)
echo "Test 3: Creating restroom with URL in name..."
URL_MUTATION='{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name approved spamScore } }",
  "variables": {
    "input": {
      "name": "Visit https://spam-site.com for deals",
      "street": "789 URL St",
      "city": "Portland",
      "state": "OR",
      "country": "US",
      "accessible": true,
      "unisex": true,
      "changingTable": false,
      "comment": "Regular restroom"
    }
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$URL_MUTATION" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
    echo "✅ URL in name rejected"
elif echo "$RESPONSE" | grep -q '"approved":false'; then
    echo "✅ URL in name flagged for review"
else
    echo "❌ URL in name was not detected"
fi
echo ""

# Test 4: Excessive comment length (should be flagged)
echo "Test 4: Creating restroom with excessive comment..."
LONG_COMMENT="This is an extremely long comment that goes on and on and on and repeats itself over and over again. This is an extremely long comment that goes on and on and on and repeats itself over and over again. This is an extremely long comment that goes on and on and on and repeats itself over and over again. This is an extremely long comment that goes on and on and on and repeats itself over and over again. This is an extremely long comment that goes on and on and on and repeats itself over and over again."

LONG_MUTATION='{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name approved spamScore } }",
  "variables": {
    "input": {
      "name": "Normal Cafe",
      "street": "321 Long St",
      "city": "Denver",
      "state": "CO",
      "country": "US",
      "accessible": true,
      "unisex": false,
      "changingTable": true,
      "comment": "'"$LONG_COMMENT"'"
    }
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$LONG_MUTATION" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"approved":false'; then
    echo "✅ Excessive comment flagged for review"
else
    echo "⚠️  Excessive comment not flagged (may be acceptable)"
fi
echo ""

# Test 5: Rate limiting (create multiple requests quickly)
echo "Test 5: Testing rate limiting..."
for i in {1..6}; do
    echo "Request $i/6..."
    
    RATE_MUTATION='{
      "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name } }",
      "variables": {
        "input": {
          "name": "Rate Test Restroom '$i'",
          "street": "Rate St",
          "city": "Test City",
          "state": "CA",
          "country": "US",
          "accessible": false,
          "unisex": true,
          "changingTable": false
        }
      }
    }'
    
    RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$RATE_MUTATION" \
      "$ENDPOINT")
    
    if echo "$RESPONSE" | grep -q "Too many submissions"; then
        echo "✅ Rate limit triggered at request $i"
        break
    elif echo "$RESPONSE" | grep -q '"id"'; then
        echo "   Request $i succeeded"
    else
        echo "   Request $i failed: $RESPONSE"
    fi
    
    # Small delay between requests
    sleep 0.5
done
echo ""

echo "🏁 Spam protection tests completed!"
echo ""
echo "Summary:"
echo "- Legitimate content should be auto-approved"
echo "- Spam keywords should be rejected or flagged"
echo "- URLs in names should be flagged"
echo "- Excessive content should be flagged"
echo "- Rate limiting should prevent abuse"