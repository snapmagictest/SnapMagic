/**
 * SnapMagic Modular Build Script
 * Builds the modular components into the main application
 */

const fs = require('fs');
const path = require('path');

class SnapMagicBuilder {
    constructor() {
        this.rootDir = path.dirname(__dirname);
        this.modulesDir = __dirname;
        this.outputDir = path.join(this.rootDir, 'dist');
        
        console.log('🔧 SnapMagic Builder initialized');
        console.log(`📁 Root: ${this.rootDir}`);
        console.log(`📁 Modules: ${this.modulesDir}`);
        console.log(`📁 Output: ${this.outputDir}`);
    }
    
    /**
     * Build the entire application
     */
    async build() {
        try {
            console.log('🚀 Starting SnapMagic build...');
            
            // Clean output directory
            await this.cleanOutput();
            
            // Create output structure
            await this.createOutputStructure();
            
            // Build backend
            await this.buildBackend();
            
            // Build frontend
            await this.buildFrontend();
            
            // Build infrastructure
            await this.buildInfrastructure();
            
            // Copy shared utilities
            await this.copySharedFiles();
            
            // Generate documentation
            await this.generateDocumentation();
            
            console.log('✅ SnapMagic build completed successfully!');
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }
    
    /**
     * Clean output directory
     */
    async cleanOutput() {
        console.log('🧹 Cleaning output directory...');
        
        if (fs.existsSync(this.outputDir)) {
            fs.rmSync(this.outputDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    /**
     * Create output directory structure
     */
    async createOutputStructure() {
        console.log('📁 Creating output structure...');
        
        const dirs = [
            'backend/src/services',
            'frontend/public/js/components',
            'frontend/public/js/utils',
            'infrastructure/lib',
            'shared/types',
            'shared/utils',
            'shared/constants',
            'docs'
        ];
        
        dirs.forEach(dir => {
            fs.mkdirSync(path.join(this.outputDir, dir), { recursive: true });
        });
    }
    
    /**
     * Build backend components
     */
    async buildBackend() {
        console.log('🔧 Building backend...');
        
        const backendSrc = path.join(this.modulesDir, 'backend/src');
        const backendDest = path.join(this.outputDir, 'backend/src');
        
        // Copy Python files
        this.copyDirectory(backendSrc, backendDest);
        
        // Create requirements.txt
        const requirements = [
            'boto3>=1.26.0',
            'botocore>=1.29.0',
            'requests>=2.28.0',
            'python-dateutil>=2.8.0'
        ];
        
        fs.writeFileSync(
            path.join(this.outputDir, 'backend/requirements.txt'),
            requirements.join('\n')
        );
        
        console.log('✅ Backend built');
    }
    
    /**
     * Build frontend components
     */
    async buildFrontend() {
        console.log('🔧 Building frontend...');
        
        const frontendSrc = path.join(this.modulesDir, 'frontend/src');
        const frontendDest = path.join(this.outputDir, 'frontend/public/js');
        
        // Copy JavaScript files
        this.copyDirectory(frontendSrc, frontendDest);
        
        // Create main HTML file
        const htmlContent = this.generateMainHTML();
        fs.writeFileSync(
            path.join(this.outputDir, 'frontend/public/index.html'),
            htmlContent
        );
        
        // Create CSS file
        const cssContent = this.generateMainCSS();
        fs.writeFileSync(
            path.join(this.outputDir, 'frontend/public/css/styles.css'),
            cssContent
        );
        
        // Create package.json
        const packageJson = {
            name: 'snapmagic-frontend',
            version: '2.0.0',
            description: 'SnapMagic Frontend - Modular Architecture',
            main: 'js/SnapMagicApp.js',
            scripts: {
                start: 'serve public',
                build: 'node ../build.js'
            },
            dependencies: {},
            devDependencies: {
                serve: '^14.0.0'
            }
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'frontend/package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        console.log('✅ Frontend built');
    }
    
    /**
     * Build infrastructure components
     */
    async buildInfrastructure() {
        console.log('🔧 Building infrastructure...');
        
        const infraSrc = path.join(this.modulesDir, 'infrastructure');
        const infraDest = path.join(this.outputDir, 'infrastructure');
        
        // Copy infrastructure files if they exist
        if (fs.existsSync(infraSrc)) {
            this.copyDirectory(infraSrc, infraDest);
        }
        
        // Create CDK app file
        const cdkAppContent = this.generateCDKApp();
        fs.writeFileSync(
            path.join(this.outputDir, 'infrastructure/bin/snapmagic.ts'),
            cdkAppContent
        );
        
        // Create CDK package.json
        const cdkPackageJson = {
            name: 'snapmagic-infrastructure',
            version: '2.0.0',
            description: 'SnapMagic Infrastructure - Modular CDK Stack',
            main: 'lib/snapmagic-stack.js',
            scripts: {
                build: 'tsc',
                watch: 'tsc -w',
                test: 'jest',
                cdk: 'cdk'
            },
            dependencies: {
                'aws-cdk-lib': '^2.100.0',
                'constructs': '^10.0.0'
            },
            devDependencies: {
                '@types/node': '^18.0.0',
                'typescript': '^4.9.0',
                'aws-cdk': '^2.100.0'
            }
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'infrastructure/package.json'),
            JSON.stringify(cdkPackageJson, null, 2)
        );
        
        console.log('✅ Infrastructure built');
    }
    
    /**
     * Copy shared files
     */
    async copySharedFiles() {
        console.log('🔧 Copying shared files...');
        
        const sharedSrc = path.join(this.modulesDir, 'shared');
        const sharedDest = path.join(this.outputDir, 'shared');
        
        this.copyDirectory(sharedSrc, sharedDest);
        
        console.log('✅ Shared files copied');
    }
    
    /**
     * Generate documentation
     */
    async generateDocumentation() {
        console.log('📚 Generating documentation...');
        
        const readmeContent = this.generateREADME();
        fs.writeFileSync(
            path.join(this.outputDir, 'README.md'),
            readmeContent
        );
        
        const architectureDoc = this.generateArchitectureDoc();
        fs.writeFileSync(
            path.join(this.outputDir, 'docs/ARCHITECTURE.md'),
            architectureDoc
        );
        
        console.log('✅ Documentation generated');
    }
    
    /**
     * Copy directory recursively
     */
    copyDirectory(src, dest) {
        if (!fs.existsSync(src)) {
            console.warn(`⚠️ Source directory does not exist: ${src}`);
            return;
        }
        
        fs.mkdirSync(dest, { recursive: true });
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    
    /**
     * Generate main HTML file
     */
    generateMainHTML() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SnapMagic - AI Trading Card Creator</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-screen">
        <div class="loading-container">
            <div class="loading-logo">🎴</div>
            <h1 class="loading-title">SnapMagic</h1>
            <p class="loading-subtitle">AI-Powered Trading Card Creator</p>
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading your magical experience...</p>
        </div>
    </div>

    <!-- Login Screen -->
    <div id="loginScreen" class="login-screen hidden">
        <div class="login-container">
            <div class="login-logo">🎴</div>
            <h1 class="login-title">SnapMagic</h1>
            <p class="login-subtitle">AI-Powered Trading Card Creator</p>
            
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <input type="text" id="username" class="form-input" placeholder="Username" required>
                </div>
                <div class="form-group">
                    <input type="password" id="password" class="form-input" placeholder="Password" required>
                </div>
                <button type="submit" class="login-btn">Login</button>
                <button type="button" id="staffOverrideBtn" class="staff-override-btn" style="display: none;">Staff Override</button>
            </form>
            
            <div id="loginError" class="error-container hidden"></div>
        </div>
    </div>

    <!-- Main Application -->
    <div id="mainApp" class="main-app" style="display: none;">
        <!-- Card Generation Section -->
        <div id="cardContainer" class="card-container">
            <div class="prompt-section">
                <div class="prompt-input-container">
                    <textarea id="promptInput" class="prompt-input" placeholder="Describe your trading card character..."></textarea>
                    <div class="prompt-controls">
                        <span id="promptCharCount" class="char-count">0/500</span>
                        <button id="promptClearBtn" class="clear-btn">Clear</button>
                    </div>
                </div>
                <button id="generateBtn" class="generate-btn">Generate Card</button>
            </div>
            
            <div id="resultContainer" class="result-container hidden"></div>
            
            <div id="resultActions" class="result-actions hidden">
                <button id="downloadBtn" class="action-btn download-btn">Download PNG</button>
                <button id="createAnotherBtn" class="action-btn create-another-btn">Create Another</button>
            </div>
            
            <div id="cardError" class="error-container hidden"></div>
            <div id="cardLoading" class="loading-overlay hidden"></div>
        </div>
        
        <!-- Card Gallery -->
        <div id="cardGallery" class="card-gallery hidden"></div>
        <div id="galleryNavigation" class="gallery-navigation hidden">
            <button id="galleryPrevBtn" class="nav-btn">‹</button>
            <div id="galleryDots" class="gallery-dots"></div>
            <button id="galleryNextBtn" class="nav-btn">›</button>
        </div>
    </div>

    <!-- Scripts -->
    <script type="module" src="js/SnapMagicApp.js"></script>
</body>
</html>`;
    }
    
    /**
     * Generate main CSS file
     */
    generateMainCSS() {
        return `/* SnapMagic - Modular CSS */
        
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #ffffff;
    min-height: 100vh;
}

/* Utility Classes */
.hidden {
    display: none !important;
}

.loading {
    opacity: 0.6;
    pointer-events: none;
}

/* Loading Screen */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-container {
    text-align: center;
}

.loading-logo {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.loading-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #d4af37, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.loading-subtitle {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.8;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(212, 175, 55, 0.3);
    border-top: 4px solid #d4af37;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Login Screen */
.login-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    background: rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    min-width: 400px;
}

.login-logo {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.login-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #d4af37, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.login-form {
    margin-top: 2rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-input {
    width: 100%;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 1rem;
}

.form-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.login-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(45deg, #d4af37, #ffd700);
    color: #1a1a2e;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}

.login-btn:hover {
    transform: translateY(-2px);
}

/* Main App */
.main-app {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* Card Container */
.card-container {
    background: rgba(255, 255, 255, 0.1);
    padding: 2rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 2rem;
}

.prompt-section {
    margin-bottom: 2rem;
}

.prompt-input-container {
    position: relative;
    margin-bottom: 1rem;
}

.prompt-input {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 1rem;
    resize: vertical;
}

.prompt-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.char-count {
    font-size: 0.9rem;
    opacity: 0.7;
}

.char-count.warning {
    color: #ff6b6b;
}

.generate-btn {
    width: 100%;
    padding: 1rem 2rem;
    background: linear-gradient(45deg, #d4af37, #ffd700);
    color: #1a1a2e;
    border: none;
    border-radius: 10px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}

.generate-btn:hover {
    transform: translateY(-2px);
}

.generate-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Result Container */
.result-container {
    text-align: center;
    margin: 2rem 0;
}

.generated-card {
    display: inline-block;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-image {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Result Actions */
.result-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
}

.action-btn {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}

.download-btn {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
}

.create-another-btn {
    background: linear-gradient(45deg, #2196F3, #1976D2);
    color: white;
}

.action-btn:hover {
    transform: translateY(-2px);
}

/* Error Styles */
.error-container {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 10px;
    padding: 1rem;
    margin: 1rem 0;
    color: #ff6b6b;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Loading Overlay */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
}

/* Animations */
@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fade-in 0.3s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
    .main-app {
        padding: 1rem;
    }
    
    .card-container {
        padding: 1rem;
    }
    
    .login-container {
        min-width: auto;
        margin: 1rem;
        padding: 2rem;
    }
    
    .result-actions {
        flex-direction: column;
    }
}`;
    }
    
    /**
     * Generate CDK app
     */
    generateCDKApp() {
        return `#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnapMagicStack } from '../lib/snapmagic-stack';

const app = new cdk.App();
new SnapMagicStack(app, 'SnapMagicStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});`;
    }
    
    /**
     * Generate README
     */
    generateREADME() {
        return `# SnapMagic - Modular Architecture

This is the modular, refactored version of SnapMagic built with object-oriented principles and best practices.

## Architecture

### Backend (\`backend/\`)
- **BaseService**: Abstract base class for all services
- **AuthService**: Handles authentication and JWT tokens
- **CardService**: Manages card generation with Bedrock Nova Canvas
- **VideoService**: Handles video generation with Bedrock Nova Reel
- **lambda_handler**: Main orchestrator for all services

### Frontend (\`frontend/\`)
- **BaseComponent**: Abstract base class for all UI components
- **AuthComponent**: Manages user authentication and login
- **CardComponent**: Handles card generation and display
- **SnapMagicApp**: Main application orchestrator

### Shared (\`shared/\`)
- **types**: TypeScript type definitions
- **constants**: Application-wide constants
- **utils**: Reusable utility functions

## Key Improvements

1. **Modular Design**: Each component has a single responsibility
2. **Object-Oriented**: Proper inheritance and encapsulation
3. **Error Handling**: Comprehensive error management
4. **Type Safety**: TypeScript definitions for better development
5. **Maintainability**: Clean, documented, and testable code
6. **Reusability**: Shared utilities and base classes

## Deployment

1. Build the application:
   \`\`\`bash
   node build.js
   \`\`\`

2. Deploy backend:
   \`\`\`bash
   cd dist/infrastructure
   npm install
   cdk deploy
   \`\`\`

3. Deploy frontend:
   \`\`\`bash
   cd dist/frontend
   npm install
   npm start
   \`\`\`

## Development

The modular architecture makes it easy to:
- Add new features by extending base classes
- Test individual components in isolation
- Maintain and debug specific functionality
- Scale the application with new services

## Best Practices Implemented

- Single Responsibility Principle
- Open/Closed Principle
- Dependency Injection
- Error Boundaries
- Logging and Monitoring
- Configuration Management
- Resource Cleanup`;
    }
    
    /**
     * Generate architecture documentation
     */
    generateArchitectureDoc() {
        return `# SnapMagic Architecture Documentation

## Overview

SnapMagic has been refactored into a modular, object-oriented architecture that follows SOLID principles and best practices for maintainability and scalability.

## Component Hierarchy

### Backend Services

\`\`\`
BaseService (Abstract)
├── AuthService
├── CardService
└── VideoService
\`\`\`

### Frontend Components

\`\`\`
BaseComponent (Abstract)
├── AuthComponent
├── CardComponent
└── VideoComponent (future)
\`\`\`

## Design Patterns Used

1. **Template Method Pattern**: BaseService defines the common workflow
2. **Observer Pattern**: Event-driven communication between components
3. **Factory Pattern**: Service instantiation in the main handler
4. **Singleton Pattern**: Global app instance management

## Error Handling Strategy

- Centralized error logging
- User-friendly error messages
- Graceful degradation
- Automatic retry mechanisms

## Performance Optimizations

- Lazy loading of components
- Debounced user inputs
- Efficient DOM manipulation
- Resource cleanup on destroy

## Security Measures

- Input validation and sanitization
- Token-based authentication
- CORS configuration
- Error message sanitization

## Testing Strategy

- Unit tests for individual components
- Integration tests for service interactions
- End-to-end tests for user workflows
- Mock services for isolated testing`;
    }
}

// Run the build if this script is executed directly
if (require.main === module) {
    const builder = new SnapMagicBuilder();
    builder.build();
}

module.exports = SnapMagicBuilder;
