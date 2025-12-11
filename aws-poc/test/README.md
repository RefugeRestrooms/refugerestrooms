# Test Suite for REFUGE Restrooms AWS POC

## Overview

This directory contains comprehensive test scripts for validating the AWS serverless implementation of REFUGE Restrooms functionality.

## Test Scripts

### Core Functionality Tests

#### `test-restrooms.sh`
Tests basic CRUD operations for restrooms:
- Create restroom
- Get restroom by ID
- Update restroom
- Delete restroom
- List restrooms with pagination

#### `test-search.sh`
Tests search functionality:
- Text search across restroom fields
- Geospatial search by location
- Combined text + location search
- Search with filters (accessible, unisex, etc.)

#### `test-geospatial.sh`
Tests location-based features:
- Distance calculation
- Radius-based filtering
- Geocoding integration
- Sorting by distance

#### `test-pagination.sh`
Tests pagination across all list operations:
- Token-based pagination
- Limit handling
- Large dataset pagination
- Edge cases

### Security & Quality Tests

#### `test-spam-protection.sh`
Tests spam protection mechanisms:
- Legitimate content (should pass)
- Spam keywords (should be flagged/rejected)
- URLs in inappropriate fields
- Excessive content length
- Rate limiting (5 submissions/hour per IP)

**⚠️ Cleanup Note:** This test creates multiple restrooms that may need manual cleanup.

#### `test-feedback-system.sh`
Tests the enhanced feedback system:
- Positive feedback with reason categories
- Negative feedback with reason categories
- Simple thumbs up/down
- Input validation
- Rate limiting (3 feedback/restroom/day per IP)
- Score calculation and updates

**✅ Cleanup:** This test automatically cleans up the test restroom it creates.

### Utility Scripts

### Utility Scripts (in `../scripts/`)

#### `cleanup-test-data.sh`
Interactive cleanup script for removing test data:
- Identifies test restrooms by name patterns
- Confirms before deletion
- Provides cleanup status
- Handles bulk cleanup operations

#### `validate-tests.sh`
Validates test compliance with cleanup standards:
- Checks for required cleanup patterns
- Ensures all tests follow standards
- Provides remediation guidance

#### `local-test.js`
Node.js script for local testing without GraphQL:
- Direct Lambda function testing
- Mocked event data
- Useful for development and debugging

## Usage

### Prerequisites

1. **Deployed AWS Infrastructure**
   ```bash
   cd aws-poc/cdk
   cdk deploy
   ```

2. **Environment Variables**
   ```bash
   export GRAPHQL_ENDPOINT="https://your-appsync-endpoint/graphql"
   export API_KEY="your-api-key"
   ```

### Running Tests

#### Individual Test Scripts
```bash
cd aws-poc/test

# Basic functionality
./test-restrooms.sh $GRAPHQL_ENDPOINT $API_KEY

# Search capabilities
./test-search.sh $GRAPHQL_ENDPOINT $API_KEY
./test-geospatial.sh $GRAPHQL_ENDPOINT $API_KEY

# Security features
./test-spam-protection.sh $GRAPHQL_ENDPOINT $API_KEY
./test-feedback-system.sh $GRAPHQL_ENDPOINT $API_KEY

# Cleanup (if needed)
../scripts/cleanup-test-data.sh $GRAPHQL_ENDPOINT $API_KEY
```

#### Full Test Suite
```bash
# Run all tests in sequence
for test in test-*.sh; do
    echo "Running $test..."
    ./$test $GRAPHQL_ENDPOINT $API_KEY
    echo "Completed $test"
    echo "---"
done
```

## Test Data Management

### Automatic Cleanup

**Rate Limiting Data:**
- TTL: 7 days (automatic cleanup)
- Table: `refuge-rate-limits-{env}`

**Feedback Data (Non-Production):**
- TTL: 90 days (automatic cleanup)
- Table: `refuge-feedback-{env}`

**Spam Protection Data:**
- TTL: 24 hours (automatic cleanup)
- Stored in rate limiting table

### Manual Cleanup

**Test Restrooms:**
- Created by: `test-spam-protection.sh`, `test-feedback-system.sh`
- Cleanup: Use `cleanup-test-data.sh` or delete manually
- Identification: Look for names containing "Test", "Bitcoin", "Casino", etc.

**Feedback Records (Production):**
- No automatic cleanup in production
- Manual cleanup required if needed
- Query by `restroomId` in feedback table

### Test Environment Best Practices

1. **Use Separate Environment**
   ```bash
   # Deploy to test environment
   cdk deploy --context environment=test
   ```

2. **Regular Cleanup**
   ```bash
   # Run cleanup after test sessions
   ./cleanup-test-data.sh $ENDPOINT $API_KEY
   ```

3. **Monitor Test Data**
   ```bash
   # Check for test restrooms
   aws dynamodb scan \
     --table-name refuge-restrooms-test \
     --filter-expression "contains(#name, :test)" \
     --expression-attribute-names '{"#name": "name"}' \
     --expression-attribute-values '{":test": {"S": "Test"}}'
   ```

## Test Patterns and Conventions

### Test Restroom Naming
- Use "Test" prefix/suffix for easy identification
- Include test purpose: "Test Feedback Restroom", "Rate Test Restroom 1"
- Avoid realistic names that could be confused with real data

### Error Handling
- Tests should handle API errors gracefully
- Provide clear success/failure indicators (✅/❌)
- Include response details for debugging

### Rate Limiting Awareness
- Tests may trigger rate limits (this is expected)
- Include delays between requests when testing rate limits
- Document expected rate limit behavior

### Data Validation
- Verify response structure and required fields
- Check score calculations and updates
- Validate error messages and status codes

## Troubleshooting

### Common Issues

**"Too many submissions" errors:**
- Expected during rate limiting tests
- Wait for rate limit window to reset (1 hour for spam protection, 24 hours for feedback)
- Use different IP or test environment

**Test restrooms not found:**
- Check if previous tests failed to create restrooms
- Verify API endpoint and key are correct
- Check CloudWatch logs for Lambda errors

**Cleanup script not finding test data:**
- Test restrooms may have been created with different names
- Check DynamoDB table directly
- Use AWS console to identify and delete manually

### Debugging

**View Lambda Logs:**
```bash
aws logs tail /aws/lambda/refuge-create-restroom-dev --follow
aws logs tail /aws/lambda/refuge-submit-feedback-dev --follow
```

**Check DynamoDB Tables:**
```bash
aws dynamodb scan --table-name refuge-restrooms-dev --max-items 10
aws dynamodb scan --table-name refuge-feedback-dev --max-items 10
```

**Validate GraphQL Schema:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"query": "query { __schema { types { name } } }"}' \
  $GRAPHQL_ENDPOINT
```

## Contributing

### Mandatory Test Standards

**🚨 CRITICAL: All tests MUST clean up after themselves from the start**

When adding new tests, you MUST:

1. **Use the test template:** Start with `test-template.sh` as your base
2. **Track all created resources:** Use arrays to track restroom IDs, feedback, etc.
3. **Implement cleanup function:** Use `trap cleanup EXIT` to ensure cleanup runs
4. **Test cleanup works:** Verify cleanup runs on success, failure, and interruption
5. **Follow naming convention:** `test-{feature}.sh`
6. **Add to this README:** Document the test purpose and what it cleans up

### Test Template Usage

```bash
# Copy the template for new tests
cp test-template.sh test-my-feature.sh

# Customize the template:
# 1. Update feature name and description
# 2. Replace example tests with your test logic
# 3. Add any additional cleanup (feedback, etc.)
# 4. Test that cleanup works properly
```

### Cleanup Requirements

**Automatic Cleanup (Required):**
- ✅ All created restrooms MUST be deleted
- ✅ Use `trap cleanup EXIT` for reliability
- ✅ Handle cleanup failures gracefully
- ✅ Provide clear cleanup status messages

**Additional Resources:**
- Feedback records: Auto-cleanup via TTL (non-prod) or manual deletion
- Rate limit records: Auto-cleanup via 7-day TTL
- Spam protection records: Auto-cleanup via 24-hour TTL

### Output Standards

- ✅ for success, ❌ for failure, ⚠️ for warnings
- 🧪 for test start, 🧹 for cleanup, 🏁 for completion
- Clear resource IDs in output for debugging
- Consistent error handling across all tests

## Security Considerations

- **API Keys:** Never commit API keys to version control
- **Test Data:** Ensure test data doesn't contain sensitive information
- **Rate Limits:** Respect rate limits to avoid impacting other users
- **Cleanup:** Always clean up test data to avoid accumulation