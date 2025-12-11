# Delete Restroom Feature

## What Was Added

✅ **GraphQL Mutation**: `deleteRestroom(id: ID!)`
✅ **Lambda Function**: `refuge-delete-restroom-dev`
✅ **Response Type**: Returns success status, message, and ID
✅ **Safety Check**: Verifies restroom exists before deleting
✅ **Test Scripts**: Automated testing for delete functionality

## Deploy the Feature

```bash
cd aws-poc/cdk
npm run build
cdk deploy --profile personal
```

CDK will show:
- ✅ Create new Lambda function
- ✅ Update GraphQL schema
- ✅ Add new resolver
- ✅ Update IAM permissions

Type `y` to confirm.

## GraphQL Mutation

```graphql
mutation DeleteRestroom {
  deleteRestroom(id: "restroom-1234567890-abc123") {
    success
    message
    id
  }
}
```

### Response Types

**Success:**
```json
{
  "data": {
    "deleteRestroom": {
      "success": true,
      "message": "Restroom successfully deleted: restroom-123-abc",
      "id": "restroom-123-abc"
    }
  }
}
```

**Not Found:**
```json
{
  "data": {
    "deleteRestroom": {
      "success": false,
      "message": "Restroom not found: restroom-123-abc",
      "id": null
    }
  }
}
```

## Testing

### Step 1: Create a Test Restroom

```bash
cd aws-poc/test
./test-api.sh \
  "https://xq4dmzbpijdmzc32xakiowaoki.appsync-api.us-east-1.amazonaws.com/graphql" \
  "da2-5uqzwpsr3ffmposqnkug3td3q4"
```

Copy the `id` from the response (e.g., `restroom-1764788094730-p5jz1jav7`)

### Step 2: Delete the Restroom

```bash
./test-delete.sh \
  "https://xq4dmzbpijdmzc32xakiowaoki.appsync-api.us-east-1.amazonaws.com/graphql" \
  "da2-5uqzwpsr3ffmposqnkug3td3q4" \
  "restroom-1764788094730-p5jz1jav7"
```

The script will:
1. Delete the restroom
2. Verify it was deleted by trying to fetch it
3. Show success/failure status

### Step 3: Verify in DynamoDB

```bash
aws dynamodb scan \
  --table-name refuge-restrooms-dev \
  --profile personal
```

The deleted restroom should no longer appear.

## Using in AppSync Console

1. Go to AWS AppSync Console
2. Select `refuge-restrooms-api-dev`
3. Click "Queries"
4. Paste this mutation:

```graphql
mutation DeleteRestroom($id: ID!) {
  deleteRestroom(id: $id) {
    success
    message
    id
  }
}
```

5. Add variables:
```json
{
  "id": "restroom-1764788094730-p5jz1jav7"
}
```

6. Click "Run"

## Safety Features

✅ **Existence Check**: Verifies restroom exists before deleting
✅ **Conditional Delete**: Uses DynamoDB conditional expression
✅ **Error Handling**: Returns friendly error messages
✅ **Logging**: CloudWatch logs for debugging

## Lambda Function Details

**Function Name**: `refuge-delete-restroom-dev`

**Permissions**:
- Read from DynamoDB (to check existence)
- Delete from DynamoDB

**Logic**:
1. Validate ID is provided
2. Check if restroom exists (GetItem)
3. Delete restroom (DeleteItem with condition)
4. Return success/failure response

## Error Scenarios

### Restroom Not Found
```json
{
  "success": false,
  "message": "Restroom not found: restroom-123",
  "id": null
}
```

### Missing ID
```json
{
  "errors": [{
    "message": "Restroom ID is required"
  }]
}
```

### Permission Error
```json
{
  "errors": [{
    "message": "User is not authorized to perform: dynamodb:DeleteItem"
  }]
}
```

## Integration with Rails App

To integrate this with the existing Rails application:

### Option 1: Dual Delete
Keep Rails delete endpoint and add GraphQL as alternative:
```ruby
# Rails controller
def destroy
  @restroom.destroy
  # Also delete from DynamoDB via GraphQL
  GraphqlClient.delete_restroom(@restroom.id)
end
```

### Option 2: GraphQL Only
Migrate delete operations to GraphQL:
```javascript
// Frontend
const DELETE_RESTROOM = gql`
  mutation DeleteRestroom($id: ID!) {
    deleteRestroom(id: $id) {
      success
      message
    }
  }
`;
```

## Security Considerations

### Current Implementation
- ✅ API Key authentication
- ⚠️ Anyone with API key can delete

### Production Recommendations
1. **Add Cognito Authentication**:
   ```graphql
   type Mutation {
     deleteRestroom(id: ID!): DeleteRestroomResponse
       @aws_auth(cognito_groups: ["admin"])
   }
   ```

2. **Add Soft Delete**:
   Instead of deleting, mark as deleted:
   ```javascript
   // Update instead of delete
   await docClient.send(new UpdateCommand({
     TableName: TABLE_NAME,
     Key: { id },
     UpdateExpression: 'SET deleted = :true, deletedAt = :now',
     ExpressionAttributeValues: {
       ':true': true,
       ':now': new Date().toISOString()
     }
   }));
   ```

3. **Add Audit Trail**:
   Log who deleted what and when

## Monitoring

Check Lambda logs:
```bash
aws logs tail /aws/lambda/refuge-delete-restroom-dev --follow --profile personal
```

View CloudWatch metrics:
- Invocations
- Errors
- Duration
- Throttles

## Cost

Delete operations are very cheap:
- **Lambda**: $0.20 per 1M requests
- **DynamoDB**: $1.25 per 1M write requests
- **AppSync**: $4 per 1M mutations

For typical usage: < $0.01/month

## Next Steps

Now that you have Create, Read, and Delete, you might want to add:

1. **Update Mutation**: Modify existing restrooms
2. **List Query**: Get all restrooms with pagination
3. **Search Query**: Find restrooms by location or text
4. **Batch Delete**: Delete multiple restrooms at once

See `NEXT-STEPS.md` for more feature ideas!
