/**
 * AWS Amplify Configuration
 * Replace with actual values from your AWS environment
 */

const amplifyConfig = {
    Auth: {
        Cognito: {
            region: 'us-east-1',
            userPoolId: 'us-east-1_XXXXXXXXX',
            userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
            loginWith: {
                username: true,
                email: false,
                phone_number: false
            }
        }
    }
};

window.amplifyConfig = amplifyConfig;
