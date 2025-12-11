# REFUGE Restrooms - AWS Serverless POC

Proof of concept for migrating restroom creation to AWS serverless architecture.

## Architecture

- **AppSync**: GraphQL API endpoint
- **Lambda**: Business logic for creating restrooms
- **DynamoDB**: Data storage
- **AWS Location Service**: Geocoding (optional, can use Google Maps API)

## What This POC Demonstrates

- Creating restrooms via GraphQL mutation
- Reading restrooms by ID via GraphQL query
- Deleting restrooms via GraphQL mutation
- Storing data in DynamoDB
- Geocoding addresses to lat/lng coordinates with AWS Location Service
- Type-safe infrastructure with AWS CDK
- Basic validation and error handling

## Prerequisites

- AWS Account
- AWS CLI configured
- Node.js 18+ (for Lambda)
- AWS CDK CLI: `npm install -g aws-cdk`

## Project Structure

```
aws-poc/
├── cdk/               # AWS CDK infrastructure code
│   ├── bin/          # CDK app entry point
│   ├── lib/          # Stack definitions
│   └── schema/       # GraphQL schema
├── lambda/           # Lambda function code
│   ├── createRestroom/
│   ├── getRestroom/
│   └── deleteRestroom/
└── test/             # Test scripts
```

## Deployment

This POC uses AWS CDK for infrastructure as code:

```bash
# 1. Install dependencies
cd cdk && npm install
cd ../lambda/createRestroom && npm install && cd ../..
cd lambda/getRestroom && npm install && cd ../..
cd lambda/deleteRestroom && npm install && cd ..

# 2. Bootstrap (first time only)
cd cdk && cdk bootstrap

# 3. Deploy
cdk deploy

# 4. Test
cd ../test
./test-api.sh <YOUR_ENDPOINT> <YOUR_API_KEY>
```

See `cdk/README.md` for detailed instructions.

## Testing

See `test/README.md` for testing the GraphQL API.
