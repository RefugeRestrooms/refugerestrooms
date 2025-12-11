# AWS Serverless POC - Development Roadmap

## Current Status ✅

### Implemented Features
- ✅ **Basic CRUD Operations**
  - Create restroom with geocoding
  - Read restroom by ID
  - Update restroom with smart re-geocoding
  - Delete restroom
- ✅ **Infrastructure**
  - DynamoDB table with GSIs
  - AWS Location Service for geocoding
  - AppSync GraphQL API
  - Lambda functions
  - CDK infrastructure as code
- ✅ **Testing**
  - End-to-end test script
  - Comprehensive documentation

## Missing Features from Rails App

### 🔴 Critical - Core API Functionality

#### 1. List/Search Operations
**Priority: HIGH**

The Rails API has several list/search endpoints that are missing:

- **GET /api/v1/restrooms** - List all restrooms (paginated)
  - Filters: `ada` (accessible), `unisex`
  - Pagination: `page`, `per_page` (default 10, max 100)
  - Order: created_at DESC

- **GET /api/v1/restrooms/search** - Full-text search
  - Search across: name, street, city, state, comment, directions, country
  - Filters: `ada`, `unisex`
  - Pagination support
  - Uses PostgreSQL full-text search (pg_search)

- **GET /api/v1/restrooms/by_location** - Geospatial search
  - Parameters: `lat`, `lng`
  - Returns restrooms within 20 miles, ordered by distance
  - Filters: `ada`, `unisex`
  - Pagination support

- **GET /api/v1/restrooms/by_date** - Date-based filtering
  - Parameters: `day`, `month`, `year`
  - Optional: `updated` (filter by updated_at vs created_at)
  - Filters: `ada`, `unisex`
  - Pagination support

**Implementation Notes:**
- Need DynamoDB query patterns for efficient listing
- Consider DynamoDB Streams + OpenSearch for full-text search
- Use DynamoDB geospatial queries or consider Amazon Location Service geofencing
- GSIs already created for `CreatedAtIndex` and `CityIndex`

#### 2. Voting System
**Priority: MEDIUM**

Rails model has `upvote` and `downvote` fields:
- Track positive/negative ratings
- Calculate rating percentage
- Display community feedback

**Implementation:**
- Add upvote/downvote mutations
- Implement atomic increment/decrement in DynamoDB
- Add rating calculation in resolvers

#### 3. Approval Workflow
**Priority: MEDIUM**

Rails has an `approved` field (default: true):
- New submissions can be moderated
- Only approved restrooms shown in public listings
- Admin panel for approval management

**Implementation:**
- Add approval status to mutations
- Filter unapproved restrooms in list queries
- Consider Step Functions for approval workflow

#### 4. Edit Tracking
**Priority: LOW**

Rails uses `edit_id` field:
- Track versions/edits of the same restroom
- `.current` scope returns latest version per edit_id
- Maintains edit history

**Implementation:**
- Add edit_id to schema
- Implement versioning logic
- Consider DynamoDB item versioning or separate history table

### 🟡 Important - Data Quality

#### 5. Spam Protection
**Priority: MEDIUM**

Rails uses Rakismet (Akismet integration):
- Checks submissions for spam
- Protects against malicious content

**Implementation:**
- Integrate AWS Comprehend for content moderation
- Add Lambda function for spam detection
- Consider Amazon Rekognition for image content (future)

#### 6. Reverse Geocoding
**Priority: LOW**

Rails supports reverse geocoding:
- Convert lat/lng to address
- Auto-populate address fields from coordinates

**Implementation:**
- Use AWS Location Service reverse geocoding
- Add mutation for coordinate-based creation

### 🟢 Nice to Have - Enhanced Features

#### 7. Batch Operations
**Priority: LOW**

- Bulk import/export
- Batch updates
- Data migration tools

**Implementation:**
- S3 + Lambda for CSV import
- DynamoDB batch operations
- Step Functions for orchestration

#### 8. Analytics & Monitoring
**Priority: LOW**

- Usage metrics
- Popular locations
- Search analytics
- API performance monitoring

**Implementation:**
- CloudWatch metrics and dashboards
- X-Ray tracing (already enabled)
- QuickSight for analytics

#### 9. Caching Layer
**Priority: LOW**

- Cache frequently accessed restrooms
- Cache search results
- Reduce DynamoDB costs

**Implementation:**
- AppSync caching
- ElastiCache/DAX for DynamoDB
- CloudFront for API caching

### 🔵 Future Considerations

#### 10. Multi-Language Support
Rails has i18n for 8 languages:
- English, Spanish, Filipino, French, Hindi, Italian, Polish, Portuguese-BR

**Implementation:**
- Store translations in DynamoDB
- Use AWS Translate for automatic translations
- Add language parameter to queries

#### 11. Image Support
Future feature for restroom photos:
- Upload images
- Image moderation
- CDN delivery

**Implementation:**
- S3 for storage
- Lambda for image processing
- Rekognition for moderation
- CloudFront for delivery

#### 12. Real-time Updates
- WebSocket support for live updates
- Notifications for nearby restrooms

**Implementation:**
- AppSync subscriptions
- SNS/SQS for notifications
- Location-based triggers

## Recommended Implementation Order

### Phase 1: Core Search & List (2-3 weeks)
1. List all restrooms with pagination
2. Filter by accessible/unisex
3. Basic full-text search (DynamoDB scan initially)
4. Geospatial search using Location Service

### Phase 2: Data Quality (1-2 weeks)
5. Voting system (upvote/downvote)
6. Approval workflow
7. Content moderation with Comprehend

### Phase 3: Advanced Features (2-3 weeks)
8. Full-text search with OpenSearch
9. Edit tracking and versioning
10. Reverse geocoding
11. Analytics dashboard

### Phase 4: Scale & Optimize (1-2 weeks)
12. Caching layer
13. Batch operations
14. Performance optimization
15. Cost optimization

## Technical Decisions Needed

### Search Strategy
**Options:**
1. **DynamoDB Scan** (Simple, expensive at scale)
2. **DynamoDB + OpenSearch** (Best for full-text, adds complexity)
3. **DynamoDB + ElastiCache** (Good for caching, limited search)
4. **Amazon Kendra** (ML-powered, expensive)

**Recommendation:** Start with DynamoDB scan, migrate to OpenSearch when needed.

### Geospatial Search
**Options:**
1. **DynamoDB with geohash** (Custom implementation)
2. **Amazon Location Service geofencing** (Managed, limited queries)
3. **OpenSearch with geo queries** (Powerful, requires OpenSearch)

**Recommendation:** Use Location Service for now, consider OpenSearch later.

### Pagination Strategy
**Current:** Offset-based (Rails uses Pagy/Kaminari)
**Options:**
1. **Cursor-based** (Better for DynamoDB, no page numbers)
2. **Offset-based** (Familiar UX, expensive with DynamoDB)

**Recommendation:** Implement cursor-based pagination with DynamoDB LastEvaluatedKey.

## Cost Considerations

### Current Stack
- DynamoDB: Pay per request
- Lambda: Pay per invocation
- AppSync: Pay per request
- Location Service: Pay per geocode

### Future Additions
- OpenSearch: ~$50-200/month (t3.small.search)
- ElastiCache: ~$15-50/month (cache.t3.micro)
- CloudFront: Pay per request + data transfer

## Migration Strategy

### Parallel Run Approach
1. Keep Rails app running
2. Build serverless features incrementally
3. Dual-write to both systems
4. Gradually migrate traffic
5. Decommission Rails when ready

### Data Migration
1. Export Rails PostgreSQL data
2. Transform to DynamoDB format
3. Bulk import using DynamoDB batch operations
4. Validate data integrity
5. Set up ongoing sync (if needed)

## Success Metrics

- **Performance:** < 200ms p99 latency
- **Cost:** < 50% of current Rails hosting
- **Availability:** 99.9% uptime
- **Scalability:** Handle 10x current traffic
- **Developer Experience:** Faster deployments, easier maintenance

## Next Steps

1. **Immediate:** Implement list/search operations (Phase 1)
2. **This Week:** Add voting system
3. **This Month:** Complete Phase 1 & 2
4. **This Quarter:** Full feature parity with Rails API
