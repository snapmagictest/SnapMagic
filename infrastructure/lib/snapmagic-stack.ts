import { Stack, StackProps, CfnOutput, Tags, CustomResource, Duration } from 'aws-cdk-lib';
import { aws_amplify as amplify, aws_lambda as lambda, aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentInputs } from './deployment-inputs';

export interface SnapMagicStackProps extends StackProps {
  environment: string;
  inputs: DeploymentInputs;
}

export class SnapMagicStack extends Stack {
  constructor(scope: Construct, id: string, props: SnapMagicStackProps) {
    super(scope, id, props);

    const { inputs } = props;

    // SnapMagic Amplify App with GitHub connection
    const snapMagicApp = new amplify.CfnApp(this, 'SnapMagicApp', {
      name: inputs.appName,
      description: 'SnapMagic - AI-powered transformation for AWS events',
      
      // GitHub repository connection
      repository: inputs.githubRepo,
      accessToken: inputs.githubToken,
      
      // Build configuration
      buildSpec: `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci --only=production
    build:
      commands:
        - echo "Frontend is already built - copying static files"
        - ls -la public/
  artifacts:
    baseDirectory: frontend/public
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*`,
      
      // Environment variables
      environmentVariables: [
        {
          name: 'AMPLIFY_DIFF_DEPLOY',
          value: 'false'
        },
        {
          name: 'NODE_VERSION',
          value: '22'
        },
        {
          name: 'AMPLIFY_BUILD_TIMEOUT',
          value: '15'
        }
      ],
      
      // Platform and other settings
      platform: 'WEB',
      enableBranchAutoDeletion: false,
      
      // Custom rules for SPA routing
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: '404-200'
        }
      ]
    });

    // Create main branch connected to GitHub
    const mainBranch = new amplify.CfnBranch(this, 'MainBranch', {
      appId: snapMagicApp.attrAppId,
      branchName: inputs.githubBranch,
      description: `${inputs.githubBranch} branch for SnapMagic deployment`,
      enableAutoBuild: true,
      enablePerformanceMode: false,
      enablePullRequestPreview: false,
      stage: props.environment === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT',
      
      // Environment variables specific to this branch
      environmentVariables: [
        {
          name: 'NODE_ENV',
          value: props.environment === 'prod' ? 'production' : 'development'
        },
        {
          name: 'AMPLIFY_BUILD_TIMEOUT',
          value: '15'
        }
      ]
    });

    // Lambda function to trigger initial build
    const triggerBuildFunction = new lambda.Function(this, 'TriggerBuildFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const amplify = new AWS.Amplify();
        
        exports.handler = async (event) => {
          console.log('Event:', JSON.stringify(event, null, 2));
          
          if (event.RequestType === 'Create') {
            try {
              const params = {
                appId: event.ResourceProperties.AppId,
                branchName: event.ResourceProperties.BranchName,
                jobType: 'RELEASE'
              };
              
              console.log('Starting build with params:', params);
              const result = await amplify.startJob(params).promise();
              console.log('Build started:', result);
              
              return {
                Status: 'SUCCESS',
                PhysicalResourceId: result.jobSummary.jobId,
                Data: {
                  JobId: result.jobSummary.jobId
                }
              };
            } catch (error) {
              console.error('Error starting build:', error);
              return {
                Status: 'SUCCESS', // Don't fail deployment if build trigger fails
                PhysicalResourceId: 'failed-build-trigger',
                Data: {
                  Error: error.message
                }
              };
            }
          }
          
          return {
            Status: 'SUCCESS',
            PhysicalResourceId: event.PhysicalResourceId || 'build-trigger'
          };
        };
      `),
      timeout: Duration.minutes(5)
    });

    // Grant permissions to trigger Amplify builds
    triggerBuildFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'amplify:StartJob',
        'amplify:GetJob'
      ],
      resources: [
        `arn:aws:amplify:${this.region}:${this.account}:apps/${snapMagicApp.attrAppId}/*`
      ]
    }));

    // Custom resource to trigger the initial build
    const triggerBuild = new CustomResource(this, 'TriggerInitialBuild', {
      serviceToken: triggerBuildFunction.functionArn,
      properties: {
        AppId: snapMagicApp.attrAppId,
        BranchName: inputs.githubBranch,
        Timestamp: Date.now() // Force update on each deployment
      }
    });

    // Ensure the branch is created before triggering build
    triggerBuild.node.addDependency(mainBranch);

    // Apply tags using CDK v2 best practices
    Tags.of(this).add('Project', 'SnapMagic');
    Tags.of(this).add('Environment', props.environment);
    Tags.of(this).add('Purpose', 'AWS-Event-Demo');
    Tags.of(this).add('CostCenter', 'Events');
    Tags.of(this).add('ManagedBy', 'CDK');
    Tags.of(this).add('Repository', inputs.githubRepo);

    // Outputs
    new CfnOutput(this, 'AmplifyAppId', {
      value: snapMagicApp.attrAppId,
      description: 'Amplify App ID',
      exportName: `SnapMagic-${props.environment}-AppId`
    });

    new CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://${inputs.githubBranch}.${snapMagicApp.attrDefaultDomain}`,
      description: 'SnapMagic Application URL',
      exportName: `SnapMagic-${props.environment}-AppUrl`
    });

    new CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://console.aws.amazon.com/amplify/home?region=${this.region}#/${snapMagicApp.attrAppId}`,
      description: 'Amplify Console URL',
      exportName: `SnapMagic-${props.environment}-ConsoleUrl`
    });

    new CfnOutput(this, 'RepositoryConnected', {
      value: inputs.githubRepo,
      description: 'Connected GitHub Repository'
    });

    new CfnOutput(this, 'BranchConnected', {
      value: inputs.githubBranch,
      description: 'Connected GitHub Branch'
    });

    new CfnOutput(this, 'DeploymentStatus', {
      value: 'Repository connected - build will start automatically',
      description: 'Deployment Status'
    });

    new CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'CDK Stack Name',
      exportName: `SnapMagic-${props.environment}-StackName`
    });

    // Security reminder
    new CfnOutput(this, 'SecurityNote', {
      value: 'GitHub token was used for deployment only and is not stored in AWS',
      description: 'Security Information'
    });
  }
}
