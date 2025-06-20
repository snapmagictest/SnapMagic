#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';
import { getDeploymentInputs } from '../lib/deployment-inputs';

async function main() {
  const app = new cdk.App();
  
  // Get environment from context
  const environment = app.node.tryGetContext('environment') || 'dev';
  
  // Check if this is a destroy operation
  const isDestroy = process.argv.includes('destroy');
  
  if (isDestroy) {
    // For destroy operations, create a minimal stack for identification
    new SnapMagicStack(app, `SnapMagic-${environment}`, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
      },
      environment,
      inputs: {
        githubRepo: 'https://github.com/snapmagictest/SnapMagic',
        githubToken: 'dummy-token-for-destroy',
        githubBranch: 'main',
        appName: `snapmagic-${environment}`,
        enableBasicAuth: false
      },
      description: 'SnapMagic - AI-powered photo and video transformation for AWS events'
    });
    return;
  }
  
  try {
    // Collect deployment inputs upfront
    console.log('🎯 SnapMagic requires some information to connect to your GitHub repository...\n');
    const inputs = await getDeploymentInputs();
    
    // Create the stack with collected inputs
    new SnapMagicStack(app, `SnapMagic-${environment}`, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
      },
      environment,
      inputs,
      description: 'SnapMagic - AI-powered photo and video transformation for AWS events'
    });

    console.log(`✅ CDK stack configured for environment: ${environment}`);
    console.log(`📁 Repository: ${inputs.githubRepo}`);
    console.log(`🌿 Branch: ${inputs.githubBranch}`);
    console.log(`📱 App Name: ${inputs.appName}`);
    if (inputs.enableBasicAuth) {
      console.log(`🔒 Basic Auth: Enabled (${inputs.basicAuthUsername})`);
    }
    console.log('\n🚀 Deploying to AWS...\n');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', (error as Error).message);
    process.exit(1);
  }
}

main().catch(console.error);
