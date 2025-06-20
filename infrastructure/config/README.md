# SnapMagic Configuration Guide

This directory contains configuration files for customizing your SnapMagic deployment.

## Quick Setup for Any User

### Option 1: Use the Original SnapMagic Repository
If you want to deploy the original SnapMagic:
1. Keep the default configuration in `app-config.ts`
2. Deploy directly: `npm run deploy`

### Option 2: Use Your Own Fork/Clone
If you forked or cloned SnapMagic to your own GitHub account:

1. **Edit `app-config.ts`**:
   ```typescript
   repository: {
     url: 'https://github.com/YOUR-USERNAME/SnapMagic', // Change this
     branch: 'main',
     useGitHubApp: true,
   },
   ```

2. **Customize app name** (optional):
   ```typescript
   app: {
     name: 'my-snapmagic', // Change this to avoid conflicts
     description: 'My SnapMagic deployment',
   },
   ```

### Option 3: Private Repository
If you're using a private repository:

1. **Edit `app-config.ts`**:
   ```typescript
   repository: {
     url: 'https://github.com/YOUR-USERNAME/YOUR-PRIVATE-REPO',
     branch: 'main',
     useGitHubApp: true, // Recommended for private repos
   },
   ```

2. **You'll need to connect via Amplify Console** after deployment (for authentication)

## Configuration Options

### Repository Settings
- `url`: Your GitHub repository URL
- `branch`: Branch to deploy from (usually 'main')
- `useGitHubApp`: Use GitHub App (recommended) vs OAuth token

### App Settings
- `name`: Amplify app name (must be unique in your AWS account)
- `description`: App description
- `domain`: Custom domain (optional)

### Build Settings
- `nodeVersion`: Node.js version ('22' recommended)
- `buildTimeout`: Build timeout in minutes
- `computeType`: Build environment size

### Environment Settings
Configure different environments (dev, staging, prod):
- `stage`: Deployment stage
- `enableBasicAuth`: Password protect your app
- `basicAuthUsername/Password`: Basic auth credentials

## Deployment Commands

```bash
# Deploy to development (default)
npm run deploy

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Deploy with custom environment
cdk deploy -c environment=custom
```

## GitHub Authentication

### For Public Repositories
- No additional setup required
- Amplify will connect automatically

### For Private Repositories
After deployment, you'll need to:
1. Go to Amplify Console
2. Connect your GitHub account
3. Authorize access to your repository

### GitHub App vs OAuth Token
- **GitHub App** (recommended): More secure, better permissions
- **OAuth Token**: Legacy method, still supported

## Troubleshooting

### "Repository not found" error
- Check repository URL is correct
- Ensure repository is public or you have access
- Verify branch name exists

### "Authentication failed" error
- Connect repository manually via Amplify Console
- Check GitHub permissions
- Try switching between GitHub App and OAuth

### "App name already exists" error
- Change the app name in `app-config.ts`
- Use environment-specific names

## Examples

### Personal Fork
```typescript
export const defaultConfig: SnapMagicConfig = {
  repository: {
    url: 'https://github.com/johndoe/SnapMagic',
    branch: 'main',
    useGitHubApp: true,
  },
  app: {
    name: 'johndoe-snapmagic',
    description: 'John\'s SnapMagic deployment',
  },
  // ... rest of config
};
```

### Company Deployment
```typescript
export const defaultConfig: SnapMagicConfig = {
  repository: {
    url: 'https://github.com/company/snapmagic-fork',
    branch: 'production',
    useGitHubApp: true,
  },
  app: {
    name: 'company-snapmagic',
    description: 'Company SnapMagic for AWS Summit',
    domain: 'snapmagic.company.com',
  },
  environments: {
    prod: {
      name: 'production',
      stage: 'PRODUCTION',
      enableBasicAuth: true,
      basicAuthUsername: 'summit',
      basicAuthPassword: 'SecurePassword123!',
    }
  }
};
```
