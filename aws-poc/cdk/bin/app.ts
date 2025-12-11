#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RefugeRestroomsStack } from '../lib/refuge-restrooms-stack';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'dev';

new RefugeRestroomsStack(app, `RefugeRestroomsPoc-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  description: 'REFUGE Restrooms POC - Serverless Infrastructure',
});
