import { Stack, StackProps, CfnOutput, Tags, Duration, CfnResource, CustomResource, RemovalPolicy } from 'aws-cdk-lib';
import { aws_amplify as amplify, aws_lambda as lambda, aws_apigateway as apigateway, aws_iam as iam, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentInputs } from './deployment-inputs';
import * as path from 'path';

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
env:
  variables:
    # Environment variables are automatically available from CDK
    SNAPMAGIC_API_URL: $SNAPMAGIC_API_URL
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - echo "Configuring API URL..."
        - echo "SNAPMAGIC_API_URL is set to: $SNAPMAGIC_API_URL"
        - echo "Before replacement:"
        - grep -n "PLACEHOLDER_API_URL" public/index.html || echo "Could not find placeholder"
        - sed -i "s|PLACEHOLDER_API_URL|$SNAPMAGIC_API_URL|g" public/index.html
        - echo "After replacement:"
        - grep -n "$SNAPMAGIC_API_URL" public/index.html || echo "Could not find replaced URL"
        - echo "Verifying replacement worked:"
        - if grep -q "PLACEHOLDER_API_URL" public/index.html; then echo "ERROR: Placeholder still exists!"; exit 1; fi
        - echo "✅ API URL replacement successful"
    build:
      commands:
        - echo "Frontend is already built - copying static files"
        - ls -la public/
  artifacts:
    baseDirectory: frontend/public
    files:
      - '**/*'
  cache:
    paths: []`,
      
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

    // ========================================
    // AI BACKEND INFRASTRUCTURE (Created first to get API URL)
    // ========================================

    // IAM Role for Lambda with Bedrock and other AI service permissions
    const lambdaRole = new iam.Role(this, 'SnapMagicLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role for SnapMagic AI Lambda function',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:ListFoundationModels',
                'bedrock:GetFoundationModel'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-canvas-v1:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-reel-v1:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-image-generator-v2:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/us.anthropic.claude-3-7-sonnet-20250219-v1:0`
              ]
            })
          ]
        }),
        RekognitionAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'rekognition:DetectLabels',
                'rekognition:DetectFaces',
                'rekognition:DetectCustomLabels'
              ],
              resources: ['*']
            })
          ]
        }),
        S3VideoAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:PutObject',
                's3:GetObject',
                's3:DeleteObject',
                's3:ListBucket'
              ],
              resources: [
                videoBucket.bucketArn,
                `${videoBucket.bucketArn}/*`
              ]
            })
          ]
        }),
        TranscribeAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'transcribe:StartTranscriptionJob',
                'transcribe:GetTranscriptionJob',
                'transcribe:ListTranscriptionJobs'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });

    // ========================================
    // S3 BUCKET FOR VIDEO STORAGE WITH CDK CLEANUP ONLY
    // ========================================
    const videoBucket = new s3.Bucket(this, 'SnapMagicVideoBucket', {
      bucketName: `snapmagic-videos-${props.environment}-${this.account}`,
      
      // 🗑️ CLEANUP ONLY WHEN EVENT ENDS (CDK DESTROY)
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,  // Removes all videos when stack is destroyed
      
      // 🔒 SECURITY SETTINGS
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // 📊 MONITORING
      eventBridgeEnabled: true,
      
      // 🏷️ TAGGING
      tags: [
        { key: 'Purpose', value: 'Event-Video-Storage' },
        { key: 'Cleanup', value: 'CDK-Destroy-Only' },
        { key: 'Environment', value: props.environment }
      ]
    });

    // Lambda function for SnapMagic AI backend
    const snapMagicLambda = new lambda.Function(this, 'SnapMagicAIFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'src/lambda_handler.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        exclude: ['*.md', '__pycache__', '*.pyc', 'test_*', 'run_local.py', 'README.md']
      }),
      role: lambdaRole,
      timeout: Duration.minutes(10),  // Increased for video generation
      memorySize: 2048,  // Increased for video processing
      reservedConcurrentExecutions: 1000,  // Reserve full account limit for events
      environment: {
        PYTHONPATH: '/var/task:/var/task/src',
        LOG_LEVEL: 'INFO',
        EVENT_USERNAME: inputs.basicAuthUsername || 'demo',
        EVENT_PASSWORD: inputs.basicAuthPassword || 'demo',
        VIDEO_BUCKET_NAME: videoBucket.bucketName,
        AWS_REGION: this.region
      },
      description: 'SnapMagic AI backend - Trading Cards & Video Generation'
    });

    // API Gateway for REST API
    const api = new apigateway.RestApi(this, 'SnapMagicAPI', {
      restApiName: `SnapMagic AI API (${props.environment})`,
      description: 'REST API for SnapMagic AI backend services',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Auth-Token']
      },
      deployOptions: {
        stageName: props.environment,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200
      }
    });

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(snapMagicLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      proxy: true
    });

    // API endpoints
    const apiResource = api.root.addResource('api');
    
    // Login endpoint (no authentication required)
    const loginResource = apiResource.addResource('login');
    loginResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Transform card endpoint (our new endpoint)
    const transformCardResource = apiResource.addResource('transform-card');
    transformCardResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Transform image endpoint (keep for compatibility)
    const transformImageResource = apiResource.addResource('transform-image');
    transformImageResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Generate video endpoint
    const generateVideoResource = apiResource.addResource('generate-video');
    generateVideoResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Detect gesture endpoint
    const detectGestureResource = apiResource.addResource('detect-gesture');
    detectGestureResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Transcribe audio endpoint
    const transcribeAudioResource = apiResource.addResource('transcribe-audio');
    transcribeAudioResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Generic SnapMagic endpoint
    const snapMagicResource = apiResource.addResource('snapmagic');
    snapMagicResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Health check endpoint
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Create main branch connected to GitHub (now that we have the API URL)
    const mainBranch = new amplify.CfnBranch(this, 'MainBranch', {
      appId: snapMagicApp.attrAppId,
      branchName: inputs.githubBranch,
      description: `${inputs.githubBranch} branch for SnapMagic deployment`,
      enableAutoBuild: true,
      enablePerformanceMode: false,
      enablePullRequestPreview: false,
      stage: props.environment === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT',
      
      // Environment variables specific to this branch - CRITICAL: These must be set correctly
      environmentVariables: [
        {
          name: 'NODE_ENV',
          value: props.environment === 'prod' ? 'production' : 'development'
        },
        {
          name: 'AMPLIFY_BUILD_TIMEOUT',
          value: '15'
        },
        {
          name: 'SNAPMAGIC_API_URL',
          value: api.url
        },
        {
          name: 'AMPLIFY_DIFF_DEPLOY',
          value: 'false'
        }
      ]
    });

    // CRITICAL: Ensure branch creation depends on API Gateway being fully deployed
    mainBranch.addDependency(api.node.defaultChild as CfnResource);

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
      value: 'CDK deployment complete - run the commands below to configure API Gateway URL',
      description: 'Deployment Status'
    });

    new CfnOutput(this, 'ConfigureAmplifyStep1', {
      value: `aws amplify update-branch --app-id ${snapMagicApp.attrAppId} --branch-name ${inputs.githubBranch} --environment-variables SNAPMAGIC_API_URL=${api.url},NODE_ENV=development,AMPLIFY_BUILD_TIMEOUT=15 --region ${this.region}`,
      description: '🔧 STEP 1: Update Amplify branch with API Gateway URL'
    });

    new CfnOutput(this, 'ConfigureAmplifyStep2', {
      value: `aws amplify start-job --app-id ${snapMagicApp.attrAppId} --branch-name ${inputs.githubBranch} --job-type RELEASE --region ${this.region}`,
      description: '🚀 STEP 2: Trigger build to apply the API Gateway URL'
    });

    // AI Backend Outputs
    new CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      description: 'SnapMagic AI API Gateway URL',
      exportName: `SnapMagic-${props.environment}-API-URL`
    });

    new CfnOutput(this, 'LambdaFunctionName', {
      value: snapMagicLambda.functionName,
      description: 'SnapMagic AI Lambda Function Name'
    });

    new CfnOutput(this, 'VideoBucketName', {
      value: videoBucket.bucketName,
      description: 'S3 Bucket for Video Storage (Auto-cleanup after 7 days)',
      exportName: `SnapMagic-${props.environment}-VideoBucket`
    });

    new CfnOutput(this, 'VideoCleanupPolicy', {
      value: 'Videos deleted ONLY when CDK stack is destroyed (event ends)',
      description: 'Video Storage Cleanup Policy - No automatic deletion during event'
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
