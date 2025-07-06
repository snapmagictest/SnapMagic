#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicTradingCardStack } from '../lib/snapmagic-stack';
import { DeploymentInputs } from '../lib/deployment-inputs';
import * as fs from 'fs';
import * as path from 'path';

// Load configuration from secrets.json
function loadSecretsConfig(): DeploymentInputs | null {
  const secretsPath = path.join(__dirname, '../../secrets.json');
  
  try {
    if (fs.existsSync(secretsPath)) {
      const secretsContent = fs.readFileSync(secretsPath, 'utf8');
      const secrets = JSON.parse(secretsContent);
      
      console.log('✅ Using configuration from secrets.json');
      console.log(`📁 Repository: ${secrets.github.repositoryUrl}`);
      console.log(`🌿 Branch: ${secrets.github.branch}`);
      console.log(`📱 App Name: ${secrets.app.name}`);
      console.log(`🔒 Password Protection: ${secrets.app.passwordProtection.enabled ? 'Enabled' : 'Disabled'}`);
      
      return {
        githubRepo: secrets.github.repositoryUrl,
        githubToken: secrets.github.token,
        githubBranch: secrets.github.branch,
        appName: secrets.app.name,
        region: secrets.app.region || 'us-east-1',  // Default to us-east-1 for Bedrock Nova
        enableBasicAuth: secrets.app.passwordProtection.enabled,
        basicAuthUsername: secrets.app.passwordProtection.username,
        basicAuthPassword: secrets.app.passwordProtection.password
      };
    }
    return null;
  } catch (error) {
    console.log('❌ Error reading secrets.json:', (error as Error).message);
    console.log('💡 Please check your secrets.json format or use interactive mode');
    return null;
  }
}

// Synchronous input collection using readline-sync (fallback)
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

    // AWS Region
    console.log('\n🌍 AWS Region:');
    console.log('   ⚠️  IMPORTANT: SnapMagic requires us-east-1 for Bedrock Nova Canvas and Nova Reel models');
    console.log('   Other regions will cause deployment failures');
    const region = readlineSync.question('   AWS Region (default: us-east-1): ', { defaultInput: 'us-east-1' });
    
    if (region !== 'us-east-1') {
      console.log(`\n   ⚠️  WARNING: You selected '${region}' but Bedrock Nova models are only available in us-east-1`);
      console.log('   This may cause deployment or runtime failures');
    }

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
      region,
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
    region: 'us-east-1',
    enableBasicAuth: false
  };
} else {
  // For deploy operations, try secrets.json first, then fallback to interactive
  const secretsConfig = loadSecretsConfig();
  
  if (secretsConfig) {
    inputs = secretsConfig;
  } else if (process.env.SNAPMAGIC_GITHUB_REPO && process.env.SNAPMAGIC_GITHUB_TOKEN) {
    console.log('🧪 Using environment variables for testing...');
    inputs = {
      githubRepo: process.env.SNAPMAGIC_GITHUB_REPO,
      githubToken: process.env.SNAPMAGIC_GITHUB_TOKEN,
      githubBranch: process.env.SNAPMAGIC_GITHUB_BRANCH || 'main',
      appName: process.env.SNAPMAGIC_APP_NAME || `snapmagic-${Math.random().toString(36).substring(7)}`,
      region: process.env.SNAPMAGIC_REGION || 'us-east-1',
      enableBasicAuth: process.env.SNAPMAGIC_ENABLE_AUTH === 'true',
      basicAuthUsername: process.env.SNAPMAGIC_AUTH_USERNAME || 'admin',
      basicAuthPassword: process.env.SNAPMAGIC_AUTH_PASSWORD
    };
  } else if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.CDK_SKIP_INPUTS) {
    throw new Error('❌ Interactive input collection not supported in CI/CD. Please use secrets.json or environment variables.');
  } else {
    console.log('🎯 No secrets.json found. Using interactive input collection...\n');
    inputs = collectInputsSync();
  }

  console.log(`\n✅ CDK stack configured for environment: ${environment}`);
  console.log(`🌍 Region: ${inputs.region} ${inputs.region !== 'us-east-1' ? '⚠️  (WARNING: Bedrock Nova models require us-east-1)' : '✅'}`);
  console.log(`🚀 Deploying to AWS...\n`);
}

// Create the complete SnapMagic stack (frontend + backend)
new SnapMagicTradingCardStack(app, `SnapMagic-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: inputs.region,  // Use region from secrets.json or user input
  },
  environment,
  inputs,
  description: `SnapMagic - AI-powered photo and video transformation for AWS events (${inputs.region})`
});
