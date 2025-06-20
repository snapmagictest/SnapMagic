// SnapMagic Application Configuration
// Edit this file to customize your deployment

export interface SnapMagicConfig {
  // GitHub Repository Configuration
  repository: {
    url: string;           // GitHub repository URL
    branch: string;        // Branch to deploy from
    connectAfterDeploy: boolean; // Connect repository after CDK deployment (recommended)
  };
  
  // Application Configuration
  app: {
    name: string;          // Amplify app name
    description: string;   // App description
    domain?: string;       // Custom domain (optional)
  };
  
  // Build Configuration
  build: {
    nodeVersion: string;   // Node.js version for builds
    buildTimeout: number;  // Build timeout in minutes
    computeType: 'STANDARD_8GB' | 'STANDARD_16GB'; // Build compute type
  };
  
  // Environment Configuration
  environments: {
    [key: string]: {
      name: string;
      stage: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
      enableBasicAuth?: boolean;
      basicAuthUsername?: string;
      basicAuthPassword?: string;
    };
  };
}

// Default Configuration
// Users can modify these values for their deployment
export const defaultConfig: SnapMagicConfig = {
  repository: {
    // CHANGE THIS: Point to your GitHub repository
    url: 'https://github.com/snapmagictest/SnapMagic',
    branch: 'main',
    connectAfterDeploy: true, // Connect manually via Amplify Console (recommended)
  },
  
  app: {
    // CHANGE THIS: Customize your app name (must be unique in your AWS account)
    name: 'snapmagic',
    description: 'SnapMagic - AI-powered transformation for AWS events',
    // domain: 'your-custom-domain.com', // Uncomment and set for custom domain
  },
  
  build: {
    nodeVersion: '22',     // Node.js 22.x (required for CDK v2)
    buildTimeout: 15,      // 15 minutes build timeout
    computeType: 'STANDARD_8GB', // Standard build environment
  },
  
  environments: {
    dev: {
      name: 'development',
      stage: 'DEVELOPMENT',
      // enableBasicAuth: true,           // Uncomment to enable basic auth
      // basicAuthUsername: 'admin',      // Set basic auth username
      // basicAuthPassword: 'password123' // Set basic auth password
    },
    staging: {
      name: 'staging',
      stage: 'STAGING',
    },
    prod: {
      name: 'production',
      stage: 'PRODUCTION',
    }
  }
};

// Helper function to get environment-specific config
export function getEnvironmentConfig(environment: string = 'dev'): SnapMagicConfig {
  const config = { ...defaultConfig };
  
  // Override app name with environment suffix
  config.app.name = `${defaultConfig.app.name}-${environment}`;
  
  return config;
}
