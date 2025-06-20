"use strict";
// SnapMagic Application Configuration
// Edit this file to customize your deployment
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.getEnvironmentConfig = getEnvironmentConfig;
// Default Configuration
// Users can modify these values for their deployment
exports.defaultConfig = {
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
        nodeVersion: '22', // Node.js 22.x (required for CDK v2)
        buildTimeout: 15, // 15 minutes build timeout
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
function getEnvironmentConfig(environment = 'dev') {
    const config = { ...exports.defaultConfig };
    // Override app name with environment suffix
    config.app.name = `${exports.defaultConfig.app.name}-${environment}`;
    return config;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNDQUFzQztBQUN0Qyw4Q0FBOEM7OztBQStFOUMsb0RBT0M7QUFsREQsd0JBQXdCO0FBQ3hCLHFEQUFxRDtBQUN4QyxRQUFBLGFBQWEsR0FBb0I7SUFDNUMsVUFBVSxFQUFFO1FBQ1YsK0NBQStDO1FBQy9DLEdBQUcsRUFBRSw0Q0FBNEM7UUFDakQsTUFBTSxFQUFFLE1BQU07UUFDZCxrQkFBa0IsRUFBRSxJQUFJLEVBQUUscURBQXFEO0tBQ2hGO0lBRUQsR0FBRyxFQUFFO1FBQ0gsNEVBQTRFO1FBQzVFLElBQUksRUFBRSxXQUFXO1FBQ2pCLFdBQVcsRUFBRSxzREFBc0Q7UUFDbkUsMkVBQTJFO0tBQzVFO0lBRUQsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFLElBQUksRUFBTSxxQ0FBcUM7UUFDNUQsWUFBWSxFQUFFLEVBQUUsRUFBTywyQkFBMkI7UUFDbEQsV0FBVyxFQUFFLGNBQWMsRUFBRSw2QkFBNkI7S0FDM0Q7SUFFRCxZQUFZLEVBQUU7UUFDWixHQUFHLEVBQUU7WUFDSCxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsYUFBYTtZQUNwQixxRUFBcUU7WUFDckUsOERBQThEO1lBQzlELDhEQUE4RDtTQUMvRDtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLFNBQVM7U0FDakI7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsWUFBWTtZQUNsQixLQUFLLEVBQUUsWUFBWTtTQUNwQjtLQUNGO0NBQ0YsQ0FBQztBQUVGLHFEQUFxRDtBQUNyRCxTQUFnQixvQkFBb0IsQ0FBQyxjQUFzQixLQUFLO0lBQzlELE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxxQkFBYSxFQUFFLENBQUM7SUFFcEMsNENBQTRDO0lBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcscUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBRTdELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTbmFwTWFnaWMgQXBwbGljYXRpb24gQ29uZmlndXJhdGlvblxuLy8gRWRpdCB0aGlzIGZpbGUgdG8gY3VzdG9taXplIHlvdXIgZGVwbG95bWVudFxuXG5leHBvcnQgaW50ZXJmYWNlIFNuYXBNYWdpY0NvbmZpZyB7XG4gIC8vIEdpdEh1YiBSZXBvc2l0b3J5IENvbmZpZ3VyYXRpb25cbiAgcmVwb3NpdG9yeToge1xuICAgIHVybDogc3RyaW5nOyAgICAgICAgICAgLy8gR2l0SHViIHJlcG9zaXRvcnkgVVJMXG4gICAgYnJhbmNoOiBzdHJpbmc7ICAgICAgICAvLyBCcmFuY2ggdG8gZGVwbG95IGZyb21cbiAgICBjb25uZWN0QWZ0ZXJEZXBsb3k6IGJvb2xlYW47IC8vIENvbm5lY3QgcmVwb3NpdG9yeSBhZnRlciBDREsgZGVwbG95bWVudCAocmVjb21tZW5kZWQpXG4gIH07XG4gIFxuICAvLyBBcHBsaWNhdGlvbiBDb25maWd1cmF0aW9uXG4gIGFwcDoge1xuICAgIG5hbWU6IHN0cmluZzsgICAgICAgICAgLy8gQW1wbGlmeSBhcHAgbmFtZVxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7ICAgLy8gQXBwIGRlc2NyaXB0aW9uXG4gICAgZG9tYWluPzogc3RyaW5nOyAgICAgICAvLyBDdXN0b20gZG9tYWluIChvcHRpb25hbClcbiAgfTtcbiAgXG4gIC8vIEJ1aWxkIENvbmZpZ3VyYXRpb25cbiAgYnVpbGQ6IHtcbiAgICBub2RlVmVyc2lvbjogc3RyaW5nOyAgIC8vIE5vZGUuanMgdmVyc2lvbiBmb3IgYnVpbGRzXG4gICAgYnVpbGRUaW1lb3V0OiBudW1iZXI7ICAvLyBCdWlsZCB0aW1lb3V0IGluIG1pbnV0ZXNcbiAgICBjb21wdXRlVHlwZTogJ1NUQU5EQVJEXzhHQicgfCAnU1RBTkRBUkRfMTZHQic7IC8vIEJ1aWxkIGNvbXB1dGUgdHlwZVxuICB9O1xuICBcbiAgLy8gRW52aXJvbm1lbnQgQ29uZmlndXJhdGlvblxuICBlbnZpcm9ubWVudHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiB7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICBzdGFnZTogJ0RFVkVMT1BNRU5UJyB8ICdTVEFHSU5HJyB8ICdQUk9EVUNUSU9OJztcbiAgICAgIGVuYWJsZUJhc2ljQXV0aD86IGJvb2xlYW47XG4gICAgICBiYXNpY0F1dGhVc2VybmFtZT86IHN0cmluZztcbiAgICAgIGJhc2ljQXV0aFBhc3N3b3JkPzogc3RyaW5nO1xuICAgIH07XG4gIH07XG59XG5cbi8vIERlZmF1bHQgQ29uZmlndXJhdGlvblxuLy8gVXNlcnMgY2FuIG1vZGlmeSB0aGVzZSB2YWx1ZXMgZm9yIHRoZWlyIGRlcGxveW1lbnRcbmV4cG9ydCBjb25zdCBkZWZhdWx0Q29uZmlnOiBTbmFwTWFnaWNDb25maWcgPSB7XG4gIHJlcG9zaXRvcnk6IHtcbiAgICAvLyBDSEFOR0UgVEhJUzogUG9pbnQgdG8geW91ciBHaXRIdWIgcmVwb3NpdG9yeVxuICAgIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9zbmFwbWFnaWN0ZXN0L1NuYXBNYWdpYycsXG4gICAgYnJhbmNoOiAnbWFpbicsXG4gICAgY29ubmVjdEFmdGVyRGVwbG95OiB0cnVlLCAvLyBDb25uZWN0IG1hbnVhbGx5IHZpYSBBbXBsaWZ5IENvbnNvbGUgKHJlY29tbWVuZGVkKVxuICB9LFxuICBcbiAgYXBwOiB7XG4gICAgLy8gQ0hBTkdFIFRISVM6IEN1c3RvbWl6ZSB5b3VyIGFwcCBuYW1lIChtdXN0IGJlIHVuaXF1ZSBpbiB5b3VyIEFXUyBhY2NvdW50KVxuICAgIG5hbWU6ICdzbmFwbWFnaWMnLFxuICAgIGRlc2NyaXB0aW9uOiAnU25hcE1hZ2ljIC0gQUktcG93ZXJlZCB0cmFuc2Zvcm1hdGlvbiBmb3IgQVdTIGV2ZW50cycsXG4gICAgLy8gZG9tYWluOiAneW91ci1jdXN0b20tZG9tYWluLmNvbScsIC8vIFVuY29tbWVudCBhbmQgc2V0IGZvciBjdXN0b20gZG9tYWluXG4gIH0sXG4gIFxuICBidWlsZDoge1xuICAgIG5vZGVWZXJzaW9uOiAnMjInLCAgICAgLy8gTm9kZS5qcyAyMi54IChyZXF1aXJlZCBmb3IgQ0RLIHYyKVxuICAgIGJ1aWxkVGltZW91dDogMTUsICAgICAgLy8gMTUgbWludXRlcyBidWlsZCB0aW1lb3V0XG4gICAgY29tcHV0ZVR5cGU6ICdTVEFOREFSRF84R0InLCAvLyBTdGFuZGFyZCBidWlsZCBlbnZpcm9ubWVudFxuICB9LFxuICBcbiAgZW52aXJvbm1lbnRzOiB7XG4gICAgZGV2OiB7XG4gICAgICBuYW1lOiAnZGV2ZWxvcG1lbnQnLFxuICAgICAgc3RhZ2U6ICdERVZFTE9QTUVOVCcsXG4gICAgICAvLyBlbmFibGVCYXNpY0F1dGg6IHRydWUsICAgICAgICAgICAvLyBVbmNvbW1lbnQgdG8gZW5hYmxlIGJhc2ljIGF1dGhcbiAgICAgIC8vIGJhc2ljQXV0aFVzZXJuYW1lOiAnYWRtaW4nLCAgICAgIC8vIFNldCBiYXNpYyBhdXRoIHVzZXJuYW1lXG4gICAgICAvLyBiYXNpY0F1dGhQYXNzd29yZDogJ3Bhc3N3b3JkMTIzJyAvLyBTZXQgYmFzaWMgYXV0aCBwYXNzd29yZFxuICAgIH0sXG4gICAgc3RhZ2luZzoge1xuICAgICAgbmFtZTogJ3N0YWdpbmcnLFxuICAgICAgc3RhZ2U6ICdTVEFHSU5HJyxcbiAgICB9LFxuICAgIHByb2Q6IHtcbiAgICAgIG5hbWU6ICdwcm9kdWN0aW9uJyxcbiAgICAgIHN0YWdlOiAnUFJPRFVDVElPTicsXG4gICAgfVxuICB9XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZ2V0IGVudmlyb25tZW50LXNwZWNpZmljIGNvbmZpZ1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudmlyb25tZW50Q29uZmlnKGVudmlyb25tZW50OiBzdHJpbmcgPSAnZGV2Jyk6IFNuYXBNYWdpY0NvbmZpZyB7XG4gIGNvbnN0IGNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZyB9O1xuICBcbiAgLy8gT3ZlcnJpZGUgYXBwIG5hbWUgd2l0aCBlbnZpcm9ubWVudCBzdWZmaXhcbiAgY29uZmlnLmFwcC5uYW1lID0gYCR7ZGVmYXVsdENvbmZpZy5hcHAubmFtZX0tJHtlbnZpcm9ubWVudH1gO1xuICBcbiAgcmV0dXJuIGNvbmZpZztcbn1cbiJdfQ==