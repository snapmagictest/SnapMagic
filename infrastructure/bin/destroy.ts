#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';

// Simple destroy script - no inputs needed
const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || 'dev';

// Dummy inputs for destroy - CDK just needs the stack structure
const dummyInputs = {
  githubRepo: 'https://github.com/dummy/repo',
  githubToken: 'dummy-token',
  githubBranch: 'main',
  appName: 'dummy-app',
  enableBasicAuth: false
};

// Create the stack for destruction
new SnapMagicStack(app, `SnapMagic-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  inputs: dummyInputs,
  description: 'SnapMagic - AI-powered photo and video transformation for AWS events'
});
