import { Stack, StackProps, CfnOutput, Tags, Duration, CfnResource, CustomResource } from 'aws-cdk-lib';
import { aws_amplify as amplify, aws_lambda as lambda, aws_apigateway as apigateway, aws_iam as iam } from 'aws-cdk-lib';
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
    API_URL: $SNAPMAGIC_API_URL
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci --only=production
        - echo "Configuring API URL using CDK Custom Resource approach..."
        - echo "SNAPMAGIC_API_URL is set to: $SNAPMAGIC_API_URL"
        - echo "Before replacement:"
        - grep -A 2 -B 2 "PLACEHOLDER_API_URL" public/index.html || echo "Could not find placeholder"
        - sed -i "s|PLACEHOLDER_API_URL|$SNAPMAGIC_API_URL|g" public/index.html
        - echo "After replacement:"
        - grep -A 2 -B 2 "$SNAPMAGIC_API_URL" public/index.html || echo "Could not find replaced URL"
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

    // Lambda function for SnapMagic AI backend
    const snapMagicLambda = new lambda.Function(this, 'SnapMagicAIFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_handler.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        exclude: ['*.md', '__pycache__', '*.pyc', 'test_*', 'run_local.py', 'README.md']
      }),
      role: lambdaRole,
      timeout: Duration.minutes(5),
      memorySize: 1024,
      environment: {
        PYTHONPATH: '/var/task:/var/task/src',
        LOG_LEVEL: 'INFO',
        SNAPMAGIC_USERNAME: inputs.basicAuthUsername || 'd',
        SNAPMAGIC_PASSWORD: inputs.basicAuthPassword || 'd'
      },
      description: 'SnapMagic AI backend using Strands Agents'
    });

    // Custom Resource Lambda to update Amplify branch with API Gateway URL
    const updateAmplifyBranchFunction = new lambda.Function(this, 'UpdateAmplifyBranchFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      timeout: Duration.minutes(5),
      code: lambda.Code.fromInline(`
import boto3
import json
import logging
import urllib3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        request_type = event['RequestType']
        
        if request_type == 'Delete':
            send_response(event, context, 'SUCCESS', {'Message': 'Delete completed'})
            return
        
        # Extract properties from CloudFormation custom resource
        props = event['ResourceProperties']
        app_id = props['AppId']
        branch_name = props['BranchName']
        api_url = props['ApiUrl']
        region = props['Region']
        
        amplify = boto3.client('amplify', region_name=region)
        
        # Update branch environment variables with the actual API Gateway URL
        logger.info(f"Updating branch {branch_name} with API URL: {api_url}")
        
        response = amplify.update_branch(
            appId=app_id,
            branchName=branch_name,
            environmentVariables={
                'NODE_ENV': 'development',
                'AMPLIFY_BUILD_TIMEOUT': '15',
                'SNAPMAGIC_API_URL': api_url
            }
        )
        
        logger.info(f"Branch updated successfully")
        
        # Trigger a new build to pick up the environment variable
        build_response = amplify.start_job(
            appId=app_id,
            branchName=branch_name,
            jobType='RELEASE'
        )
        
        job_id = build_response['jobSummary']['jobId']
        logger.info(f"Started build job: {job_id}")
        
        # Send success response to CloudFormation
        send_response(event, context, 'SUCCESS', {
            'Message': f'Successfully updated branch and started build',
            'ApiUrl': api_url,
            'JobId': job_id
        })
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        send_response(event, context, 'FAILED', {'Error': str(e)})

def send_response(event, context, status, data):
    response_body = {
        'Status': status,
        'Reason': f'See CloudWatch Log Stream: {context.log_stream_name}',
        'PhysicalResourceId': context.log_stream_name,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'Data': data
    }
    
    http = urllib3.PoolManager()
    response = http.request('PUT', event['ResponseURL'], 
                          body=json.dumps(response_body),
                          headers={'Content-Type': 'application/json'})
    logger.info(f"Response status: {response.status}")
`),
      role: new iam.Role(this, 'UpdateAmplifyBranchFunctionRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
        ],
        inlinePolicies: {
          AmplifyAccess: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'amplify:UpdateBranch',
                  'amplify:StartJob'
                ],
                resources: [`arn:aws:amplify:${this.region}:${this.account}:apps/*`]
              })
            ]
          })
        }
      })
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
    loginResource.addMethod('POST', lambdaIntegration);
    
    // Transform image endpoint
    const transformImageResource = apiResource.addResource('transform-image');
    transformImageResource.addMethod('POST', lambdaIntegration);
    
    // Generate video endpoint
    const generateVideoResource = apiResource.addResource('generate-video');
    generateVideoResource.addMethod('POST', lambdaIntegration);

    // Detect gesture endpoint
    const detectGestureResource = apiResource.addResource('detect-gesture');
    detectGestureResource.addMethod('POST', lambdaIntegration);

    // Transcribe audio endpoint
    const transcribeAudioResource = apiResource.addResource('transcribe-audio');
    transcribeAudioResource.addMethod('POST', lambdaIntegration);

    // Generic SnapMagic endpoint
    const snapMagicResource = apiResource.addResource('snapmagic');
    snapMagicResource.addMethod('POST', lambdaIntegration);

    // Health check endpoint
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

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
          value: api.url  // This is the key - CDK will resolve this to the actual API Gateway URL
        }
      ]
    });

    // CRITICAL: Ensure branch creation depends on API Gateway being fully deployed
    mainBranch.addDependency(api.node.defaultChild as CfnResource);

    // Custom Resource to update Amplify branch with correct API Gateway URL
    const updateAmplifyBranch = new CustomResource(this, 'UpdateAmplifyBranch', {
      serviceToken: updateAmplifyBranchFunction.functionArn,
      properties: {
        AppId: snapMagicApp.attrAppId,
        BranchName: inputs.githubBranch,
        ApiUrl: api.url,
        Region: this.region
      }
    });

    // Ensure custom resource runs after both Amplify branch and API are created
    updateAmplifyBranch.node.addDependency(snapMagicApp);
    updateAmplifyBranch.node.addDependency(api);
    updateAmplifyBranch.node.addDependency(mainBranch);

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
      value: 'CDK Custom Resource will automatically update Amplify branch and trigger build',
      description: 'Deployment Status'
    });

    new CfnOutput(this, 'TriggerFirstBuild', {
      value: 'Automatic - CDK Custom Resource handles this',
      description: '✅ AUTOMATED: Custom Resource updates branch and triggers build automatically'
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
