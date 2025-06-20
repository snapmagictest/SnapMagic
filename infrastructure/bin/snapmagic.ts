#!/usr/bin/env node
import 'source-map-support/register';
import { App, Environment } from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';

const app = new App();

// Get environment configuration
const environment = app.node.tryGetContext('environment') || 'dev';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Validate required environment variables
if (!account) {
  throw new Error('Account ID is required. Set CDK_DEFAULT_ACCOUNT or use --context account=123456789012');
}

const env: Environment = {
  account: account,
  region: region,
};

// Create the stack
const stack = new SnapMagicStack(app, `SnapMagic-${environment}`, {
  env: env,
  environment: environment,
  description: `SnapMagic - AI-powered transformation for AWS events (${environment})`,
  stackName: `SnapMagic-${environment}`,
  terminationProtection: environment === 'prod',
});

// Add stack-level tags
stack.tags.setTag('Project', 'SnapMagic');
stack.tags.setTag('Environment', environment);
stack.tags.setTag('Purpose', 'AWS-Event-Demo');
stack.tags.setTag('CostCenter', 'Events');
stack.tags.setTag('ManagedBy', 'CDK');
stack.tags.setTag('Repository', 'https://github.com/snapmagictest/SnapMagic');

// Synthesize the app
app.synth();
