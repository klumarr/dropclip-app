# DropClip Project Handover Brief - January 9, 2024 (v1)

## Document Information

- **Date**: January 9, 2024
- **Version**: 1.0
- **Project**: DropClip
- **Focus**: Event Creation Functionality
- **Status**: In Progress - Authentication Integration

## Current Status

We're working on fixing the Event Creation functionality in the DropClip application. The backend Lambda functions are working, but we're addressing issues with AWS Cognito authentication and frontend integration.

## Recent Changes

1. Removed Firebase references and migrated to AWS Cognito for authentication
2. Updated AWS configuration to use environment variables
3. Implemented proper credential handling with Cognito Identity Pool
4. Fixed Lambda function invocation with proper authentication

## Current Issues

1. Authentication token handling needs to be properly integrated with Amplify v6
2. Event creation form submission is failing with a 400 error
3. Need to ensure proper token passing from frontend to backend services

## Key Files to Scan

1. `src/aws-config.ts` - Contains AWS configuration and environment variables
2. `src/services/auth.service.ts` - Handles AWS credentials and Cognito authentication
3. `src/services/lambda.service.ts` - Manages Lambda function invocations
4. `src/services/eventsService.ts` - Handles event creation and management
5. `src/components/events/creative/CreateEventDialog/index.tsx` - Event creation form
6. `src/components/events/creative/EventsList/index.tsx` - Parent component for event management
7. `src/components/events/creative/ActionButtons.tsx` - Contains create event trigger
8. `src/contexts/EventsContext.tsx` - Manages event state and operations

## Environment Variables Required

```
VITE_AWS_REGION=eu-north-1
VITE_USER_POOL_ID=[your-user-pool-id]
VITE_USER_POOL_CLIENT_ID=[your-client-id]
VITE_IDENTITY_POOL_ID=[your-identity-pool-id]
VITE_AWS_S3_IMAGES_BUCKET=[your-bucket-name]
VITE_FUNCTION_PREFIX=dev
```

## Current Implementation Details

1. Using Amplify v6 for AWS integration
2. Cognito Identity Pool for secure AWS service access
3. Lambda functions for backend processing
4. S3 for image storage
5. Material-UI v5 for frontend components

## Next Steps

1. Complete the update of `eventsService.ts` to pass ID tokens to Lambda functions
2. Test the complete event creation flow with proper authentication
3. Implement proper error handling and user feedback
4. Verify image upload functionality with S3

## Recent AWS Testing Results

- Lambda functions are working (tested via AWS CLI)
- Cognito Identity Pool is configured but having token issuer mismatch
- S3 bucket is ready for image uploads

## Additional Context

- The application connects creatives with fans for event video sharing
- Currently focusing on the creative's event creation workflow
- Using TypeScript with strict type checking
- Following mobile-first design principles

## Important Notes

1. Firebase code has been removed in favor of AWS services
2. Lambda functions use the prefix format: `${VITE_FUNCTION_PREFIX}-${functionName}`
3. All AWS credentials are obtained through Cognito Identity Pool
4. The frontend is built with React 18.2.0 and TypeScript 5.3

## Technical Stack

- React 18.2.0
- TypeScript 5.3
- Material-UI v5
- AWS Services:
  - Cognito
  - Lambda
  - S3
  - Identity Pool
- Vite for build tooling

## Recent Code Changes

```typescript
// Key changes in auth.service.ts
export const getCredentials = async (idToken: string) => {
  // Implementation of Cognito Identity Pool credentials
};

// Key changes in lambda.service.ts
export const invokeLambda = async (
  functionName: string,
  payload: any,
  idToken: string
) => {
  // Implementation of Lambda invocation with credentials
};

// AWS configuration updates
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      // ... other configurations
    },
  },
};
```

## Known Working Components

- AWS Lambda backend functions
- Basic frontend routing
- Material-UI components integration
- AWS configuration structure

## Current Development Focus

Primary focus is on resolving the authentication flow and ensuring proper token handling between the frontend and AWS services.

---

_This document serves as a handover brief for the DropClip project's current state as of January 9, 2024. For historical context or previous versions, please refer to the docs/handover directory._
