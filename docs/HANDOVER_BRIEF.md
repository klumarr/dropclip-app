# DropClip Development Handover Brief

January 7, 2025

## Current Focus

We are currently working on resolving authentication and AWS service access patterns, specifically:

1. Migrating from direct AWS credentials to Cognito Identity Pool for all AWS service access
2. Resolving notification system issues
3. Implementing proper security patterns for API access

## Recent Changes and Updates

### 1. Documentation Created/Updated

- `API_MIGRATION_PLAN.md`: Details migration from direct DynamoDB access to API Gateway
- `COLLECTIONS_AND_PLAYLISTS.md`: Defines distinction between collections and playlists
- `API_AND_DATABASE_ACCESS_PATTERNS.md`: Documents current and planned access patterns
- `PERMISSIONS_AND_ROLES.md`: Details IAM roles and permissions structure

### 2. Key Issues Identified

- Using hardcoded AWS credentials in `.env` file (security risk)
- Mixed authentication patterns between direct DynamoDB access and API Gateway
- Inconsistent security model across different services
- Notification system access issues

### 3. Ongoing Implementation Work

- Planning Identity Pool implementation for all AWS service access
- Removing direct AWS credentials
- Updating IAM roles and permissions
- Enhancing security patterns

## Key Files to Review

### Configuration Files

1. `src/config/aws-client.config.ts`

   - Current AWS client configuration
   - DynamoDB client setup
   - Table name definitions

2. `src/config/aws-config.ts` and `aws-config.ts`

   - Amplify configuration
   - Cognito setup

3. `.env`
   - Environment variables
   - AWS credentials (to be removed)
   - Service endpoints

### Service Files

1. `src/services/notification.service.ts`
   - Current notification implementation
   - Direct DynamoDB access patterns

### Type Definitions

1. `src/types/notification.types.ts`
   - Notification interfaces
   - Type definitions

### Documentation

1. `docs/architecture/API_AND_DATABASE_ACCESS_PATTERNS.md`

   - Current architecture analysis
   - Recommended changes
   - Implementation plans

2. `docs/architecture/API_MIGRATION_PLAN.md`

   - Detailed migration strategy
   - Phase-by-phase implementation plan

3. `docs/PERMISSIONS_AND_ROLES.md`
   - IAM role definitions
   - Permission structures
   - Security patterns

## Current Architecture State

### Authentication Flow

- Using Cognito User Pools for authentication
- Planning migration to Identity Pool for AWS service access
- Mixed use of direct AWS credentials and Cognito tokens

### Database Access

- Direct DynamoDB access for notifications
- API Gateway access for some operations
- Inconsistent access patterns need consolidation

### Security

- Currently using hardcoded AWS credentials (to be removed)
- Need to implement proper IAM roles through Identity Pool
- Require proper access scoping and permission boundaries

## Next Steps

1. **Immediate Actions**

   - Create Identity Pool implementation plan
   - Remove hardcoded AWS credentials
   - Update AWS client configuration

2. **Short-term Goals**

   - Implement Identity Pool for all AWS services
   - Update IAM roles and permissions
   - Test with both fan and creative roles

3. **Medium-term Goals**
   - Complete API Gateway migration
   - Implement WebSocket functionality
   - Enhance monitoring and logging

## Testing Requirements

### Authentication Testing

- Test fan role permissions
- Test creative role permissions
- Verify notification access
- Check upload permissions

### Security Testing

- Verify credential rotation
- Test permission boundaries
- Check access controls
- Validate token handling

## Additional Context

### Environment Setup

- Development environment using `dev-` prefixed resources
- Testing environment with proper IAM roles
- Local development setup with environment variables

### Known Issues

1. Notification access using direct DynamoDB calls
2. Mixed authentication patterns
3. Security concerns with hardcoded credentials

### Documentation Needs

1. Identity Pool implementation plan
2. Updated security documentation
3. Revised architecture diagrams

## Contact Points

- AWS Configuration: Check `aws-client.config.ts`
- Authentication: Review `auth.service.ts`
- Notifications: See `notification.service.ts`

## Recommended First Steps for New Session

1. Review `API_AND_DATABASE_ACCESS_PATTERNS.md`
2. Check current AWS configuration in `aws-client.config.ts`
3. Review Identity Pool implementation plan (to be created)
4. Examine current notification issues in `notification.service.ts`
