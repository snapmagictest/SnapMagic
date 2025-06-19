#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';

const app = new cdk.App();

// Get environment from context or default to dev
const environment = app.node.tryGetContext('environment') || 'dev';

new SnapMagicStack(app, `SnapMagic-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment: environment,
  tags: {
    Project: 'SnapMagic',
    Environment: environment,
    ManagedBy: 'CDK'
  }
});
