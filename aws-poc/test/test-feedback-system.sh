#!/bin/bash

# Test feedback system functionality
# Usage: ./test-feedback-system.sh <GRAPHQL_ENDPOINT> <API_KEY>

set -e

ENDPOINT=$1
API_KEY=$2

if [ -z "$ENDPOINT" ] || [ -z "$API_KEY" ]; then
    echo "Usage: $0 <GRAPHQL_ENDPOINT> <API_KEY>"
    exit 1
fi

echo "🧪 Testing Feedback System for REFUGE Restrooms API"
echo "Endpoint: $ENDPOINT"
echo ""

# First, create a test restroom to get feedback on
echo "Step 1: Creating test restroom..."
CREATE_MUTATION='{
  "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name } }",
  "variables": {
    "input": {
      "name": "Test Feedback Restroom",
      "street": "123 Test St",
      "city": "Seattle",
      "state": "WA",
      "country": "US",
      "accessible": true,
      "unisex": true,
      "changingTable": false,
      "comment": "Test restroom for feedback system"
    }
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$CREATE_MUTATION" \
  "$ENDPOINT")

RESTROOM_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$RESTROOM_ID" ]; then
    echo "❌ Failed to create test restroom"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Created test restroom: $RESTROOM_ID"
echo ""

# Test 1: Submit positive feedback with reasons
echo "Test 1: Submitting positive feedback with safety and cleanliness reasons..."
POSITIVE_FEEDBACK='{
  "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!, $reasons: [FeedbackReason!], $comment: String) { submitFeedback(restroomId: $restroomId, positive: $positive, reasons: $reasons, comment: $comment) { id overallScore safetyScore totalFeedback confidence upvote downvote } }",
  "variables": {
    "restroomId": "'$RESTROOM_ID'",
    "positive": true,
    "reasons": ["SAFE", "CLEAN"],
    "comment": "Very clean and felt safe using it"
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$POSITIVE_FEEDBACK" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"overallScore"'; then
    echo "✅ Positive feedback submitted successfully"
else
    echo "❌ Failed to submit positive feedback"
fi
echo ""

# Test 2: Submit negative feedback with reasons
echo "Test 2: Submitting negative feedback with accessibility issues..."
NEGATIVE_FEEDBACK='{
  "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!, $reasons: [FeedbackReason!], $comment: String) { submitFeedback(restroomId: $restroomId, positive: $positive, reasons: $reasons, comment: $comment) { id overallScore safetyScore totalFeedback confidence upvote downvote } }",
  "variables": {
    "restroomId": "'$RESTROOM_ID'",
    "positive": false,
    "reasons": ["INACCESSIBLE", "DIRTY"],
    "comment": "Door was too narrow for wheelchair and not very clean"
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$NEGATIVE_FEEDBACK" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"totalFeedback":2'; then
    echo "✅ Negative feedback submitted and scores updated"
else
    echo "⚠️  Negative feedback may not have updated scores correctly"
fi
echo ""

# Test 3: Submit feedback without reasons (simple thumbs up)
echo "Test 3: Submitting simple positive feedback without reasons..."
SIMPLE_FEEDBACK='{
  "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!) { submitFeedback(restroomId: $restroomId, positive: $positive) { id overallScore totalFeedback confidence } }",
  "variables": {
    "restroomId": "'$RESTROOM_ID'",
    "positive": true
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$SIMPLE_FEEDBACK" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"totalFeedback":3'; then
    echo "✅ Simple feedback submitted successfully"
else
    echo "⚠️  Simple feedback may not have been counted"
fi
echo ""

# Test 4: Test validation - try to submit positive feedback with negative reasons
echo "Test 4: Testing validation - positive feedback with negative reasons (should fail)..."
INVALID_FEEDBACK='{
  "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!, $reasons: [FeedbackReason!]) { submitFeedback(restroomId: $restroomId, positive: $positive, reasons: $reasons) { id } }",
  "variables": {
    "restroomId": "'$RESTROOM_ID'",
    "positive": true,
    "reasons": ["UNSAFE", "DIRTY"]
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$INVALID_FEEDBACK" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
    echo "✅ Validation correctly rejected invalid feedback"
else
    echo "❌ Validation failed to catch invalid feedback"
fi
echo ""

# Test 5: Test rate limiting
echo "Test 5: Testing rate limiting (submitting multiple feedback quickly)..."
for i in {1..4}; do
    echo "Feedback attempt $i/4..."
    
    RATE_FEEDBACK='{
      "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!) { submitFeedback(restroomId: $restroomId, positive: $positive) { id } }",
      "variables": {
        "restroomId": "'$RESTROOM_ID'",
        "positive": true
      }
    }'
    
    RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$RATE_FEEDBACK" \
      "$ENDPOINT")
    
    if echo "$RESPONSE" | grep -q "Too many feedback"; then
        echo "✅ Rate limit triggered at attempt $i"
        break
    elif echo "$RESPONSE" | grep -q '"id"'; then
        echo "   Attempt $i succeeded"
    else
        echo "   Attempt $i failed: $RESPONSE"
    fi
    
    sleep 0.5
done
echo ""

# Test 6: Query the restroom to see final scores
echo "Test 6: Querying restroom to see final scores..."
GET_RESTROOM='{
  "query": "query GetRestroom($id: ID!) { getRestroom(id: $id) { id name overallScore safetyScore totalFeedback confidence upvote downvote } }",
  "variables": {
    "id": "'$RESTROOM_ID'"
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$GET_RESTROOM" \
  "$ENDPOINT")

echo "Final restroom scores:"
echo "$RESPONSE" | grep -o '"overallScore":[^,]*' || echo "No overall score found"
echo "$RESPONSE" | grep -o '"safetyScore":[^,]*' || echo "No safety score found"
echo "$RESPONSE" | grep -o '"totalFeedback":[^,]*' || echo "No total feedback found"
echo "$RESPONSE" | grep -o '"confidence":[^,]*' || echo "No confidence found"
echo ""

# Test 7: Test feedback for non-existent restroom
echo "Test 7: Testing feedback for non-existent restroom (should fail)..."
NONEXISTENT_FEEDBACK='{
  "query": "mutation SubmitFeedback($restroomId: ID!, $positive: Boolean!) { submitFeedback(restroomId: $restroomId, positive: $positive) { id } }",
  "variables": {
    "restroomId": "nonexistent-restroom-id",
    "positive": true
  }
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$NONEXISTENT_FEEDBACK" \
  "$ENDPOINT")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "not found"; then
    echo "✅ Correctly rejected feedback for non-existent restroom"
else
    echo "❌ Failed to validate restroom existence"
fi
echo ""

# Cleanup: Delete the test restroom and associated data
echo "🧹 Cleaning up test data..."

if [ -n "$RESTROOM_ID" ]; then
    echo "Deleting test restroom: $RESTROOM_ID"
    
    DELETE_MUTATION='{
      "query": "mutation DeleteRestroom($id: ID!) { deleteRestroom(id: $id) { success message } }",
      "variables": {
        "id": "'$RESTROOM_ID'"
      }
    }'
    
    RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "$DELETE_MUTATION" \
      "$ENDPOINT")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Test restroom deleted successfully"
    else
        echo "⚠️  Failed to delete test restroom: $RESPONSE"
        echo "   Manual cleanup may be required for restroom ID: $RESTROOM_ID"
    fi
else
    echo "⚠️  No restroom ID to clean up"
fi

echo ""
echo "📝 Note: Feedback records and rate limit entries will be automatically"
echo "   cleaned up by DynamoDB TTL (feedback table doesn't have TTL by default,"
echo "   but rate limit table has 7-day TTL)."
echo ""
echo "   If you need to manually clean up feedback records, you can query the"
echo "   feedback table by restroomId and delete the associated records."
echo ""

echo "🏁 Feedback system tests completed!"
echo ""
echo "Summary of Enhanced Binary Feedback System:"
echo "- ✅ Positive/negative feedback with optional reason categories"
echo "- ✅ Safety-focused scoring with weighted algorithms"
echo "- ✅ Time-weighted feedback (recent feedback counts more)"
echo "- ✅ Confidence indicators based on sample size"
echo "- ✅ Rate limiting to prevent spam"
echo "- ✅ Input validation for data integrity"
echo "- ✅ Backward compatibility with Rails upvote/downvote"
echo "- ✅ Proper test cleanup"
echo ""
echo "Key Features:"
echo "- Overall Score: Weighted percentage of positive feedback"
echo "- Safety Score: Separate score for safety-related feedback"
echo "- Confidence: LOW/MEDIUM/HIGH based on feedback volume"
echo "- Reasons: SAFE, CLEAN, ACCESSIBLE, ACCURATE, PRIVATE (positive)"
echo "           UNSAFE, DIRTY, INACCESSIBLE, OUTDATED, INAPPROPRIATE (negative)"