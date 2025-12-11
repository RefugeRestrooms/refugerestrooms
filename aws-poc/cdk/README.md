# REFUGE Restrooms - AWS CDK Deployment

Modern infrastructure as code using AWS CDK v2.

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Quick Start

### 1. Install Dependencies

```bash
# Install CDK dependencies
npm install

# Install Lambda dependencies
cd ../lambda/createRestroom && npm install && cd ../..
cd ../lambda/getRestroom && npm install && cd ../..
```

### 2. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap
```

This creates the necessary S3 bucket and IAM roles for CDK deployments in your AWS account.

### 3. Deploy

```bash
# Synthesize CloudFormation template (optional, to preview)
cdk synth

# Deploy to dev environment (default)
cdk deploy

# Deploy to staging
cdk deploy -c environment=staging

# Deploy to production
cdk deploy -c environment=prod
```

### 4. Get Outputs

After deployment, CDK will display outputs:
```
Outputs:
RefugeRestroomsPoc-dev.GraphQLApiEndpoint = https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
RefugeRestroomsPoc-dev.GraphQLApiKey = da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
RefugeRestroomsPoc-dev.DynamoDBTableName = refuge-restrooms-dev
```

## Available Commands

```bash
npm run build          # Compile TypeScript
npm run watch          # Watch mode for development
npm run cdk synth      # Synthesize CloudFormation template
npm run cdk diff       # Compare deployed stack with current state
npm run deploy         # Deploy stack
npm run destroy        # Delete stack and all resources
```

## Testing

```bash
cd ../test
./test-api.sh <GRAPHQL_ENDPOINT> <API_KEY>
```

## Environment Configuration

The stack supports multiple environments via context:

```bash
# Development (default)
cdk deploy

# Staging
cdk deploy -c environment=staging

# Production (with additional safeguards)
cdk deploy -c environment=prod
```

**Production differences:**
- DynamoDB table has `RETAIN` removal policy (won't be deleted)
- Point-in-time recovery enabled
- API key expires in 365 days

## Stack Resources

This CDK stack creates:

- **DynamoDB Table**: `refuge-restrooms-{environment}`
  - Partition key: `id`
  - GSI: `CreatedAtIndex` (for time-based queries)
  - GSI: `CityIndex` (for location-based queries)
  - Encryption: AWS managed
  - Billing: On-demand

- **Lambda Functions**:
  - `refuge-create-restroom-{environment}`: Create restrooms
  - `refuge-get-restroom-{environment}`: Get restroom by ID
  - Runtime: Node.js 18.x
  - Memory: 512 MB
  - Timeout: 30 seconds
  - X-Ray tracing enabled

- **AppSync GraphQL API**: `refuge-restrooms-api-{environment}`
  - Authentication: API Key
  - X-Ray tracing enabled
  - CloudWatch logging enabled

- **IAM Roles & Policies**: Least privilege access

## Cost Estimate

Same as SAM deployment:
- DynamoDB: Free tier covers most POC usage
- Lambda: Free tier covers 1M requests/month
- AppSync: Free tier covers 250k queries/month
- Estimated: < $5/month for POC

## Cleanup

To delete all resources:

```bash
cdk destroy
```

Or for specific environment:
```bash
cdk destroy -c environment=staging
```

**Note**: Production stacks retain the DynamoDB table by default. You'll need to manually delete it from the AWS Console if needed.

## Advantages of CDK over SAM

✅ **Type Safety**: TypeScript provides compile-time checks
✅ **Reusability**: Create constructs for common patterns
✅ **Testing**: Unit test your infrastructure code
✅ **IDE Support**: IntelliSense and auto-completion
✅ **Flexibility**: Full programming language capabilities
✅ **Modern**: Latest AWS features and best practices
✅ **Multi-Stack**: Easy to manage multiple related stacks

## Project Structure

```
cdk/
├── bin/
│   └── app.ts                    # CDK app entry point
├── lib/
│   └── refuge-restrooms-stack.ts # Stack definition
├── schema/
│   └── schema.graphql            # GraphQL schema
├── cdk.json                      # CDK configuration
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## Troubleshooting

### "CDK is not bootstrapped"
Run `cdk bootstrap` first

### "Cannot find module"
Run `npm install` in the cdk directory

### TypeScript errors
Run `npm run build` to see detailed errors

### Lambda code not updating
CDK uses asset hashing. If Lambda code changes, CDK will automatically detect and update it.

### API Key not showing
Check the CloudFormation outputs in AWS Console

## Next Steps

1. ✅ Deploy with CDK
2. ✅ Test the API
3. 📋 Add more Lambda functions (search, update, delete)
4. 📋 Add Cognito authentication
5. 📋 Add OpenSearch for full-text search
6. 📋 Set up CI/CD pipeline
7. 📋 Add monitoring and alarms

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Examples](https://github.com/aws-samples/aws-cdk-examples)
