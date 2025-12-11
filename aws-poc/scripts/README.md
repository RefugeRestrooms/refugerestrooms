# Utility Scripts

This directory contains utility scripts for managing and maintaining the REFUGE Restrooms AWS POC.

## cleanup-test-data.sh

Interactive script for cleaning up test data created by test scripts.

### Usage
```bash
./cleanup-test-data.sh <GRAPHQL_ENDPOINT> <API_KEY>
```

### Features
- **Pattern matching**: Identifies test restrooms by common naming patterns
- **Interactive confirmation**: Asks before deleting each restroom
- **Bulk cleanup**: Handles multiple test restrooms efficiently
- **Safe operation**: Only targets obvious test data

### Test Patterns Detected
- Names containing "Test", "Bitcoin", "Casino", "https://"
- Rate limiting test restrooms
- Spam protection test restrooms
- Feedback system test restrooms

## validate-tests.sh

Validates that all test scripts follow mandatory cleanup standards.

### Usage
```bash
./validate-tests.sh
```

### Validation Checks
- ✅ Resource tracking arrays (CREATED_RESTROOMS, CREATED_IDS)
- ✅ Cleanup function implementation
- ✅ Exit trap registration (trap cleanup EXIT)
- ✅ DeleteRestroom mutation for cleanup

### Exit Codes
- `0`: All tests pass compliance checks
- `1`: One or more tests fail compliance

## cleanup-restrooms.sh

Safely delete all restrooms from development or staging environments.

### Safety Features

**🔒 Production Protection:**
- Script will ONLY work with `dev` or `staging` environments
- Attempting to use `prod` or `production` will fail with an error
- Hardcoded environment validation prevents accidental production deletion

**✅ Confirmation Required:**
- Displays count of items to be deleted
- Requires typing "yes" to confirm
- Can be cancelled at any time

### Usage

```bash
cd aws-poc/scripts
./cleanup-restrooms.sh <environment>
```

### Examples

**Clean up development environment:**
```bash
./cleanup-restrooms.sh dev
```

**Clean up staging environment:**
```bash
./cleanup-restrooms.sh staging
```

**Attempting production (will fail):**
```bash
./cleanup-restrooms.sh prod
# ERROR: This script can ONLY be used with 'dev' or 'staging' environments
```

### What It Does

1. **Validates environment** - Only allows `dev` or `staging`
2. **Verifies table exists** - Checks that the DynamoDB table exists
3. **Counts items** - Shows how many restrooms will be deleted
4. **Requires confirmation** - Must type "yes" to proceed
5. **Deletes all items** - Scans and deletes each restroom
6. **Shows progress** - Displays each deletion with counter
7. **Verifies completion** - Confirms table is empty

### Output Example

```
==========================================
REFUGE Restrooms - Cleanup Script
==========================================

Environment: dev
Table: refuge-restrooms-dev

Verifying table exists...
✓ Table found

Counting items in table...
Found 12 restroom(s) in refuge-restrooms-dev

WARNING: This will delete ALL 12 restroom(s) from the dev environment.

Are you sure you want to continue? (type 'yes' to confirm): yes

Starting deletion...

  Deleted: restroom-1764876541307-xnefaxfmn (1/12)
  Deleted: restroom-1764876542081-s26bo1938 (2/12)
  Deleted: restroom-1764876542807-tag1i9en0 (3/12)
  ...
  Deleted: restroom-1764876546672-op3utyt6m (12/12)

==========================================
Cleanup Complete!
==========================================

Deleted: 12 restroom(s)
Environment: dev
Table: refuge-restrooms-dev

✓ Table is now empty
```

### Requirements

- AWS CLI installed and configured
- `jq` installed (for JSON parsing)
- AWS credentials with DynamoDB permissions
- Access to the target environment's DynamoDB table

### Permissions Required

The script needs the following AWS IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:Scan",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/refuge-restrooms-dev",
        "arn:aws:dynamodb:us-east-1:*:table/refuge-restrooms-staging"
      ]
    }
  ]
}
```

### Error Handling

**Table not found:**
```
ERROR: Table 'refuge-restrooms-dev' not found in us-east-1
Please verify the environment name and AWS region.
```

**Invalid environment:**
```
ERROR: This script can ONLY be used with 'dev' or 'staging' environments
Provided environment: prod

This is a safety feature to prevent accidental deletion of production data.
```

**Cancelled by user:**
```
Are you sure you want to continue? (type 'yes' to confirm): no
Deletion cancelled.
```

### When to Use

**Good use cases:**
- Cleaning up after development testing
- Resetting staging environment
- Removing test data before demos
- Starting fresh with empty database

**Bad use cases:**
- ❌ Never use on production
- ❌ Don't use if you need to keep any data
- ❌ Not for selective deletion (deletes everything)

### Alternative: Selective Deletion

If you need to delete specific restrooms instead of all, use the GraphQL API:

```bash
# Delete a specific restroom by ID
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "query": "mutation { deleteRestroom(id: \"restroom-123\") { success message } }"
  }' \
  https://your-api-endpoint.amazonaws.com/graphql
```

### Troubleshooting

**jq not found:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

**AWS CLI not configured:**
```bash
aws configure
# Enter your AWS credentials
```

**Permission denied:**
```bash
chmod +x cleanup-restrooms.sh
```

### Safety Checklist

Before running this script:

- [ ] Verify you're targeting the correct environment (dev/staging)
- [ ] Confirm you want to delete ALL restrooms
- [ ] Ensure you have a backup if needed
- [ ] Check that no one else is using the environment
- [ ] Verify AWS CLI is configured with correct credentials

### Related Scripts

- `test-restrooms.sh` - End-to-end CRUD test
- `test-pagination.sh` - Pagination and filtering test

Both test scripts create and clean up their own data automatically.
