HANDOVER_BRIEF_2025_01_20_V1.md

# Project Handover Brief - DropClip

Version: 1.0
Date: January 20, 2025
Time: [Current Time]

## Project Overview

DropClip is a video-sharing platform connecting performers/artists with their fans for event video sharing and management. The application is built using React 18.2.0, TypeScript 5.3, and Material-UI v5, with AWS integrations.

## Current Development Status

We are working on improving various components and functionalities:

1. Authentication system enhancements
2. User profile management improvements
3. Event sharing and management features
4. Side menu and navigation optimizations

## Key Files for Context

### Core Configuration

1. `src/config/routes.config.tsx` - Main routing configuration
2. `src/config/dynamodb.ts` - DynamoDB configuration and table definitions
3. `.env` - Environment configuration
4. `vite.config.ts` - Build and development configuration

### Authentication & User Management

1. `src/contexts/AuthContext.tsx` - Main authentication context
2. `src/services/auth.service.ts` - Authentication service implementation
3. `src/services/user.service.ts` - User management service
4. `src/types/auth.types.ts` - Authentication type definitions

### Event Management

1. `src/contexts/EventsContext.tsx` - Event management context
2. `src/services/eventsService.ts` - Event service implementation
3. `src/types/events.types.ts` - Event type definitions
4. `src/components/events/creative/EventActions/ShareMenu.tsx` - Event sharing functionality

### Layout Components

1. `src/components/layout/MainLayout.tsx` - Main application layout
2. `src/components/layout/Header.tsx` - Application header
3. `src/components/layout/SideMenu.tsx` - Side navigation menu

### Profile Management

1. `src/pages/profile/ProfilePage.tsx` - User profile page
2. `src/pages/profile/EditProfilePage.tsx` - Profile editing functionality
3. `src/services/profile-image.service.ts` - Profile image management

## Recent Changes and Current Focus

1. Authentication improvements:

   - Enhanced user type switching
   - Improved session management
   - Better error handling

2. Profile management:

   - Profile image upload optimization
   - Social links management
   - User type-specific profile fields

3. Event sharing:
   - Multiple sharing platform support
   - QR code generation
   - Deep linking implementation

## Known Issues

1. TypeScript linter error in AuthContext regarding 'picture' property
2. Some AWS credential handling optimizations needed
3. Profile image upload error handling improvements needed

## AWS Infrastructure

1. DynamoDB tables:

   - Users
   - Events
   - Uploads
   - Follows
   - Collections

2. S3 Buckets:

   - Profile images
   - Event flyers
   - Video uploads

3. IAM Policies:
   - Authenticated user policy
   - Unauthenticated user policy

## Next Steps

1. Resolve AuthContext TypeScript issues
2. Implement remaining profile management features
3. Optimize event sharing functionality
4. Enhance error handling across services

## Development Environment Setup

1. Node.js version: 18.19.0
2. npm version: >=8.0.0
3. Required environment variables as per `.env` file
4. AWS credentials configuration

## Testing Requirements

1. Jest with TestType system
2. E2E test suite
3. Component-level tests
4. AWS integration tests

## Additional Resources

1. `PROJECT_DEFINITION.ts` - Core project definition and requirements
2. `docs/features/` - Feature documentation
3. `docs/architecture/` - Architecture documentation
4. `TESTING_DEVELOPMENT_GUIDE.md` - Testing guidelines

## Contact Information

[Add relevant team member contact information]

## Version Control

- Repository: [Add repository URL]
- Main branch: main
- Development branch: develop

## Deployment Information

- Development environment: [Add URL]
- Staging environment: [Add URL]
- Production environment: [Add URL]

This brief provides a comprehensive overview of the current state of the DropClip project and should be sufficient to continue development in a new chat session.
