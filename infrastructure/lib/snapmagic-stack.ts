/**
 * SnapMagic Infrastructure Stack
 * 
 * AWS CDK stack for deploying SnapMagic Trading Card Generation system
 * 
 * Components:
 * - AWS Amplify for frontend hosting with GitHub integration
 * - AWS Lambda for backend API processing
 * - Amazon API Gateway for REST API endpoints
 * - Amazon S3 for video storage and static assets
 * - IAM roles and policies for secure service integration
 * - Amazon Bedrock access for Nova Canvas and Nova Reel
 */

import { Stack, StackProps, CfnOutput, Tags, Duration, CfnResource, CustomResource, RemovalPolicy, custom_resources as cr } from 'aws-cdk-lib';
import { aws_amplify as amplify, aws_lambda as lambda, aws_apigateway as apigateway, aws_iam as iam, aws_s3 as s3, aws_events as events, aws_events_targets as targets } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentInputs } from './deployment-inputs';
import * as path from 'path';

export interface SnapMagicStackProps extends StackProps {
  environment: string;
  inputs: DeploymentInputs;
}

export class SnapMagicTradingCardStack extends Stack {
  constructor(scope: Construct, id: string, props: SnapMagicStackProps) {
    super(scope, id, props);

    const { inputs } = props;

    // ========================================
    // AWS AMPLIFY - FRONTEND HOSTING
    // ========================================
    const snapMagicAmplifyApp = new amplify.CfnApp(this, 'SnapMagicApp', {
      name: inputs.appName,
      description: 'SnapMagic - AI-powered trading card generation for AWS events',
      
      // GitHub repository connection
      repository: inputs.githubRepo,
      accessToken: inputs.githubToken,
      
      // Build configuration with auto-build trigger
      buildSpec: `version: 1
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
        - echo "Configuring Template Config..."
        - echo "SNAPMAGIC_TEMPLATE_CONFIG length: \${#SNAPMAGIC_TEMPLATE_CONFIG}"
        - echo "Before template replacement:"
        - grep -n "PLACEHOLDER_TEMPLATE_CONFIG" public/index.html || echo "Could not find template placeholder"
        - sed -i "s|'PLACEHOLDER_TEMPLATE_CONFIG'|$SNAPMAGIC_TEMPLATE_CONFIG|g" public/index.html
        - echo "After template replacement:"
        - echo "Verifying template replacement worked:"
        - if grep -q "PLACEHOLDER_TEMPLATE_CONFIG" public/index.html; then echo "ERROR: Template placeholder still exists!"; exit 1; fi
        - echo "✅ Template config replacement successful"
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

    // ========================================
    // ========================================
    // S3 BUCKET - VIDEO STORAGE
    // ========================================
    const videoStorageBucket = new s3.Bucket(this, 'SnapMagicVideoBucket', {
      bucketName: `snapmagic-videos-${props.environment}-${this.account}-${Date.now()}`,
      
      // Cleanup configuration for event-based deployment
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,  // Removes all videos when stack is destroyed
      
      // Security settings
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // CORS configuration for presigned URLs
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'], // Allow all origins for presigned URLs
        allowedHeaders: ['*'],
        maxAge: 3600
      }],
      

    });

    // Apply resource tags
    Tags.of(videoStorageBucket).add('Purpose', 'Event-Video-Storage');
    Tags.of(videoStorageBucket).add('Cleanup', 'CDK-Destroy-Only');
    Tags.of(videoStorageBucket).add('Environment', props.environment);

    // ========================================
    // IAM ROLE - LAMBDA EXECUTION
    // ========================================
    const lambdaExecutionRole = new iam.Role(this, 'SnapMagicLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role for SnapMagic AI Lambda function with Bedrock and S3 access',
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
                'bedrock:StartAsyncInvoke',  // Required for Nova Reel async API
                'bedrock:GetAsyncInvoke',    // To check async job status
                'bedrock:ListFoundationModels',
                'bedrock:GetFoundationModel'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/${inputs.novaCanvasModel}`,
                `arn:aws:bedrock:${this.region}::foundation-model/${inputs.novaReelModel}`,
                `arn:aws:bedrock:${this.region}:${this.account}:async-invoke/*`  // Required for StartAsyncInvoke
              ]
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
                videoStorageBucket.bucketArn,
                `${videoStorageBucket.bucketArn}/*`
              ]
            })
          ]
        }),

      }
    });



    // ========================================
    // LAMBDA FUNCTION - BACKEND API
    // ========================================
    const snapMagicBackendLambda = new lambda.Function(this, 'SnapMagicAIFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'src/lambda_handler.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        exclude: ['*.md', '__pycache__', '*.pyc', 'test_*', 'run_local.py', 'README.md']
      }),
      role: lambdaExecutionRole,
      timeout: Duration.minutes(10),  // Extended timeout for video generation
      memorySize: 2048,  // Increased memory for AI processing
      reservedConcurrentExecutions: 800,  // Reserve capacity for event usage
      environment: {
        PYTHONPATH: '/var/task:/var/task/src',
        LOG_LEVEL: 'INFO',
        EVENT_USERNAME: inputs.basicAuthUsername || 'demo',
        EVENT_PASSWORD: inputs.basicAuthPassword || 'demo',
        VIDEO_BUCKET_NAME: videoStorageBucket.bucketName,
        S3_BUCKET_NAME: videoStorageBucket.bucketName,  // Use same bucket for cards storage
        NOVA_CANVAS_MODEL: inputs.novaCanvasModel,
        NOVA_REEL_MODEL: inputs.novaReelModel,
        // Template configuration from secrets.json
        TEMPLATE_EVENT_NAME: inputs.cardTemplate?.eventName || 'AWS Event',
        TEMPLATE_LOGOS_JSON: JSON.stringify(inputs.cardTemplate?.logos || []),
        // Usage limits from secrets.json
        CARDS_PER_USER: String(inputs.limits?.cardsPerUser || 5),
        VIDEOS_PER_USER: String(inputs.limits?.videosPerUser || 3),
        PRINTS_PER_USER: String(inputs.limits?.printsPerUser || 1)
      },
      description: 'SnapMagic AI backend - Trading Cards & Video Generation'
    });

    // ========================================
    // API GATEWAY - REST API
    // ========================================
    const snapMagicApiGateway = new apigateway.RestApi(this, 'SnapMagicAPI', {
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
    const lambdaIntegration = new apigateway.LambdaIntegration(snapMagicBackendLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      proxy: true
    });

    // API endpoints
    const apiResource = snapMagicApiGateway.root.addResource('api');
    
    // Login endpoint (no authentication required)
    const loginResource = apiResource.addResource('login');
    loginResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Template configuration endpoint (no authentication required)
    const templateConfigResource = apiResource.addResource('template-config');
    templateConfigResource.addMethod('GET', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Transform card endpoint (our new endpoint)
    const transformCardResource = apiResource.addResource('transform-card');
    transformCardResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });
    
    // Store card endpoint (for storing final composited cards in S3)
    const storeCardResource = apiResource.addResource('store-card');
    storeCardResource.addMethod('POST', lambdaIntegration, {
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



    // Generic SnapMagic endpoint
    const snapMagicResource = apiResource.addResource('snapmagic');
    snapMagicResource.addMethod('POST', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Health check endpoint
    const healthResource = snapMagicApiGateway.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    // Create main branch connected to GitHub (now that we have the API URL)
    const mainBranch = new amplify.CfnBranch(this, 'MainBranch', {
      appId: snapMagicAmplifyApp.attrAppId,
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
          value: snapMagicApiGateway.url
        },
        {
          name: 'SNAPMAGIC_TEMPLATE_CONFIG',
          value: JSON.stringify(inputs.cardTemplate || {
            eventName: 'AWS Event',
            logos: [
              {
                enabled: true,
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/320px-Amazon_Web_Services_Logo.svg.png',
                alt: 'AWS',
                position: 'top-left'
              },
              {
                enabled: true,
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
                alt: 'Amazon',
                position: 'top-right'
              }
            ],
            awsLogo: { enabled: true, text: 'Powered by AWS' }
          })
        },
        {
          name: 'AMPLIFY_DIFF_DEPLOY',
          value: 'false'
        }
      ]
    });

    // CRITICAL: Ensure branch creation depends on API Gateway being fully deployed
    mainBranch.addDependency(snapMagicApiGateway.node.defaultChild as CfnResource);

    // Auto-trigger Amplify build after branch creation
    const triggerBuild = new cr.AwsCustomResource(this, 'TriggerAmplifyBuild', {
      onCreate: {
        service: 'Amplify',
        action: 'startJob',
        parameters: {
          appId: snapMagicAmplifyApp.attrAppId,
          branchName: inputs.githubBranch,
          jobType: 'RELEASE'
        },
        region: this.region,
        physicalResourceId: cr.PhysicalResourceId.of('amplify-build-trigger')
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });

    // Ensure build trigger runs after branch is created
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
      value: snapMagicAmplifyApp.attrAppId,
      description: 'Amplify App ID',
      exportName: `SnapMagic-${props.environment}-AppId`
    });

    new CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://${inputs.githubBranch}.${snapMagicAmplifyApp.attrDefaultDomain}`,
      description: 'SnapMagic Application URL',
      exportName: `SnapMagic-${props.environment}-AppUrl`
    });

    new CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://console.aws.amazon.com/amplify/home?region=${this.region}#/${snapMagicAmplifyApp.attrAppId}`,
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
      value: '✅ CDK deployment complete - API Gateway URL automatically configured in frontend',
      description: 'Deployment Status'
    });

    new CfnOutput(this, 'DeploymentVerification', {
      value: 'Wait 2-3 minutes for Amplify build to complete, then test the AmplifyAppUrl',
      description: '⏱️ Next Steps'
    });

    // AI Backend Outputs
    new CfnOutput(this, 'APIGatewayURL', {
      value: snapMagicApiGateway.url,
      description: 'SnapMagic AI API Gateway URL',
      exportName: `SnapMagic-${props.environment}-API-URL`
    });

    new CfnOutput(this, 'LambdaFunctionName', {
      value: snapMagicBackendLambda.functionName,
      description: 'SnapMagic AI Lambda Function Name'
    });

    new CfnOutput(this, 'VideoBucketName', {
      value: videoStorageBucket.bucketName,
      description: 'S3 Bucket for Video Storage (Auto-cleanup after 7 days)',
      exportName: `SnapMagic-${props.environment}-VideoBucket`
    });

    new CfnOutput(this, 'VideoCleanupPolicy', {
      value: 'Videos deleted ONLY when CDK stack is destroyed (event ends)',
      description: 'Video Storage Cleanup Policy - No automatic deletion during event'
    });



    new CfnOutput(this, 'ManualDeleteCommand', {
      value: `cdk destroy --force`,
      description: '🛑 Run this command to delete stack manually before 7 days'
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

// Maintain backward compatibility
export const SnapMagicStack = SnapMagicTradingCardStack;
