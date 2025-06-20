#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';

const app = new cdk.App();

// Get environment configuration
const environment = app.node.tryGetContext('environment') || 'dev';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

new SnapMagicStack(app, `SnapMagic-${environment}`, {
  env: {
    account: account,
    region: region,
  },
  environment: environment,
  description: 'SnapMagic - AI-powered transformation for AWS events',
  tags: {
    Project: 'SnapMagic',
    Environment: environment,
    Purpose: 'AWS-Event-Demo',
    CostCenter: 'Events',
  },
});
