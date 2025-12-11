# Spam Protection Implementation

## Overview

The AWS POC now includes comprehensive spam protection for restroom submissions, addressing one of the key missing features compared to the Rails application.

## Implementation Details

### 1. Multi-Layer Protection

**Rate Limiting**
- 5 submissions per hour per IP address
- Uses DynamoDB with TTL for efficient storage
- Automatic cleanup after 24 hours

**Content Analysis**
- Keyword detection for common spam terms
- URL detection in inappropriate fields (name)
- Excessive content length detection
- Repeated character pattern detection

**Scoring System**
- Confidence score from 0.0 to 1.0
- Auto-approval for score 0.0 (clean content)
- Manual review required for score > 0.0
- Automatic rejection for score ≥ 0.7

### 2. Architecture

```
GraphQL Request → Lambda Function → Spam Check → DynamoDB
                      ↓
                Rate Limit Check → Rate Limit Table
                      ↓
                Content Analysis → Approval Decision
```

### 3. Components

**Spam Protection Module** (`lambda/spamProtection/index.js`)
- Reusable spam detection logic
- Rate limiting functionality
- Configurable thresholds

**Enhanced Create Function** (`lambda/createRestroom/index.js`)
- Integrated spam checking
- Automatic approval logic
- Spam score storage

**Rate Limit Table** (DynamoDB)
- IP-based tracking
- Automatic TTL cleanup
- Efficient querying

### 4. Comparison with Rails Implementation

| Feature | Rails (Rakismet) | AWS POC | Status |
|---------|------------------|---------|---------|
| **Spam Detection** | Akismet API | Custom rules | ✅ Implemented |
| **Rate Limiting** | None | IP-based | ✅ Enhanced |
| **reCAPTCHA** | Google reCAPTCHA | None | ❌ Missing |
| **Content Analysis** | External service | Built-in | ✅ Implemented |
| **Admin Review** | ActiveAdmin | Manual | ⚠️ Needs UI |

## Configuration

### Environment Variables

```bash
# Required for createRestroom Lambda
RATE_LIMIT_TABLE=refuge-rate-limits-dev
TABLE_NAME=refuge-restrooms-dev
```

### Spam Detection Rules

**Keywords Blocked:**
- Financial: `bitcoin`, `crypto`, `investment`, `make money`
- Adult: `casino`, `lottery`
- Scam: `work from home`, `click here`, `free money`
- Pharmaceutical: `viagra`

**Pattern Detection:**
- URLs in name field
- Comments > 500 characters
- Repeated characters (4+ in a row)

### Rate Limits

- **Submissions:** 5 per hour per IP
- **Window:** Rolling 1-hour window
- **Cleanup:** 24-hour TTL on records

## Testing

Run the spam protection test suite:

```bash
cd aws-poc/test
./test-spam-protection.sh <GRAPHQL_ENDPOINT> <API_KEY>
```

**Test Cases:**
1. Legitimate content (should auto-approve)
2. Spam keywords (should reject/flag)
3. URLs in name (should flag)
4. Excessive content (should flag)
5. Rate limiting (should block after 5 requests)

## Monitoring

### CloudWatch Metrics

Monitor these Lambda logs for spam activity:

```bash
# View spam detection logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/refuge-create-restroom-dev \
  --filter-pattern "Spam detected"

# View rate limit violations
aws logs filter-log-events \
  --log-group-name /aws/lambda/refuge-create-restroom-dev \
  --filter-pattern "rate_limit_exceeded"
```

### Spam Score Analysis

Query restrooms by spam score for admin review:

```graphql
query ListSuspiciousRestrooms {
  listRestrooms(limit: 50) {
    items {
      id
      name
      approved
      spamScore
      createdAt
    }
  }
}
```

## Future Enhancements

### 1. Machine Learning Integration

```typescript
// Potential Amazon Comprehend integration
const comprehend = new ComprehendClient({});
const sentiment = await comprehend.send(new DetectSentimentCommand({
  Text: restroom.comment,
  LanguageCode: 'en'
}));
```

### 2. Advanced Rate Limiting

```typescript
// Geographic rate limiting
const geoLocation = await getLocationFromIP(ipAddress);
const regionalLimit = getRegionalLimit(geoLocation.country);
```

### 3. Community Reporting

```graphql
type Mutation {
  reportRestroom(id: ID!, reason: ReportReason!): ReportResponse
}

enum ReportReason {
  SPAM
  INAPPROPRIATE
  INCORRECT_INFO
  DUPLICATE
}
```

## Security Considerations

### 1. IP Spoofing Protection

- Use CloudFront's `X-Forwarded-For` header
- Validate IP format and ranges
- Consider proxy detection

### 2. Bypass Prevention

- Randomize spam keyword detection
- Use fuzzy matching for variations
- Monitor for pattern evolution

### 3. Privacy Compliance

- IP addresses stored temporarily (24h TTL)
- No personal data in spam logs
- GDPR-compliant data handling

## Deployment

The spam protection is automatically deployed with the CDK stack:

```bash
cd aws-poc/cdk
npm install
cdk deploy
```

**New Resources Created:**
- `refuge-rate-limits-{env}` DynamoDB table
- Updated Lambda permissions
- Enhanced monitoring

## Cost Impact

**Additional Costs:**
- DynamoDB: ~$0.01/month (low volume)
- Lambda execution: ~$0.05/month (minimal overhead)
- CloudWatch logs: ~$0.02/month

**Total:** < $0.10/month additional cost

## Comparison with Alternatives

### AWS WAF (Web Application Firewall)
- **Pros:** Built-in protection, managed rules
- **Cons:** Higher cost, less customization
- **Cost:** ~$5-10/month

### Amazon Textract + Comprehend
- **Pros:** ML-powered detection
- **Cons:** Higher latency, cost
- **Cost:** ~$1-5/month

### Third-party Services (Akismet)
- **Pros:** Proven effectiveness
- **Cons:** External dependency, cost
- **Cost:** ~$5-20/month

**Recommendation:** Current implementation provides good protection at minimal cost. Consider ML services for higher-volume deployments.