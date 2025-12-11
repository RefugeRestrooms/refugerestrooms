# Next Steps for AWS Migration

## Phase 1: Validate the POC (Current)

- [x] Create GraphQL schema
- [x] Build Lambda functions for create/get
- [x] Set up DynamoDB table
- [x] Configure AppSync API
- [x] Add geocoding with AWS Location Service
- [ ] Deploy to AWS
- [ ] Test end-to-end
- [ ] Measure performance and cost

## Phase 2: Add Search Capabilities

### 2.1 Location-based Search
```graphql
query NearbyRestrooms($lat: Float!, $lng: Float!, $radius: Float) {
  nearbyRestrooms(lat: $lat, lng: $lng, radius: $radius) {
    items {
      id
      name
      distance
    }
  }
}
```

**Implementation:**
- Add geohash field to DynamoDB items
- Create GSI on geohash
- Lambda function to query by geohash range
- Calculate distances and sort results

**Libraries:**
- `ngeohash` for geohashing
- Custom distance calculation

### 2.2 Full-text Search
```graphql
query SearchRestrooms($query: String!) {
  searchRestrooms(query: $query) {
    items {
      id
      name
      city
    }
  }
}
```

**Implementation:**
- Set up Amazon OpenSearch Service
- DynamoDB Streams → Lambda → OpenSearch
- Lambda function to query OpenSearch
- Return results via AppSync

### 2.3 List with Filters
```graphql
query ListRestrooms($accessible: Boolean, $unisex: Boolean) {
  listRestrooms(accessible: $accessible, unisex: $unisex) {
    items {
      id
      name
    }
    nextToken
  }
}
```

**Implementation:**
- Add filter expressions to DynamoDB queries
- Implement pagination with nextToken
- Consider GSIs for common filter combinations

## Phase 3: Add Update/Delete Operations

### 3.1 Update Restroom
```graphql
mutation UpdateRestroom($id: ID!, $input: UpdateRestroomInput!) {
  updateRestroom(id: $id, input: $input) {
    id
    name
    updatedAt
  }
}
```

**Implementation:**
- Lambda function with DynamoDB UpdateItem
- Validation logic
- Track edit history (edit_id field)

### 3.2 Voting System
```graphql
mutation VoteRestroom($id: ID!, $vote: VoteType!) {
  voteRestroom(id: $id, vote: $vote) {
    id
    upvote
    downvote
  }
}
```

**Implementation:**
- Atomic counter updates in DynamoDB
- Prevent duplicate votes (track by user/IP)
- Calculate rating percentage

## Phase 4: Authentication & Authorization

### 4.1 Set up Cognito
- Create user pool
- Configure user groups (admin, public)
- Add social login (Google, Facebook)

### 4.2 Update AppSync Auth
```yaml
AuthenticationType: AMAZON_COGNITO_USER_POOLS
```

### 4.3 Add Authorization Rules
```graphql
type Mutation {
  createRestroom(input: CreateRestroomInput!): Restroom
    @aws_auth(cognito_groups: ["public", "admin"])
  
  approveRestroom(id: ID!): Restroom
    @aws_auth(cognito_groups: ["admin"])
}
```

## Phase 5: Build Admin Interface

### 5.1 Admin Queries
```graphql
query ListPendingRestrooms {
  listPendingRestrooms {
    items {
      id
      name
      approved
      createdAt
    }
  }
}
```

### 5.2 Admin Mutations
```graphql
mutation ApproveRestroom($id: ID!) {
  approveRestroom(id: $id) {
    id
    approved
  }
}

mutation DeleteRestroom($id: ID!) {
  deleteRestroom(id: $id)
}
```

### 5.3 Frontend Options
- **Option A**: React + Amplify UI
- **Option B**: Vue + AWS Amplify
- **Option C**: Keep Rails admin, use GraphQL client

## Phase 6: Advanced Features

### 6.1 Real-time Updates
```graphql
subscription OnRestroomCreated {
  onRestroomCreated {
    id
    name
    city
  }
}
```

**Implementation:**
- AppSync subscriptions (built-in)
- Notify mobile apps of new restrooms nearby

### 6.2 Spam Detection
- Integrate with AWS Comprehend for content moderation
- Or keep Rakismet via Lambda HTTP call

### 6.3 Image Uploads
- S3 bucket for images
- Pre-signed URLs for uploads
- CloudFront for delivery
- Image resizing with Lambda@Edge

### 6.4 Internationalization
```graphql
query GetRestroom($id: ID!, $locale: String) {
  getRestroom(id: $id, locale: $locale) {
    id
    name
    localizedContent
  }
}
```

**Implementation:**
- Store translations in DynamoDB or S3
- Lambda function to fetch correct locale
- Client-side i18n library

## Phase 7: Migration Strategy

### 7.1 Dual-Write Pattern
1. Keep Rails as primary
2. Write to both PostgreSQL and DynamoDB
3. Verify data consistency
4. Switch reads to DynamoDB
5. Eventually deprecate PostgreSQL

### 7.2 Data Migration
```bash
# Export from PostgreSQL
rails runner 'Restroom.find_each { |r| puts r.to_json }'

# Import to DynamoDB
node scripts/import-to-dynamodb.js
```

### 7.3 API Compatibility
- Keep REST API for backward compatibility
- Add GraphQL as alternative
- Gradually migrate clients
- Deprecate REST after migration

## Phase 8: Production Readiness

### 8.1 Monitoring & Alerting
- CloudWatch dashboards
- X-Ray tracing
- Error rate alarms
- Cost anomaly detection

### 8.2 CI/CD Pipeline
- GitHub Actions or CodePipeline
- Automated testing
- Staging environment
- Blue/green deployments

### 8.3 Backup & Recovery
- DynamoDB point-in-time recovery
- S3 versioning for assets
- Disaster recovery plan

### 8.4 Performance Optimization
- Lambda provisioned concurrency
- DynamoDB auto-scaling
- CloudFront caching
- AppSync caching

## Estimated Timeline

- **Phase 1** (POC): 1 week ✓
- **Phase 2** (Search): 2-3 weeks
- **Phase 3** (CRUD): 1 week
- **Phase 4** (Auth): 1-2 weeks
- **Phase 5** (Admin): 3-4 weeks
- **Phase 6** (Advanced): 2-3 weeks
- **Phase 7** (Migration): 2-4 weeks
- **Phase 8** (Production): 2-3 weeks

**Total: 3-5 months** for full migration

## Cost Estimate (Production)

Assuming 100k requests/day:

- **AppSync**: ~$12/month
- **Lambda**: ~$5/month (within free tier)
- **DynamoDB**: ~$25/month
- **OpenSearch**: ~$50/month (t3.small)
- **S3 + CloudFront**: ~$10/month
- **Cognito**: Free (within limits)
- **Location Service**: ~$5/month

**Total: ~$100-120/month** vs ~$50/month for Heroku

Note: Costs increase with scale, but so do Heroku costs.

## Decision Points

Before proceeding, consider:

1. **Is the current Rails app a bottleneck?**
   - If no, migration may not be worth the effort

2. **Do you have AWS expertise on the team?**
   - If no, consider training or hiring

3. **What's the primary goal?**
   - Cost reduction? → Validate with POC
   - Performance? → Measure current bottlenecks
   - Learning? → Great opportunity!
   - Scalability? → Is current scale insufficient?

4. **Can you maintain two systems during migration?**
   - Dual-write adds complexity
   - Need monitoring and alerting

5. **What about the community?**
   - Open source contributors may prefer Rails
   - AWS adds barrier to entry for new contributors
