#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';
import { DeploymentInputs } from '../lib/deployment-inputs';

// Synchronous input collection using readline-sync
function collectInputsSync(): DeploymentInputs {
  const readlineSync = require('readline-sync');
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\n❌ Deployment cancelled by user');
    process.exit(0);
  });
  
  console.log('\n🚀 SnapMagic Deployment Setup');
  console.log('==============================');
  console.log('Please provide the following information (Ctrl+C to cancel):\n');

  try {
    // GitHub Repository
    const githubRepo = readlineSync.question('📁 GitHub Repository URL (e.g., https://github.com/username/SnapMagic): ');
    
    // Validate GitHub repo format
    if (!githubRepo.includes('github.com') || !githubRepo.includes('/')) {
      throw new Error('❌ Invalid GitHub repository URL format');
    }

    // GitHub Token
    console.log('\n🔑 GitHub Personal Access Token:');
    console.log('   Create at: https://github.com/settings/tokens');
    console.log('   Required permissions: repo (Full control of private repositories)');
    const githubToken = readlineSync.question('   Token: ', { hideEchoBack: true });

    if (!githubToken || githubToken.length < 10) {
      throw new Error('❌ GitHub token is required and must be valid');
    }

    // GitHub Branch
    const githubBranch = readlineSync.question('\n🌿 GitHub Branch (default: main): ', { defaultInput: 'main' });

    // App Name
    const defaultAppName = `snapmagic-${Math.random().toString(36).substring(7)}`;
    const appName = readlineSync.question(`\n📱 Amplify App Name (default: ${defaultAppName}): `, { defaultInput: defaultAppName });

    // Basic Auth (optional)
    console.log('\n🔒 Password Protection:');
    console.log('   This will protect your SnapMagic app with username/password.');
    console.log('   Perfect for AWS events - share credentials with attendees.');
    const enableAuthInput = readlineSync.question('   Enable password protection? (y/N): ', { defaultInput: 'N' });
    const enableAuth = enableAuthInput.toLowerCase() === 'y' || enableAuthInput.toLowerCase() === 'yes';
    
    let basicAuthUsername, basicAuthPassword;
    
    if (enableAuth) {
      basicAuthUsername = readlineSync.question('\n   👤 Username (for attendees): ', { defaultInput: 'admin' });
      basicAuthPassword = readlineSync.question('   🔐 Password (for attendees): ', { hideEchoBack: true });
      
      if (!basicAuthPassword) {
        throw new Error('❌ Password is required when basic auth is enabled');
      }
      
      console.log(`\n   ✅ Basic Auth configured: ${basicAuthUsername} / [password hidden]`);
    }

    console.log('\n✅ Configuration collected successfully!');
    console.log('🚀 Deploying SnapMagic to AWS...\n');

    return {
      githubRepo,
      githubToken,
      githubBranch,
      appName,
      enableBasicAuth: enableAuth,
      basicAuthUsername,
      basicAuthPassword
    };
  } catch (error) {
    console.log('\n❌ Input collection failed:', (error as Error).message);
    process.exit(1);
  }
}

// Create CDK app
const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'dev';

// Check if this is a destroy operation - if so, skip all input collection
const isDestroy = process.argv.includes('destroy') || process.env.npm_lifecycle_event === 'destroy';

let inputs: DeploymentInputs;

if (isDestroy) {
  // For destroy operations, use minimal dummy inputs - no prompts needed
  inputs = {
    githubRepo: 'https://github.com/dummy/repo',
    githubToken: 'dummy-token',
    githubBranch: 'main',
    appName: 'dummy-app',
    enableBasicAuth: false
  };
} else {
  // For deploy operations, collect inputs
  if (process.env.SNAPMAGIC_GITHUB_REPO && process.env.SNAPMAGIC_GITHUB_TOKEN) {
    console.log('🧪 Using environment variables for testing...');
    inputs = {
      githubRepo: process.env.SNAPMAGIC_GITHUB_REPO,
      githubToken: process.env.SNAPMAGIC_GITHUB_TOKEN,
      githubBranch: process.env.SNAPMAGIC_GITHUB_BRANCH || 'main',
      appName: process.env.SNAPMAGIC_APP_NAME || `snapmagic-${Math.random().toString(36).substring(7)}`,
      enableBasicAuth: process.env.SNAPMAGIC_ENABLE_AUTH === 'true',
      basicAuthUsername: process.env.SNAPMAGIC_AUTH_USERNAME || 'admin',
      basicAuthPassword: process.env.SNAPMAGIC_AUTH_PASSWORD
    };
  } else if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.CDK_SKIP_INPUTS) {
    throw new Error('❌ Interactive input collection not supported in CI/CD. Please use environment variables.');
  } else {
    console.log('🎯 SnapMagic requires some information to connect to your GitHub repository...\n');
    inputs = collectInputsSync();
  }

  console.log(`✅ CDK stack configured for environment: ${environment}`);
  console.log(`📁 Repository: ${inputs.githubRepo}`);
  console.log(`🌿 Branch: ${inputs.githubBranch}`);
  console.log(`📱 App Name: ${inputs.appName}`);
  if (inputs.enableBasicAuth) {
    console.log(`🔒 Basic Auth: Enabled (${inputs.basicAuthUsername})`);
  }
  console.log('\n🚀 Deploying to AWS...\n');
}

// Create the complete SnapMagic stack (frontend + backend)
new SnapMagicStack(app, `SnapMagic-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  inputs,
  description: 'SnapMagic - AI-powered photo and video transformation for AWS events'
});
