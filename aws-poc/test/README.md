# Testing Guide

Complete guide for testing the REFUGE Restrooms GraphQL API.

## Quick Start

After deploying with CDK, you'll have these outputs:
- **GraphQL Endpoint**: `https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql`
- **API Key**: `da2-xxxxxxxxxxxxxxxxxxxxxxxxxx`

## Test Files Overview

| File | Type | Purpose |
|------|------|---------|
| `test-restrooms.sh` | End-to-End | Complete CRUD test (create, get, delete, verify) |
| `local-test.js` | Local | Validate Lambda logic without AWS |

## End-to-End Test (Recommended)

Tests the complete restroom lifecycle:

```bash
./test-restrooms.sh \
  "https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql" \
  "da2-xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**What it does:**
1. ✅ **Create** - Creates a test restroom with geocoding
2. ✅ **Get** - Retrieves it back by ID and verifies data
3. ✅ **Delete** - Deletes the restroom
4. ✅ **Verify** - Confirms it was deleted

**Expected output:**
```
==========================================
REFUGE Restrooms - End-to-End Test
==========================================

Test 1: Creating a restroom...
✓ Test 1 PASSED: Restroom created with ID: restroom-1764788094730-abc123
✓ Geocoding successful: 37.791501, -122.398676

Test 2: Retrieving the restroom...
✓ Test 2 PASSED: Restroom retrieved successfully
✓ Data verification passed

Test 3: Deleting the restroom...
✓ Test 3 PASSED: Restroom deleted successfully

Test 4: Verifying deletion...
✓ Test 4 PASSED: Restroom confirmed deleted (not found)

==========================================
All Tests Completed!
==========================================

Summary:
  ✓ Create restroom
  ✓ Get restroom
  ✓ Delete restroom
  ✓ Verify deletion

End-to-end test PASSED! 🎉
```

## Local Testing (No AWS Required)

Validates Lambda business logic without deploying:

```bash
node local-test.js
```

**What it tests:**
- Input validation (required fields)
- Restroom object creation
- Default values
- Error handling

**Expected output:**
```
✓ Validation passed
✓ Geocoded to: 37.7749, -122.4194
✓ Restroom object created
✓ Correctly caught error: Name is required
```

## Manual Testing Options

### Option 1: Using the Test Scripts

### Option 2: Using AWS AppSync Console

1. Go to AWS AppSync Console
2. Select your API: `refuge-restrooms-api-dev`
3. Click "Queries" in the left sidebar
4. Copy the mutation from `test-mutation.graphql`
5. Click "Run" to execute

### Option 3: Using curl

### Create a restroom:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "query": "mutation CreateRestroom($input: CreateRestroomInput!) { createRestroom(input: $input) { id name street city state latitude longitude accessible unisex approved createdAt } }",
    "variables": {
      "input": {
        "name": "Example Cafe",
        "street": "789 Valencia Street",
        "city": "San Francisco",
        "state": "CA",
        "country": "US",
        "accessible": true,
        "unisex": true,
        "changingTable": false
      }
    }
  }' \
  YOUR_API_ENDPOINT
```

### Get a restroom:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "query": "query GetRestroom($id: ID!) { getRestroom(id: $id) { id name street city state latitude longitude } }",
    "variables": {
      "id": "restroom-1234567890-abc123"
    }
  }' \
  YOUR_API_ENDPOINT
```

### Option 4: Using Postman

1. Import the GraphQL schema from `../schema/schema.graphql`
2. Set up a POST request to your AppSync endpoint
3. Add header: `x-api-key: YOUR_API_KEY`
4. Use the queries from `test-mutation.graphql` and `test-query.graphql`

## Expected Results

### Successful Creation Response:
```json
{
  "data": {
    "createRestroom": {
      "id": "restroom-1701234567890-xyz789",
      "name": "Example Cafe",
      "street": "789 Valencia Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "latitude": 37.7599,
      "longitude": -122.4214,
      "accessible": true,
      "unisex": true,
      "changingTable": false,
      "approved": false,
      "createdAt": "2024-12-02T10:30:00.000Z"
    }
  }
}
```

### Successful Get Response:
```json
{
  "data": {
    "getRestroom": {
      "id": "restroom-1701234567890-xyz789",
      "name": "Example Cafe",
      "street": "789 Valencia Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "latitude": 37.7599,
      "longitude": -122.4214,
      "accessible": true,
      "unisex": true,
      "changingTable": false,
      "comment": "",
      "directions": "",
      "upvote": 0,
      "downvote": 0,
      "approved": false,
      "createdAt": "2024-12-02T10:30:00.000Z",
      "updatedAt": "2024-12-02T10:30:00.000Z"
    }
  }
}
```

## Validation Tests

The Lambda function validates:
- ✓ Name is required and not empty
- ✓ Street is required and not empty
- ✓ City is required and not empty
- ✓ State is required and not empty

Try creating a restroom without required fields to test validation:
```graphql
mutation TestValidation {
  createRestroom(input: {
    name: ""
    street: "123 Main St"
    city: "San Francisco"
    state: "CA"
    country: "US"
    accessible: false
    unisex: false
    changingTable: false
  }) {
    id
  }
}
```

Expected error:
```json
{
  "errors": [{
    "message": "Failed to create restroom: Validation failed: Name is required"
  }]
}
```

## Checking DynamoDB

View created restrooms directly in DynamoDB:
```bash
aws dynamodb scan \
  --table-name refuge-restrooms-dev \
  --max-items 10
```

## Monitoring

Check Lambda logs:
```bash
# Create function logs
aws logs tail /aws/lambda/refuge-create-restroom-dev --follow

# Get function logs
aws logs tail /aws/lambda/refuge-get-restroom-dev --follow
```

## Troubleshooting

### "Unauthorized" error
- Check that your API key is correct
- Ensure the API key hasn't expired

### "Internal server error"
- Check Lambda logs for detailed error messages
- Verify Lambda has permissions to access DynamoDB

### Geocoding returns null coordinates

Check Lambda logs:
```bash
aws logs tail /aws/lambda/refuge-create-restroom-dev --follow --profile personal
```

Verify Place Index exists:
```bash
aws location describe-place-index \
  --index-name refuge-restrooms-places-dev \
  --profile personal
```

### Test script fails with "command not found"

Make script executable:
```bash
chmod +x test-restrooms.sh
```

## Next Steps

After testing:
- ✅ Verify geocoding works (latitude/longitude populated)
- ✅ Check CloudWatch logs for errors
- ✅ View data in DynamoDB
- ✅ Test error scenarios (invalid data, missing fields)
- 📋 Add more test cases
- 📋 Set up automated CI/CD testing
- 📋 Add load testing

See `../NEXT-STEPS.md` for adding more features!


## Complete Test Workflow

```bash
# 1. Run local tests (no AWS needed)
node local-test.js

# 2. Deploy to AWS
cd ../cdk
cdk deploy --profile personal

# 3. Copy the outputs
# GraphQLApiEndpoint = https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
# GraphQLApiKey = da2-xxxxxxxxxxxxxxxxxxxxxxxxxx

# 4. Run end-to-end test
cd ../test
./test-restrooms.sh \
  "https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql" \
  "da2-xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Viewing Test Data

### DynamoDB Console

1. Go to DynamoDB Console
2. Select table: `refuge-restrooms-dev`
3. Click "Explore table items"

### AWS CLI

```bash
aws dynamodb scan \
  --table-name refuge-restrooms-dev \
  --profile personal
```

### Get specific restroom

```bash
aws dynamodb get-item \
  --table-name refuge-restrooms-dev \
  --key '{"id": {"S": "restroom-1234567890-abc123"}}' \
  --profile personal
```
