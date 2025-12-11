# Full-Text Search Feature

## Overview

The full-text search feature enables users to search for restrooms using natural language queries across multiple fields. This is essential for web interfaces and provides a user-friendly way to find specific restrooms by name, location, or description.

## Implementation

### GraphQL Schema Updates

**New Query Parameter:**
```graphql
type Query {
  listRestrooms(
    # Existing parameters
    limit: Int
    nextToken: String
    accessible: Boolean
    unisex: Boolean
    changingTable: Boolean
    lat: Float
    lng: Float
    radius: Int
    
    # New search parameter
    query: String       # Search query string
  ): RestroomConnection
}
```

**New Response Field:**
```graphql
type Restroom {
  # Existing fields...
  relevanceScore: Float   # Search relevance score (only in text search queries)
}
```

### Search Algorithm

**Searchable Fields with Weights:**
- `name` (weight: 3.0) - Highest priority
- `street` (weight: 2.0) - High priority  
- `city` (weight: 2.0) - High priority
- `state` (weight: 1.5) - Medium priority
- `comment` (weight: 1.0) - Standard priority
- `directions` (weight: 1.0) - Standard priority
- `country` (weight: 0.5) - Low priority

**Scoring System:**
- **Exact word match**: 2x weight bonus
- **Partial match**: 1x weight
- **Multi-term queries**: Score normalized by number of terms
- **Relevance score**: Calculated as `totalScore / searchTerms.length`

**Example Scoring:**
```javascript
// Query: "coffee shop"
// Item: { name: "Starbucks Coffee Shop", comment: "Great coffee" }

// Matches:
// - "coffee" in name (exact word): 3.0 * 2 = 6.0
// - "shop" in name (exact word): 3.0 * 2 = 6.0  
// - "coffee" in comment (exact word): 1.0 * 2 = 2.0

// Total score: 14.0
// Relevance score: 14.0 / 2 terms = 7.0
```

## Usage Examples

### Basic Text Search

Search for coffee shops:

```graphql
query SearchCoffee {
  listRestrooms(query: "coffee") {
    items {
      id
      name
      street
      city
      comment
      relevanceScore
    }
    count
  }
}
```

**Response:**
```json
{
  "data": {
    "listRestrooms": {
      "items": [
        {
          "id": "restroom-123",
          "name": "Starbucks Coffee Shop",
          "street": "100 Market St",
          "city": "San Francisco", 
          "comment": "Great coffee and clean restrooms",
          "relevanceScore": 7.5
        },
        {
          "id": "restroom-456",
          "name": "Local Cafe",
          "street": "200 Mission St", 
          "city": "San Francisco",
          "comment": "Small coffee place",
          "relevanceScore": 4.0
        }
      ],
      "count": 2
    }
  }
}
```

### Multi-Word Search

Search for shopping malls:

```graphql
query SearchMall {
  listRestrooms(query: "shopping mall") {
    items {
      name
      relevanceScore
    }
  }
}
```

### Search in Comments

Find restrooms with specific amenities:

```graphql
query SearchClean {
  listRestrooms(query: "clean accessible") {
    items {
      name
      comment
      accessible
      relevanceScore
    }
  }
}
```

### Combined Search + Filters

Search for accessible coffee shops:

```graphql
query AccessibleCoffeeShops {
  listRestrooms(
    query: "coffee"
    accessible: true
  ) {
    items {
      name
      accessible
      relevanceScore
    }
  }
}
```

### Combined Search + Geospatial

Find nearby coffee shops:

```graphql
query NearbyCoffeeShops {
  listRestrooms(
    query: "coffee"
    lat: 37.7749
    lng: -122.4194
    radius: 5000
  ) {
    items {
      name
      distance
      relevanceScore
    }
  }
}
```

**Note:** Combined queries sort by relevance first, then by distance for items with similar relevance scores.

## Search Features

### 1. Case-Insensitive Matching
```graphql
# These queries return the same results:
query { listRestrooms(query: "COFFEE") }
query { listRestrooms(query: "coffee") }
query { listRestrooms(query: "Coffee") }
```

### 2. Multi-Term Search
```graphql
# Finds items containing both "public" AND "library"
query { listRestrooms(query: "public library") }
```

### 3. Partial Word Matching
```graphql
# Matches "Starbucks", "Star", "bucks", etc.
query { listRestrooms(query: "star") }
```

### 4. Field-Weighted Scoring
- Matches in `name` field score higher than matches in `comment`
- Exact word boundaries score higher than partial matches
- Multiple field matches increase overall relevance

### 5. Empty Query Handling
```graphql
# Returns all restrooms (no filtering applied)
query { listRestrooms(query: "") }
```

## Testing

### Comprehensive Test Suite

Run the full-text search test:

```bash
cd aws-poc/test
./test-search.sh <API_ENDPOINT> <API_KEY>
```

**Test Coverage:**
1. **Single Word Search**: "coffee" → Starbucks Coffee Shop
2. **Name Field Search**: "library" → Downtown Public Library  
3. **Multi-Word Search**: "shopping mall" → Union Square Shopping Mall
4. **Comment Field Search**: "clean" → Items with "clean" in comments
5. **Combined Filters**: Search + accessibility filter
6. **Empty Query**: Returns all results
7. **No Matches**: Handles non-existent terms gracefully

**Test Data:**
- Starbucks Coffee Shop (name + comment matches)
- Downtown Public Library (name matches)
- Union Square Shopping Mall (name matches)
- Golden Gate Park Visitor Center (name + comment matches)
- Mission District Taco Shop (location matches)
- Financial District Office Building (location + comment matches)

### Expected Results

```
Test 1: Search 'coffee'
✓ Found 2 restrooms (Starbucks + others with coffee in comments)
✓ Starbucks has highest relevance score
✓ Results sorted by relevance (descending)

Test 2: Search 'library'  
✓ Found 1 restroom (Downtown Public Library)
✓ Exact name match has high relevance

Test 3: Search 'shopping mall'
✓ Found 1 restroom (Union Square Shopping Mall)
✓ Multi-word match works correctly

Test 4: Search 'clean'
✓ Found restrooms with 'clean' in comments
✓ Comment field search working

Test 5: Combined search + filter
✓ Found accessible restrooms matching search
✓ Both search and filter applied correctly

Test 6: Empty query
✓ Returns all restrooms (no filtering)

Test 7: No matches
✓ Returns empty results for non-existent terms
```

## Performance Considerations

### Current Implementation

**Approach**: Scan + Filter + Score + Sort in Lambda
- **Pros**: Simple, flexible, works with existing DynamoDB table
- **Cons**: Scans entire table, processes all items in memory
- **Suitable for**: Small to medium datasets (< 100k items)

**Performance Characteristics:**
- **Read Cost**: Full table scan (expensive for large datasets)
- **Latency**: ~300-800ms depending on table size and query complexity
- **Memory**: Loads all items into Lambda memory for processing
- **CPU**: Text processing and scoring for each item

### Optimization Strategies

#### 1. Amazon OpenSearch (Recommended Upgrade)

**Benefits:**
- Native full-text search with advanced features
- Sub-100ms query times
- Fuzzy matching and typo tolerance
- Search suggestions and autocomplete
- Combined text + geospatial queries
- Faceted search and aggregations

**Implementation:**
```javascript
// DynamoDB Streams → Lambda → OpenSearch
// Real-time indexing of restroom changes
```

#### 2. DynamoDB + ElastiCache

**Benefits:**
- Cache popular search queries
- Reduce DynamoDB reads for common searches
- Faster response times for repeated queries

**Implementation:**
```javascript
// Check cache first, fallback to DynamoDB scan
const cacheKey = `search:${query}:${filters}`;
let results = await cache.get(cacheKey);
if (!results) {
  results = await performDynamoDBSearch(query, filters);
  await cache.set(cacheKey, results, 300); // 5 min TTL
}
```

#### 3. Pre-computed Search Index

**Benefits:**
- Create searchable text field in DynamoDB
- Combine all searchable fields into single indexed field
- Use DynamoDB's native text filtering

**Implementation:**
```javascript
// During create/update, build search index
const searchText = [
  item.name,
  item.street, 
  item.city,
  item.state,
  item.comment,
  item.directions
].join(' ').toLowerCase();

// Store in DynamoDB
await docClient.put({
  TableName: TABLE_NAME,
  Item: {
    ...item,
    searchText: searchText
  }
});
```

#### 4. Hybrid Approach

**Benefits:**
- Use OpenSearch for complex queries
- Use DynamoDB for simple exact matches
- Route queries based on complexity

## API Compatibility

### Rails API Comparison

**Rails Endpoint:**
```
GET /api/v1/restrooms/search?query=coffee+shop
```

**GraphQL Equivalent:**
```graphql
query {
  listRestrooms(query: "coffee shop") {
    items { ... }
  }
}
```

**Key Differences:**
- **GraphQL vs REST**: Single endpoint vs dedicated search endpoint
- **Relevance Scoring**: GraphQL includes relevance scores
- **Combined Queries**: Can combine search with filters and geospatial
- **Pagination**: Cursor-based vs offset-based
- **Response Format**: Structured GraphQL response vs Rails JSON

### Migration Considerations

1. **Search Quality**: Ensure search results match or exceed Rails quality
2. **Performance**: Target sub-500ms response times
3. **Feature Parity**: Support all Rails search capabilities
4. **API Compatibility**: Consider GraphQL → REST adapter for existing clients

## Error Handling

### Input Validation

**Invalid Query Type:**
```json
{
  "errors": [
    {
      "message": "Search query must be a string",
      "path": ["listRestrooms"]
    }
  ]
}
```

### Edge Cases

**Empty Results**: Returns empty array with count: 0
**Special Characters**: Handled gracefully (no injection risk)
**Very Long Queries**: Truncated or rejected based on length limits
**Unicode Characters**: Supported in search terms

## Security Considerations

### Input Sanitization
- Query strings are treated as literal text (no code execution)
- No SQL injection risk (using DynamoDB DocumentClient)
- Length limits prevent abuse

### Performance Protection
- Query length limits (e.g., max 200 characters)
- Rate limiting via AppSync
- Timeout protection in Lambda

## Monitoring and Metrics

### Key Metrics to Track

**Performance:**
- Search query latency (p50, p95, p99)
- DynamoDB scan duration
- Lambda memory utilization
- Relevance scoring time

**Usage:**
- Popular search terms
- Search result click-through rates
- Empty result queries (for improvement)
- Query length distribution

**Quality:**
- Search result relevance (user feedback)
- Zero-result query rate
- Search abandonment rate

### CloudWatch Dashboards

Monitor search feature health:
- Search query volume and patterns
- Performance metrics and errors
- Popular search terms (for optimization)
- User engagement with search results

## Future Enhancements

### 1. Advanced Search Features

```graphql
query AdvancedSearch {
  listRestrooms(
    query: "coffee shop"
    # Future enhancements
    fuzzyMatch: true        # Typo tolerance
    searchFields: ["name", "comment"]  # Limit search scope
    minRelevance: 2.0       # Minimum relevance threshold
    highlightMatches: true  # Return highlighted text
  ) {
    items {
      name
      relevanceScore
      highlights {           # Future: highlighted matches
        field: "name"
        text: "<mark>Coffee</mark> Shop"
      }
    }
  }
}
```

### 2. Search Suggestions

```graphql
query SearchSuggestions {
  searchSuggestions(query: "coff") {
    suggestions: ["coffee", "coffee shop", "coffee house"]
    popularQueries: ["starbucks", "dunkin donuts"]
  }
}
```

### 3. Faceted Search

```graphql
query FacetedSearch {
  listRestrooms(query: "coffee") {
    items { ... }
    facets {
      accessible: { true: 15, false: 3 }
      changingTable: { true: 8, false: 10 }
      city: { "San Francisco": 12, "Oakland": 6 }
    }
  }
}
```

### 4. Search Analytics

```graphql
query SearchAnalytics {
  searchAnalytics(timeRange: "7d") {
    popularQueries: ["coffee", "mall", "library"]
    zeroResultQueries: ["xyz", "nonexistent"]
    averageResultCount: 4.2
  }
}
```

## Deployment

The full-text search feature is ready to deploy:

```bash
cd aws-poc/cdk
cdk deploy --profile personal
```

After deployment, test with:

```bash
cd aws-poc/test
./test-search.sh <API_ENDPOINT> <API_KEY>
```

This feature significantly improves the user experience and brings the serverless API closer to full Rails parity.