import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as location from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';
import * as path from 'path';

interface RefugeRestroomsStackProps extends cdk.StackProps {
  environment: string;
}

export class RefugeRestroomsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RefugeRestroomsStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // DynamoDB Tables
    const restroomsTable = new dynamodb.Table(this, 'RestroomsTable', {
      tableName: `refuge-restrooms-${environment}`,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: environment === 'prod',
    });

    // Rate Limiting Table for spam protection
    const rateLimitTable = new dynamodb.Table(this, 'RateLimitTable', {
      tableName: `refuge-rate-limits-${environment}`,
      partitionKey: {
        name: 'ipAddress',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'ttl',
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Global Secondary Indexes
    restroomsTable.addGlobalSecondaryIndex({
      indexName: 'CreatedAtIndex',
      partitionKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    restroomsTable.addGlobalSecondaryIndex({
      indexName: 'CityIndex',
      partitionKey: {
        name: 'city',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // AWS Location Service Place Index for geocoding
    const placeIndex = new location.CfnPlaceIndex(this, 'PlaceIndex', {
      indexName: `refuge-restrooms-places-${environment}`,
      dataSource: 'Esri',
      description: 'Place index for geocoding restroom addresses',
      pricingPlan: 'RequestBasedUsage',
    });

    // Lambda Functions
    const createRestroomFunction = new lambda.Function(this, 'CreateRestroomFunction', {
      functionName: `refuge-create-restroom-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/createRestroom')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: restroomsTable.tableName,
        PLACE_INDEX_NAME: placeIndex.indexName,
        RATE_LIMIT_TABLE: rateLimitTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE,
    });

    const getRestroomFunction = new lambda.Function(this, 'GetRestroomFunction', {
      functionName: `refuge-get-restroom-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/getRestroom')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: restroomsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE,
    });

    const deleteRestroomFunction = new lambda.Function(this, 'DeleteRestroomFunction', {
      functionName: `refuge-delete-restroom-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/deleteRestroom')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: restroomsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE,
    });

    const updateRestroomFunction = new lambda.Function(this, 'UpdateRestroomFunction', {
      functionName: `refuge-update-restroom-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/updateRestroom')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: restroomsTable.tableName,
        PLACE_INDEX_NAME: placeIndex.indexName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE,
    });

    const listRestroomsFunction = new lambda.Function(this, 'ListRestroomsFunction', {
      functionName: `refuge-list-restrooms-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/listRestrooms')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: restroomsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant DynamoDB permissions
    restroomsTable.grantReadWriteData(createRestroomFunction);
    restroomsTable.grantReadData(getRestroomFunction);
    restroomsTable.grantReadWriteData(deleteRestroomFunction);
    restroomsTable.grantReadWriteData(updateRestroomFunction);
    restroomsTable.grantReadData(listRestroomsFunction);
    
    // Grant rate limiting table permissions
    rateLimitTable.grantReadWriteData(createRestroomFunction);

    // Grant AWS Location Service permissions
    createRestroomFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['geo:SearchPlaceIndexForText'],
        resources: [placeIndex.attrArn],
      })
    );

    updateRestroomFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['geo:SearchPlaceIndexForText'],
        resources: [placeIndex.attrArn],
      })
    );

    // AppSync GraphQL API
    const api = new appsync.GraphqlApi(this, 'GraphQLApi', {
      name: `refuge-restrooms-api-${environment}`,
      definition: appsync.Definition.fromSchema(
        appsync.SchemaFile.fromAsset(path.join(__dirname, '../schema/schema.graphql'))
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
        retention: logs.RetentionDays.ONE_WEEK,
      },
    });

    // Lambda Data Sources
    const createRestroomDataSource = api.addLambdaDataSource(
      'CreateRestroomDataSource',
      createRestroomFunction
    );

    const getRestroomDataSource = api.addLambdaDataSource(
      'GetRestroomDataSource',
      getRestroomFunction
    );

    const updateRestroomDataSource = api.addLambdaDataSource(
      'UpdateRestroomDataSource',
      updateRestroomFunction
    );

    const deleteRestroomDataSource = api.addLambdaDataSource(
      'DeleteRestroomDataSource',
      deleteRestroomFunction
    );

    const listRestroomsDataSource = api.addLambdaDataSource(
      'ListRestroomsDataSource',
      listRestroomsFunction
    );

    // Resolvers
    createRestroomDataSource.createResolver('CreateRestroomResolver', {
      typeName: 'Mutation',
      fieldName: 'createRestroom',
    });

    getRestroomDataSource.createResolver('GetRestroomResolver', {
      typeName: 'Query',
      fieldName: 'getRestroom',
    });

    updateRestroomDataSource.createResolver('UpdateRestroomResolver', {
      typeName: 'Mutation',
      fieldName: 'updateRestroom',
    });

    deleteRestroomDataSource.createResolver('DeleteRestroomResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteRestroom',
    });

    listRestroomsDataSource.createResolver('ListRestroomsResolver', {
      typeName: 'Query',
      fieldName: 'listRestrooms',
    });

    // Outputs
    new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
      value: api.graphqlUrl,
      description: 'GraphQL API Endpoint',
      exportName: `${this.stackName}-GraphQLEndpoint`,
    });

    new cdk.CfnOutput(this, 'GraphQLApiKey', {
      value: api.apiKey || 'No API Key',
      description: 'API Key for testing',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: restroomsTable.tableName,
      description: 'DynamoDB Table Name',
      exportName: `${this.stackName}-TableName`,
    });

    new cdk.CfnOutput(this, 'CreateRestroomFunctionName', {
      value: createRestroomFunction.functionName,
      description: 'Create Restroom Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'GetRestroomFunctionName', {
      value: getRestroomFunction.functionName,
      description: 'Get Restroom Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'DeleteRestroomFunctionName', {
      value: deleteRestroomFunction.functionName,
      description: 'Delete Restroom Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'ListRestroomsFunctionName', {
      value: listRestroomsFunction.functionName,
      description: 'List Restrooms Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'PlaceIndexName', {
      value: placeIndex.indexName,
      description: 'AWS Location Service Place Index Name',
    });

    new cdk.CfnOutput(this, 'PlaceIndexArn', {
      value: placeIndex.attrArn,
      description: 'AWS Location Service Place Index ARN',
    });

    // Tags
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Application', 'refuge-restrooms');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
