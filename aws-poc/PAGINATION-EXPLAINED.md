# Pagination Explained

## How Cursor-Based Pagination Works

### The Concept

Unlike traditional offset-based pagination (page 1, page 2, page 3), cursor-based pagination uses a "bookmark" to remember where you left off.

**Analogy:** It's like reading a book with a bookmark vs. counting pages.
- **Offset-based**: "Give me page 5" (you have to skip pages 1-4 every time)
- **Cursor-based**: "Give me the next 25 items after this bookmark" (you jump directly to where you left off)

### Our Implementation

#### 1. First Request (No Token)
```graphql
query {
  listRestrooms(limit: 25) {
    items { id name }
    nextToken
    count
  }
}
```

**What happens:**
1. Lambda queries DynamoDB: "Give me 25 items"
2. DynamoDB returns 25 items + a `LastEvaluatedKey` (the bookmark)
3. Lambda encodes the `LastEvaluatedKey` as base64 → `nextToken`
4. Client receives: 25 items + nextToken

**Response:**
```json
{
  "items": [/* 25 restrooms */],
  "nextToken": "eyJpZCI6InJlc3Ryb29tLTEyMyJ9",
  "count": 25
}
```

#### 2. Second Request (With Token)
```graphql
query {
  listRestrooms(limit: 25, nextToken: "eyJpZCI6InJlc3Ryb29tLTEyMyJ9") {
    items { id name }
    nextToken
    count
  }
}
```

**What happens:**
1. Lambda decodes the token → gets the bookmark (last item's key)
2. Lambda queries DynamoDB: "Give me 25 items starting AFTER this bookmark"
3. DynamoDB returns next 25 items + new `LastEvaluatedKey`
4. Lambda encodes new bookmark → new `nextToken`
5. Client receives: next 25 items + new nextToken

#### 3. Last Page
When there are no more results, `nextToken` is `null`:

```json
{
  "items": [/* 15 restrooms */],
  "nextToken": null,
  "count": 15
}
```

This tells the client: "You've reached the end, no more pages."

## The Token Format

### What's Inside a Token?

A token is a base64-encoded JSON object containing DynamoDB's key:

```javascript
// Original DynamoDB LastEvaluatedKey
{
  "id": "restroom-1764876355766-he0gb6thu"
}

// Base64 encoded
"eyJpZCI6InJlc3Ryb29tLTE3NjQ4NzYzNTU3NjYtaGUwZ2I2dGh1In0="
```

### Why Base64?

1. **URL-safe**: Can be passed in GraphQL variables without escaping
2. **Opaque**: Clients don't need to understand the internal structure
3. **Compact**: Smaller than raw JSON in URLs

## Test Strategy

### Why We Use limit=3 in Tests

**Problem:** Default limit is 25, but we only create 10 test restrooms.
- With limit=25: All 10 items fit on one page → no pagination to test!

**Solution:** Override limit to 3 in tests.
- With limit=3: 10 items require 4 pages → pagination is tested!

### Test Flow

```
Create 10 restrooms
    ↓
Request page 1 (limit=3)
    → Get 3 items + token
    ✓ Verify: count=3, token exists
    ↓
Request page 2 (limit=3, token from page 1)
    → Get 3 items + token
    ✓ Verify: count=3, token exists
    ↓
Request page 3 (limit=3, token from page 2)
    → Get 3 items + token
    ✓ Verify: count=3, token exists
    ↓
Request page 4 (limit=3, token from page 3)
    → Get 1 item + null token
    ✓ Verify: count=1, no token (last page)
```

### What We're Testing

1. **Limit works**: Each page returns exactly 3 items (or fewer on last page)
2. **Token generation**: nextToken is present when more results exist
3. **Token consumption**: Can use token to fetch next page
4. **End detection**: nextToken is null on last page
5. **Filters work**: Filtering doesn't break pagination

## Comparison with Rails API

### Rails (Offset-Based)
```
GET /api/v1/restrooms?page=2&per_page=25
```

**How it works:**
- Skip first 25 items (page 1)
- Return next 25 items (page 2)
- **Problem**: Expensive for large datasets (must scan/skip all previous items)

### Our API (Cursor-Based)
```graphql
query {
  listRestrooms(limit: 25, nextToken: "...")
}
```

**How it works:**
- Start from bookmark (last item from previous page)
- Return next 25 items
- **Benefit**: Efficient for large datasets (direct jump to position)

## Advantages of Cursor-Based Pagination

### 1. Performance
- **No offset scanning**: DynamoDB doesn't need to skip items
- **Consistent speed**: Page 1 and page 1000 take the same time
- **Lower cost**: Fewer read units consumed

### 2. Consistency
- **No duplicates**: Items won't appear twice if data changes
- **No missing items**: Items won't be skipped if data changes
- **Stable results**: Each token represents a fixed point in time

### 3. DynamoDB Native
- Uses DynamoDB's built-in pagination
- No custom logic needed
- Scales automatically

## Disadvantages

### 1. No Random Access
- Can't jump to "page 5" directly
- Must fetch pages sequentially: 1 → 2 → 3 → 4 → 5

### 2. No Page Numbers
- Can't show "Page 5 of 20"
- Can only show "Next" / "Previous"
- Users can't bookmark specific pages

### 3. Token Expiration
- Tokens can become invalid if data structure changes
- Need error handling for invalid tokens

## Best Practices

### For Clients

1. **Store tokens**: Save nextToken to fetch next page
2. **Handle null**: Check if nextToken is null (last page)
3. **Error handling**: Retry with no token if token is invalid
4. **Don't decode**: Treat tokens as opaque strings

### For Our API

1. **Validate tokens**: Check token format before decoding
2. **Set reasonable limits**: Default 25, max 100
3. **Return count**: Help clients know how many items on current page
4. **Consistent ordering**: Ensure predictable pagination order

## Example Client Implementation

```javascript
async function fetchAllRestrooms() {
  const allRestrooms = [];
  let nextToken = null;
  
  do {
    const response = await graphql(`
      query ListRestrooms($nextToken: String) {
        listRestrooms(limit: 25, nextToken: $nextToken) {
          items { id name }
          nextToken
        }
      }
    `, { nextToken });
    
    allRestrooms.push(...response.data.listRestrooms.items);
    nextToken = response.data.listRestrooms.nextToken;
    
  } while (nextToken !== null);
  
  return allRestrooms;
}
```

## Future Enhancements

### 1. Bidirectional Pagination
Add `previousToken` to go backwards:
```graphql
type RestroomConnection {
  items: [Restroom!]!
  nextToken: String
  previousToken: String  # New!
  count: Int!
}
```

### 2. Total Count
Add total count (expensive, but useful):
```graphql
type RestroomConnection {
  items: [Restroom!]!
  nextToken: String
  count: Int!
  totalCount: Int  # New! (requires separate count query)
}
```

### 3. Cursor Info
Provide more context about position:
```graphql
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type RestroomConnection {
  items: [Restroom!]!
  pageInfo: PageInfo!
  count: Int!
}
```

This follows the [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm).
