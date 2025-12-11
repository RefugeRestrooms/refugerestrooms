# List Restrooms Feature

## Overview

The list restrooms feature provides paginated access to all restrooms in the database with optional filtering capabilities.

## Implementation

### Lambda Function
- **Location**: `lambda/listRestrooms/index.js`
- **Features**:
  - Cursor-based pagination (DynamoDB native)
  - Default limit: 25 items per page
  - Optional filters: accessible, unisex, changingTable
  - Base64-encoded pagination tokens
  - Efficient DynamoDB scan with filters

### GraphQL Schema
- **Query**: `listRestrooms(limit: Int, nextToken: String, accessible: Boolean, unisex: Boolean, changingTable: Boolean): RestroomConnection`
- **Return Type**: `RestroomConnection`
  - `items: [Restroom!]!` - Array of restroom objects
  - `nextToken: String` - Token for next page (null if last page)
  - `count: Int!` - Number of items in current page

### CDK Infrastructure
- Lambda function configured in `cdk/lib/refuge-restrooms-stack.ts`
- Permissions: DynamoDB read access
- Resolver connected to AppSync API

## Usage

### Basic List Query

```graphql
query ListRestrooms {
  listRestrooms(limit: 25) {
    items {
      id
      name
      street
      city
      state
      accessible
      unisex
      changingTable
    }
    nextToken
    count
  }
}
```

### Pagination

```graphql
query ListRestroomsNextPage($nextToken: String!) {
  listRestrooms(limit: 25, nextToken: $nextToken) {
    items {
      id
      name
      city
    }
    nextToken
    count
  }
}
```

**Variables:**
```json
{
  "nextToken": "eyJpZCI6InJlc3Ryb29tLTE3NjQ4NzU0Njg5MTgtZ2puaTVpamY4In0="
}
```

### Filter by Accessible

```graphql
query AccessibleRestrooms {
  listRestrooms(accessible: true, limit: 25) {
    items {
      id
      name
      accessible
    }
    count
  }
}
```

### Filter by Unisex

```graphql
query UnisexRestrooms {
  listRestrooms(unisex: true, limit: 25) {
    items {
      id
      name
      unisex
    }
    count
  }
}
```

### Filter by Changing Table

```graphql
query ChangingTableRestrooms {
  listRestrooms(changingTable: true, limit: 25) {
    items {
      id
      name
      changingTable
    }
    count
  }
}
```

### Combined Filters

```graphql
query FilteredRestrooms {
  listRestrooms(
    accessible: true
    unisex: true
    limit: 25
  ) {
    items {
      id
      name
      accessible
      unisex
    }
    count
  }
}
```

## Testing

### Dedicated Pagination Test

Run the pagination test script:

```bash
cd aws-poc/test
./test-pagination.sh <API_ENDPOINT> <API_KEY>
```

The test script:
1. Creates 5 sample restrooms with different attributes
2. Tests basic listing with pagination (limit 3)
3. Tests pagination token (second page)
4. Tests filtering by accessible
5. Tests filtering by unisex
6. Tests filtering by changing table
7. Cleans up created restrooms

### Expected Output

```
==========================================
REFUGE Restrooms - Pagination Test
==========================================

Setup: Creating sample restrooms...
  ✓ Created: Accessible Cafe
  ✓ Created: Unisex Library
  ✓ Created: Family Restaurant
  ✓ Created: Downtown Mall
  ✓ Created: City Park

Test 1: List restrooms (first page, limit 3)...
✓ Test 1 PASSED: Retrieved 3 restrooms
✓ Pagination token present

Test 2: List restrooms (second page)...
✓ Test 2 PASSED: Retrieved 3 restrooms on second page

Test 3: Filter by accessible=true...
✓ Test 3 PASSED: Found 3 accessible restrooms
✓ Filter verification passed

Test 4: Filter by unisex=true...
✓ Test 4 PASSED: Found 2 unisex restrooms
✓ Filter verification passed

Test 5: Filter by changingTable=true...
✓ Test 5 PASSED: Found 2 restrooms with changing tables
✓ Filter verification passed

Pagination test PASSED! 🎉
```

## Pagination Strategy

### Cursor-Based Pagination

We use DynamoDB's native pagination with `LastEvaluatedKey`:

**Advantages:**
- Efficient for DynamoDB (no offset scanning)
- Consistent results even with concurrent writes
- No performance degradation with deep pagination
- Native DynamoDB support

**How it works:**
1. Client requests first page (no token)
2. Lambda scans DynamoDB with limit
3. DynamoDB returns items + LastEvaluatedKey
4. Lambda encodes LastEvaluatedKey as base64 token
5. Client uses token for next page
6. Repeat until no token returned (last page)

### Token Format

Tokens are base64-encoded JSON containing DynamoDB's LastEvaluatedKey:

```javascript
// Original DynamoDB key
{ "id": "restroom-1764875468918-gjni5ijf8" }

// Base64 encoded
"eyJpZCI6InJlc3Ryb29tLTE3NjQ4NzU0Njg5MTgtZ2puaTVpamY4In0="
```

## Performance Considerations

### DynamoDB Scan
- **Current**: Full table scan with filters
- **Cost**: Reads all items, filters in Lambda
- **Suitable for**: Small to medium datasets (< 100k items)

### Future Optimizations

When dataset grows:

1. **Use GSI for common queries**
   - CreatedAtIndex for date-ordered listing
   - CityIndex for location-based queries

2. **Add DynamoDB Streams + OpenSearch**
   - Full-text search capabilities
   - Complex filtering
   - Aggregations and analytics

3. **Add Caching**
   - AppSync caching for popular queries
   - ElastiCache/DAX for hot data
   - CloudFront for API responses

## Limitations

### Current Implementation
- Scan operation (reads entire table)
- Filters applied after scan (not optimal)
- No sorting options (returns in scan order)
- No full-text search

### Planned Improvements
- Query operations using GSIs
- Sort by created_at, updated_at, distance
- Full-text search integration
- Geospatial queries

## API Compatibility

### Rails API Comparison

**Rails Endpoint:**
```
GET /api/v1/restrooms?page=1&per_page=25&ada=true&unisex=true
```

**GraphQL Equivalent:**
```graphql
query {
  listRestrooms(limit: 25, accessible: true, unisex: true) {
    items { ... }
    nextToken
  }
}
```

**Key Differences:**
- Cursor-based vs offset-based pagination
- GraphQL vs REST
- `accessible` vs `ada` parameter naming
- Token vs page number

## Next Steps

1. Add sorting options (created_at, updated_at)
2. Implement geospatial search (by_location)
3. Add full-text search (search query)
4. Optimize with GSI queries
5. Add caching layer
6. Implement date-based filtering
