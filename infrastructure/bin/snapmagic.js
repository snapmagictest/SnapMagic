#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const snapmagic_stack_1 = require("../lib/snapmagic-stack");
const app = new cdk.App();
// Get environment from context or default to dev
const environment = app.node.tryGetContext('environment') || 'dev';
new snapmagic_stack_1.SnapMagicStack(app, `SnapMagic-${environment}`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
    environment: environment,
    tags: {
        Project: 'SnapMagic',
        Environment: environment,
        ManagedBy: 'CDK'
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcG1hZ2ljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic25hcG1hZ2ljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsNERBQXdEO0FBRXhELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLGlEQUFpRDtBQUNqRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUM7QUFFbkUsSUFBSSxnQ0FBYyxDQUFDLEdBQUcsRUFBRSxhQUFhLFdBQVcsRUFBRSxFQUFFO0lBQ2xELEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtRQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxXQUFXO0tBQ3REO0lBQ0QsV0FBVyxFQUFFLFdBQVc7SUFDeEIsSUFBSSxFQUFFO1FBQ0osT0FBTyxFQUFFLFdBQVc7UUFDcEIsV0FBVyxFQUFFLFdBQVc7UUFDeEIsU0FBUyxFQUFFLEtBQUs7S0FDakI7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgU25hcE1hZ2ljU3RhY2sgfSBmcm9tICcuLi9saWIvc25hcG1hZ2ljLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuLy8gR2V0IGVudmlyb25tZW50IGZyb20gY29udGV4dCBvciBkZWZhdWx0IHRvIGRldlxuY29uc3QgZW52aXJvbm1lbnQgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCdlbnZpcm9ubWVudCcpIHx8ICdkZXYnO1xuXG5uZXcgU25hcE1hZ2ljU3RhY2soYXBwLCBgU25hcE1hZ2ljLSR7ZW52aXJvbm1lbnR9YCwge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OIHx8ICd1cy1lYXN0LTEnLFxuICB9LFxuICBlbnZpcm9ubWVudDogZW52aXJvbm1lbnQsXG4gIHRhZ3M6IHtcbiAgICBQcm9qZWN0OiAnU25hcE1hZ2ljJyxcbiAgICBFbnZpcm9ubWVudDogZW52aXJvbm1lbnQsXG4gICAgTWFuYWdlZEJ5OiAnQ0RLJ1xuICB9XG59KTtcbiJdfQ==