/**
 * AWS Amplify Gen 2 Configuration
 * Modern configuration for Amplify SDK v6
 */

// This will be generated automatically by your CDK backend
// For now, we'll use placeholder values that match your existing setup
export const amplifyConfig = {
    Auth: {
        Cognito: {
            region: 'us-east-1',
            userPoolId: 'us-east-1_XXXXXXXXX', // Replace with actual values
            userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual values
            loginWith: {
                username: true,
                email: false,
                phone_number: false
            }
        }
    },
    API: {
        REST: {
            SnapMagicAPI: {
                endpoint: 'https://api.example.com', // Will be replaced by CDK output
                region: 'us-east-1'
            }
        }
    },
    Storage: {
        S3: {
            bucket: 'snapmagic-storage-bucket', // Will be replaced by CDK output
            region: 'us-east-1'
        }
    }
};

// For backward compatibility during transition
window.amplifyConfig = amplifyConfig;
