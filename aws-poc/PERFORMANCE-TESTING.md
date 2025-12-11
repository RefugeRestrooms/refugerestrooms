# Performance Testing Strategy: Serverless vs Rails

## 🎯 Testing Objectives

We need concrete data to validate our claims about performance, cost, and scalability improvements. This document outlines a comprehensive testing strategy to compare the serverless GraphQL API against the existing Rails REST API.

## 📊 Key Metrics to Measure

### Performance Metrics
- **Response Time** - Average, median, 95th percentile, 99th percentile
- **Throughput** - Requests per second (RPS)
- **Cold Start Impact** - Lambda cold start frequency and duration
- **Error Rate** - 4xx and 5xx error percentages
- **Time to First Byte (TTFB)** - Network latency impact

### Cost Metrics
- **Per-request cost** - Actual AWS billing data
- **Infrastructure costs** - Monthly operational costs
- **Development velocity** - Time to implement new features
- **Maintenance overhead** - Time spent on operations

### Scalability Metrics
- **Auto-scaling behavior** - Response to traffic spikes
- **Concurrent user handling** - Maximum simultaneous users
- **Geographic performance** - Multi-region response times
- **Database performance** - Query execution times under load

---

## 🧪 Testing Methodology

### Phase 1: Baseline Performance Testing (1-2 weeks)

#### 1.1 Rails API Baseline
**Goal:** Establish current Rails performance characteristics

**Setup:**
```bash
# Use existing production Rails API
# Endpoint: https://www.refugerestrooms.org/api/v1/restrooms
```

**Test Scenarios:**
- List restrooms (paginated)
- Search restrooms by location
- Search restrooms by text
- Get single restroom
- Create/update operations (if possible)

**Tools:**
- **Apache Bench (ab)** - Simple load testing
- **wrk** - Modern HTTP benchmarking tool
- **Artillery** - Advanced load testing with scenarios
- **New Relic/DataDog** - Production monitoring data

#### 1.2 Serverless API Testing
**Goal:** Measure serverless performance under same conditions

**Setup:**
```bash
# Use our deployed GraphQL API
# Endpoint: https://xq4dmzbpijdmzc32xakiowaoki.appsync-api.us-east-1.amazonaws.com/graphql
```

**Test Scenarios:**
- Same operations as Rails, translated to GraphQL
- Combined queries (search + location + filters)
- Pagination with different page sizes

### Phase 2: Load Testing (1 week)

#### 2.1 Gradual Load Increase
**Test Pattern:**
```
1 user  → 10 users → 50 users → 100 users → 500 users → 1000 users
```

**Duration:** 10 minutes per load level
**Ramp-up:** 30 seconds between levels

#### 2.2 Spike Testing
**Test Pattern:**
```
Baseline (10 users) → Spike (500 users for 2 minutes) → Return to baseline
```

**Purpose:** Test auto-scaling behavior and recovery

#### 2.3 Sustained Load Testing
**Test Pattern:**
```
Maintain 100 concurrent users for 2 hours
```

**Purpose:** Test stability and cost under realistic load

### Phase 3: Real-World Simulation (1 week)

#### 3.1 Mobile App Usage Patterns
**Simulate typical mobile app behavior:**
- 70% read operations (list, search, get)
- 20% location-based searches
- 10% write operations (create, update)

#### 3.2 Geographic Distribution
**Test from multiple locations:**
- US East Coast (Virginia)
- US West Coast (California)
- Europe (Ireland)
- Asia (Singapore)

---

## 🛠️ Testing Tools & Scripts

### Tool 1: Apache Bench (Simple Testing)

```bash
# Test Rails list endpoint
ab -n 1000 -c 10 "https://www.refugerestrooms.org/api/v1/restrooms"

# Test serverless equivalent (need to convert to curl with GraphQL)
# We'll create a script for this
```

### Tool 2: Artillery (Advanced Load Testing)

Create `artillery-config.yml`:
```yaml
config:
  target: 'https://www.refugerestrooms.org'
  phases:
    - duration: 60
      arrivalRate: 1
      name: "Warm up"
    - duration: 300
      arrivalRate: 5
      rampTo: 50
      name: "Ramp up load"
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Rails API Test"
    weight: 100
    flow:
      - get:
          url: "/api/v1/restrooms"
      - get:
          url: "/api/v1/restrooms/search?query=coffee"
      - get:
          url: "/api/v1/restrooms/by_location?lat=37.7749&lng=-122.4194"
```

### Tool 3: Custom GraphQL Load Tester

Let's create a custom script for GraphQL testing:

```javascript
// graphql-load-test.js
const { performance } = require('perf_hooks');
const fetch = require('node-fetch');

const GRAPHQL_ENDPOINT = 'https://xq4dmzbpijdmzc32xakiowaoki.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-5uqzwpsr3ffmposqnkug3td3q4';

const queries = {
  listRestrooms: `
    query ListRestrooms($limit: Int, $nextToken: String) {
      listRestrooms(limit: $limit, nextToken: $nextToken) {
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
      }
    }
  `,
  searchByLocation: `
    query SearchByLocation($lat: Float!, $lng: Float!, $radius: Int) {
      listRestrooms(lat: $lat, lng: $lng, radius: $radius, limit: 20) {
        items {
          id
          name
          street
          city
          distance
        }
        nextToken
      }
    }
  `,
  searchByText: `
    query SearchByText($query: String!) {
      listRestrooms(query: $query, limit: 20) {
        items {
          id
          name
          street
          city
          relevanceScore
        }
        nextToken
      }
    }
  `
};

async function runLoadTest(concurrency = 10, duration = 60000) {
  const results = [];
  const startTime = Date.now();
  
  console.log(`Starting load test: ${concurrency} concurrent users for ${duration/1000}s`);
  
  const workers = Array(concurrency).fill().map(async (_, i) => {
    const workerResults = [];
    
    while (Date.now() - startTime < duration) {
      const testStart = performance.now();
      
      try {
        // Randomly choose a query type
        const queryType = ['listRestrooms', 'searchByLocation', 'searchByText'][Math.floor(Math.random() * 3)];
        let variables = {};
        
        switch (queryType) {
          case 'listRestrooms':
            variables = { limit: 25 };
            break;
          case 'searchByLocation':
            variables = { 
              lat: 37.7749 + (Math.random() - 0.5) * 0.1, 
              lng: -122.4194 + (Math.random() - 0.5) * 0.1,
              radius: 20 
            };
            break;
          case 'searchByText':
            variables = { query: ['coffee', 'library', 'mall', 'restaurant'][Math.floor(Math.random() * 4)] };
            break;
        }
        
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({
            query: queries[queryType],
            variables
          })
        });
        
        const responseTime = performance.now() - testStart;
        const success = response.ok;
        
        workerResults.push({
          worker: i,
          queryType,
          responseTime,
          success,
          statusCode: response.status,
          timestamp: Date.now()
        });
        
        if (!success) {
          console.error(`Worker ${i} error: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        const responseTime = performance.now() - testStart;
        workerResults.push({
          worker: i,
          queryType: 'error',
          responseTime,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return workerResults;
  });
  
  const allResults = await Promise.all(workers);
  return allResults.flat();
}

// Export for use in testing scripts
module.exports = { runLoadTest };
```

---

## 📈 Data Collection & Analysis

### Automated Metrics Collection

#### Rails Metrics Collection
```bash
#!/bin/bash
# collect-rails-metrics.sh

echo "Collecting Rails API metrics..."

# Test different endpoints with various loads
for users in 1 5 10 25 50; do
  echo "Testing with $users concurrent users..."
  
  # List endpoint
  ab -n 100 -c $users -g "rails-list-${users}users.tsv" \
    "https://www.refugerestrooms.org/api/v1/restrooms" > "rails-list-${users}users.txt"
  
  # Search endpoint
  ab -n 100 -c $users -g "rails-search-${users}users.tsv" \
    "https://www.refugerestrooms.org/api/v1/restrooms/search?query=coffee" > "rails-search-${users}users.txt"
  
  # Location endpoint
  ab -n 100 -c $users -g "rails-location-${users}users.tsv" \
    "https://www.refugerestrooms.org/api/v1/restrooms/by_location?lat=37.7749&lng=-122.4194" > "rails-location-${users}users.txt"
  
  sleep 30  # Cool down between tests
done

echo "Rails metrics collection complete!"
```

#### Serverless Metrics Collection
```bash
#!/bin/bash
# collect-serverless-metrics.sh

echo "Collecting Serverless API metrics..."

# Use our custom GraphQL load tester
node -e "
const { runLoadTest } = require('./graphql-load-test.js');

async function runTests() {
  for (const users of [1, 5, 10, 25, 50]) {
    console.log(\`Testing with \${users} concurrent users...\`);
    
    const results = await runLoadTest(users, 60000); // 1 minute test
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync(\`serverless-\${users}users.json\`, JSON.stringify(results, null, 2));
    
    // Calculate basic stats
    const responseTimes = results.filter(r => r.success).map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const successRate = results.filter(r => r.success).length / results.length * 100;
    
    console.log(\`Average response time: \${avgResponseTime.toFixed(2)}ms\`);
    console.log(\`Success rate: \${successRate.toFixed(2)}%\`);
    console.log(\`Total requests: \${results.length}\`);
    console.log('---');
    
    // Cool down between tests
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

runTests().catch(console.error);
"
```

### AWS CloudWatch Metrics

Monitor these CloudWatch metrics during testing:

```bash
# Lambda metrics to watch
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=refuge-list-restrooms-dev \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average,Maximum

# DynamoDB metrics to watch
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=refuge-restrooms-dev \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Sum

# AppSync metrics to watch
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppSync \
  --metric-name Latency \
  --dimensions Name=GraphQLAPIId,Value=xq4dmzbpijdmzc32xakiowaoki \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average,Maximum
```

---

## 💰 Cost Analysis Framework

### Real Cost Tracking

#### AWS Cost Tracking
```bash
#!/bin/bash
# track-aws-costs.sh

# Get cost data for our services during testing period
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-02 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --filter file://cost-filter.json

# cost-filter.json content:
# {
#   "Dimensions": {
#     "Key": "SERVICE",
#     "Values": ["Amazon DynamoDB", "AWS Lambda", "AWS AppSync", "Amazon Location Service"]
#   }
# }
```

#### Rails Infrastructure Costs
```bash
# Document current Rails costs
# - Heroku dyno costs
# - Database costs  
# - Add-on costs (New Relic, etc.)
# - CDN costs
# - Monitoring costs

echo "Current Rails Monthly Costs:"
echo "Heroku Standard-2x dyno: $50/month"
echo "Heroku Postgres Standard-0: $50/month" 
echo "New Relic Pro: $25/month"
echo "Estimated total: $125/month base + traffic costs"
```

### Cost Per Request Calculation

```javascript
// cost-calculator.js
function calculateCostPerRequest(testResults, awsCosts) {
  const totalRequests = testResults.length;
  const totalCost = awsCosts.lambda + awsCosts.dynamodb + awsCosts.appsync + awsCosts.location;
  
  return {
    costPerRequest: totalCost / totalRequests,
    costPer1000Requests: (totalCost / totalRequests) * 1000,
    projectedMonthlyCost: (totalCost / totalRequests) * estimatedMonthlyRequests
  };
}
```

---

## 📊 Results Analysis Framework

### Performance Comparison Template

```markdown
## Performance Test Results

### Test Environment
- **Date:** [Test Date]
- **Duration:** [Test Duration]  
- **Load Pattern:** [Concurrent Users Pattern]
- **Geographic Location:** [Test Location]

### Rails API Results
| Metric | Value |
|--------|-------|
| Average Response Time | XXXms |
| 95th Percentile | XXXms |
| 99th Percentile | XXXms |
| Throughput (RPS) | XXX |
| Error Rate | X.X% |
| Max Concurrent Users | XXX |

### Serverless API Results  
| Metric | Value |
|--------|-------|
| Average Response Time | XXXms |
| 95th Percentile | XXXms |
| 99th Percentile | XXXms |
| Throughput (RPS) | XXX |
| Error Rate | X.X% |
| Max Concurrent Users | XXX |
| Cold 