import { Stack, StackProps, CfnOutput, Tags, Duration, CfnResource, CustomResource, RemovalPolicy } from 'aws-cdk-lib';
import { aws_amplify as amplify, aws_lambda as lambda, aws_apigateway as apigateway, aws_iam as iam, aws_s3 as s3, aws_events as events, aws_events_targets as targets } from 'aws-cdk-lib';
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

    // ========================================
    // S3 BUCKET FOR VIDEO STORAGE WITH CDK CLEANUP ONLY
    // ========================================
    const videoBucket = new s3.Bucket(this, 'SnapMagicVideoBucket', {
      bucketName: `snapmagic-videos-${props.environment}-${this.account}-${Date.now()}`,
      
      // 🗑️ CLEANUP ONLY WHEN EVENT ENDS (CDK DESTROY)
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,  // Removes all videos when stack is destroyed
      
      // 🔒 SECURITY SETTINGS
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // 🌐 CORS CONFIGURATION FOR PRESIGNED URLS
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'], // Allow all origins for presigned URLs
        allowedHeaders: ['*'],
        maxAge: 3600
      }],
      
      // 📊 MONITORING
      eventBridgeEnabled: true
    });

    // Add tags to the video bucket
    Tags.of(videoBucket).add('Purpose', 'Event-Video-Storage');
    Tags.of(videoBucket).add('Cleanup', 'CDK-Destroy-Only');
    Tags.of(videoBucket).add('Environment', props.environment);

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
                'bedrock:StartAsyncInvoke',  // Required for Nova Reel async API
                'bedrock:GetAsyncInvoke',    // To check async job status
                'bedrock:ListFoundationModels',
                'bedrock:GetFoundationModel'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-canvas-v1:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-reel-v1:1`,  // Correct model ID
                `arn:aws:bedrock:${this.region}:${this.account}:async-invoke/*`  // Required for StartAsyncInvoke
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
    // AUTO-DELETE LAMBDA: DESTROY STACK AFTER 7 DAYS
    // ========================================
    const autoDeleteLambda = new lambda.Function(this, 'AutoDeleteFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.lambda_handler',
      timeout: Duration.minutes(15),
      code: lambda.Code.fromInline(`
import boto3
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Auto-delete CDK stack after 7 days
    Triggered by EventBridge scheduled rule
    """
    try:
        stack_name = '${this.stackName}'
        region = '${this.region}'
        
        logger.info(f"🗑️ Auto-delete triggered for stack: {stack_name}")
        
        # Initialize CloudFormation client
        cf_client = boto3.client('cloudformation', region_name=region)
        
        # Check if stack exists
        try:
            response = cf_client.describe_stacks(StackName=stack_name)
            stack = response['Stacks'][0]
            stack_status = stack['StackStatus']
            creation_time = stack['CreationTime']
            
            logger.info(f"📊 Stack found - Status: {stack_status}, Created: {creation_time}")
            
        except cf_client.exceptions.ClientError as e:
            if 'does not exist' in str(e):
                logger.info(f"✅ Stack {stack_name} already deleted - nothing to do")
                return {'statusCode': 200, 'body': 'Stack already deleted'}
            else:
                raise e
        
        # Check if stack is older than 7 days
        now = datetime.now(creation_time.tzinfo)
        age_days = (now - creation_time).days
        
        logger.info(f"📅 Stack age: {age_days} days")
        
        if age_days >= 7:
            logger.info(f"🗑️ Stack is {age_days} days old - proceeding with deletion")
            
            # Delete the stack
            cf_client.delete_stack(StackName=stack_name)
            
            logger.info(f"✅ Stack deletion initiated: {stack_name}")
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'Stack {stack_name} deletion initiated',
                    'stack_age_days': age_days,
                    'action': 'deleted'
                })
            }
        else:
            days_remaining = 7 - age_days
            logger.info(f"⏳ Stack is only {age_days} days old - {days_remaining} days remaining")
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'Stack {stack_name} not old enough for deletion',
                    'stack_age_days': age_days,
                    'days_remaining': days_remaining,
                    'action': 'skipped'
                })
            }
            
    except Exception as e:
        logger.error(f"❌ Auto-delete failed: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'stack_name': stack_name
            })
        }
`),
      environment: {
        STACK_NAME: this.stackName,
        REGION: this.region
      },
      description: 'Auto-delete SnapMagic stack after 7 days'
    });

    // Grant permissions to delete CloudFormation stacks
    autoDeleteLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudformation:DescribeStacks',
        'cloudformation:DeleteStack',
        'cloudformation:DescribeStackEvents',
        'cloudformation:DescribeStackResources'
      ],
      resources: [
        `arn:aws:cloudformation:${this.region}:${this.account}:stack/${this.stackName}/*`,
        `arn:aws:cloudformation:${this.region}:${this.account}:stack/${this.stackName}`
      ]
    }));

    // EventBridge rule to trigger auto-delete daily
    const autoDeleteRule = new events.Rule(this, 'AutoDeleteRule', {
      schedule: events.Schedule.rate(Duration.days(1)), // Check daily
      description: 'Daily check to auto-delete SnapMagic stack after 7 days',
      enabled: true
    });

    // Add Lambda as target
    autoDeleteRule.addTarget(new targets.LambdaFunction(autoDeleteLambda));

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
      reservedConcurrentExecutions: 800,  // Reserve 800, leave 200 unreserved (AWS requires min 100)
      environment: {
        PYTHONPATH: '/var/task:/var/task/src',
        LOG_LEVEL: 'INFO',
        EVENT_USERNAME: inputs.basicAuthUsername || 'demo',
        EVENT_PASSWORD: inputs.basicAuthPassword || 'demo',
        VIDEO_BUCKET_NAME: videoBucket.bucketName
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

    new CfnOutput(this, 'AutoDeletePolicy', {
      value: `Stack will auto-delete after 7 days (${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})`,
      description: '🗑️ IMPORTANT: Automatic stack deletion after 7 days'
    });

    new CfnOutput(this, 'AutoDeleteLambda', {
      value: autoDeleteLambda.functionName,
      description: 'Lambda function handling auto-deletion'
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
