# Geospatial Search Feature

## Overview

The geospatial search feature enables location-based queries to find restrooms near a specific latitude and longitude. This is essential for mobile applications implementing "find restrooms near me" functionality.

## Implementation

### GraphQL Schema Updates

**New Query Parameters:**
```graphql
type Query {
  listRestrooms(
    # Existing parameters
    limit: Int
    nextToken: String
    accessible: Boolean
    unisex: Boolean
    changingTable: Boolean
    
    # New geospatial parameters
    lat: Float          # Latitude (-90 to 90)
    lng: Float          # Longitude (-180 to 180)  
    radius: Int         # Search radius in meters (default: 20km)
  ): RestroomConnection
}
```

**New Response Field:**
```graphql
type Restroom {
  # Existing fields...
  distance: Float     # Distance from search point in meters (only in geospatial queries)
}
```

### Lambda Function Enhancements

**Key Features:**
- **Haversine Formula**: Accurate distance calculations between coordinates
- **Radius Filtering**: Only returns restrooms within specified radius
- **Distance Sorting**: Results ordered by proximity (closest first)
- **Input Validation**: Validates latitude/longitude ranges
- **Hybrid Pagination**: Handles both DynamoDB and in-memory pagination

**Distance Calculation:**
```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
```

## Usage Examples

### Basic Geospatial Query

Find restrooms within 5km of downtown San Francisco:

```graphql
query NearbyRestrooms {
  listRestrooms(
    lat: 37.7749
    lng: -122.4194
    radius: 5000
  ) {
    items {
      id
      name
      street
      city
      latitude
      longitude
      distance
    }
    count
    nextToken
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
          "name": "Downtown Coffee Shop",
          "street": "100 Market St",
          "city": "San Francisco",
          "latitude": 37.7751,
          "longitude": -122.4180,
          "distance": 142
        },
        {
          "id": "restroom-456", 
          "name": "Union Square Mall",
          "street": "200 Geary St",
          "city": "San Francisco",
          "latitude": 37.7880,
          "longitude": -122.4074,
          "distance": 1847
        }
      ],
      "count": 2,
      "nextToken": null
    }
  }
}
```

### Combined Filters

Find accessible restrooms with changing tables within 10km:

```graphql
query AccessibleNearbyRestrooms {
  listRestrooms(
    lat: 37.7749
    lng: -122.4194
    radius: 10000
    accessible: true
    changingTable: true
  ) {
    items {
      id
      name
      accessible
      changingTable
      distance
    }
  }
}
```

### Default Radius

If no radius is specified, defaults to 20km:

```graphql
query DefaultRadius {
  listRestrooms(lat: 37.7749, lng: -122.4194) {
    items {
      name
      distance
    }
  }
}
```

## Testing

### Comprehensive Test Suite

Run the geospatial test:

```bash
cd aws-poc/test
./test-geospatial.sh <API_ENDPOINT> <API_KEY>
```

**Test Coverage:**
1. **Multiple Radius Tests**: 5km, 20km, 100km searches
2. **Distance Validation**: Verifies accurate distance calculations
3. **Sorting Verification**: Confirms closest-first ordering
4. **Input Validation**: Tests invalid coordinates
5. **Combined Filters**: Geospatial + accessibility filters
6. **Edge Cases**: Restrooms without coordinates

**Test Locations:**
- Downtown SF (37.7749, -122.4194) - Reference point
- Mission District (~2km away)
- Oakland (~13km away)  
- San Jose (~77km away)

### Expected Results

```
Test 1: Search within 5km
✓ Found 2 restrooms (Downtown SF + Mission District)
✓ Results sorted by distance
✓ All results within 5km radius

Test 2: Search within 20km  
✓ Found 3 restrooms (adds Oakland)
✓ More results than 5km search

Test 3: Search within 100km
✓ Found 4 restrooms (adds San Jose)
✓ More results than 20km search

Test 4: Invalid coordinates
✓ Latitude 91.0 correctly rejected
✓ Longitude 181.0 correctly rejected

Test 5: Combined filters
✓ Found accessible restrooms within radius
✓ All results match both filters
```

## Performance Considerations

### Current Implementation

**Approach**: Scan + Filter + Sort in Lambda
- **Pros**: Simple, works with existing DynamoDB table
- **Cons**: Scans entire table, filters in memory
- **Suitable for**: Small to medium datasets (< 100k items)

**Performance Characteristics:**
- **Read Cost**: Scans entire table (expensive for large datasets)
- **Latency**: ~200-500ms depending on table size
- **Memory**: Loads all items into Lambda memory for filtering

### Optimization Strategies

#### 1. Geohash Indexing (Future)
Add geohash field to DynamoDB items:
```javascript
// Example geohash for SF: "9q8yy"
{
  id: "restroom-123",
  geohash: "9q8yy1234567",
  // ... other fields
}
```

**Benefits:**
- Query by geohash prefix for approximate location
- Reduce scan scope significantly
- Better performance for large datasets

#### 2. Amazon Location Service Geofencing
Use Location Service's geofencing capabilities:
- Store restroom locations as geofences
- Query geofences by location
- Offload distance calculations to managed service

#### 3. DynamoDB + ElastiCache
Cache popular location queries:
- Cache results for common city centers
- Reduce DynamoDB reads
- Sub-100ms response times

#### 4. Amazon OpenSearch
For advanced geospatial queries:
- Native geo-distance queries
- Complex filtering and aggregations
- Full-text + geospatial combined search

## API Compatibility

### Rails API Comparison

**Rails Endpoint:**
```
GET /api/v1/restrooms/by_location?lat=37.7749&lng=-122.4194
```

**GraphQL Equivalent:**
```graphql
query {
  listRestrooms(lat: 37.7749, lng: -122.4194) {
    items { ... }
  }
}
```

**Key Differences:**
- GraphQL vs REST
- Configurable radius (Rails uses fixed 20 miles)
- Distance field included in response
- Combined with other filters
- Cursor-based pagination

### Migration Path

1. **Parallel Deployment**: Run both APIs simultaneously
2. **Mobile App Updates**: Update apps to use GraphQL endpoint
3. **Performance Testing**: Compare response times and accuracy
4. **Gradual Migration**: Route traffic percentage to new API
5. **Rails Deprecation**: Remove old endpoint when migration complete

## Error Handling

### Input Validation

**Invalid Latitude:**
```json
{
  "errors": [
    {
      "message": "Latitude must be between -90 and 90",
      "path": ["listRestrooms"]
    }
  ]
}
```

**Invalid Longitude:**
```json
{
  "errors": [
    {
      "message": "Longitude must be between -180 and 180", 
      "path": ["listRestrooms"]
    }
  ]
}
```

**Non-numeric Coordinates:**
```json
{
  "errors": [
    {
      "message": "Latitude and longitude must be numbers",
      "path": ["listRestrooms"]
    }
  ]
}
```

### Edge Cases

**No Coordinates**: Restrooms without lat/lng are excluded from geospatial results
**No Results**: Returns empty array if no restrooms within radius
**Large Radius**: No upper limit, but performance may degrade

## Security Considerations

### Input Sanitization
- Validates coordinate ranges
- Prevents injection attacks
- Handles malformed input gracefully

### Rate Limiting
- AppSync provides built-in rate limiting
- Consider additional CloudFront rate limiting for high-traffic scenarios

### Data Privacy
- Location queries are not logged with personal identifiers
- Coordinates are not stored server-side

## Monitoring and Metrics

### Key Metrics to Track

**Performance:**
- Query latency (p50, p95, p99)
- DynamoDB read units consumed
- Lambda execution duration
- Memory utilization

**Usage:**
- Geospatial query frequency
- Popular search locations
- Average radius values
- Error rates

**Business:**
- User engagement with location features
- Mobile app usage patterns
- Geographic distribution of searches

### CloudWatch Dashboards

Monitor geospatial feature health:
- Lambda function metrics
- DynamoDB performance
- API Gateway/AppSync metrics
- Error rates and types

## Future Enhancements

### 1. Advanced Filtering
```graphql
query AdvancedGeospatial {
  listRestrooms(
    lat: 37.7749
    lng: -122.4194
    radius: 5000
    # Future enhancements
    sortBy: DISTANCE  # or RATING, CREATED_AT
    openNow: true     # Business hours filtering
    hasPhotos: true   # Media filtering
  ) {
    items {
      distance
      rating        # Future: average rating
      isOpen        # Future: business hours
      photos        # Future: image URLs
    }
  }
}
```

### 2. Batch Geospatial Queries
```graphql
query MultipleLocations {
  nearbyRestrooms: listRestrooms(lat: 37.7749, lng: -122.4194, radius: 5000)
  workRestrooms: listRestrooms(lat: 37.7849, lng: -122.4094, radius: 2000)
}
```

### 3. Real-time Updates
- WebSocket subscriptions for location changes
- Live updates as user moves
- Push notifications for nearby restrooms

### 4. Machine Learning
- Predict popular locations
- Recommend restrooms based on user patterns
- Optimize caching based on usage

## Deployment

The geospatial feature is ready to deploy:

```bash
cd aws-poc/cdk
cdk deploy
```

After deployment, test with:

```bash
cd aws-poc/test
./test-geospatial.sh <API_ENDPOINT> <API_KEY>
```

This feature brings the serverless API significantly closer to Rails API parity and enables mobile-first use cases.