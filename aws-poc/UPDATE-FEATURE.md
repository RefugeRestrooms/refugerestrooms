# Update Restroom Feature

## Overview

The update restroom feature allows partial updates to existing restrooms with smart re-geocoding when address fields change.

## Implementation

### Lambda Function
- **Location**: `lambda/updateRestroom/index.js`
- **Features**:
  - Partial updates (only specified fields are updated)
  - Smart re-geocoding when address fields change
  - Automatic `updatedAt` timestamp
  - Validates restroom exists before updating

### GraphQL Schema
- **Mutation**: `updateRestroom(id: ID!, input: UpdateRestroomInput!): Restroom`
- **Input Type**: `UpdateRestroomInput` - all fields optional for partial updates

### CDK Infrastructure
- Lambda function configured in `cdk/lib/refuge-restrooms-stack.ts`
- Permissions: DynamoDB read/write, AWS Location Service access
- Resolver connected to AppSync API

## Testing

The end-to-end test script (`test/test-restrooms.sh`) now includes:

1. **Create** - Creates a new restroom
2. **Get** - Retrieves the restroom by ID
3. **Update** - Updates name, street, accessible flag, and comment
4. **Delete** - Removes the restroom
5. **Verify** - Confirms deletion

### Running Tests

```bash
cd aws-poc/test
./test-restrooms.sh <API_ENDPOINT> <API_KEY>
```

## Example Update Mutation

```graphql
mutation UpdateRestroom($id: ID!, $input: UpdateRestroomInput!) {
  updateRestroom(id: $id, input: $input) {
    id
    name
    street
    city
    state
    country
    latitude
    longitude
    accessible
    unisex
    changingTable
    comment
    directions
    updatedAt
  }
}
```

### Variables

```json
{
  "id": "restroom-id-here",
  "input": {
    "name": "Updated Name",
    "street": "New Street Address",
    "accessible": false,
    "comment": "Updated comment"
  }
}
```

## Smart Re-Geocoding

When any address field changes (street, city, state, country), the Lambda function:
1. Merges new values with existing values
2. Calls AWS Location Service to geocode the complete address
3. Updates latitude/longitude if geocoding succeeds
4. Preserves existing coordinates if geocoding fails

This ensures coordinates stay accurate when addresses change.
