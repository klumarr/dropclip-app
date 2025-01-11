# AWS Cognito Authentication Implementation Plan

## Overview
This document outlines the implementation plan for AWS Cognito authentication in the DropVid application. It serves as a step-by-step guide and checklist for the authentication system implementation.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Core Types](#core-types)
3. [Implementation Phases](#implementation-phases)
4. [AWS Integration](#aws-integration)
5. [Security Measures](#security-measures)
6. [Testing Strategy](#testing-strategy)
7. [Implementation Checklist](#implementation-checklist)

## Project Structure
```typescript
src/
├── config/
│   └── aws/
│       ├── cognito.config.ts    // Cognito configuration
│       └── amplify.config.ts    // AWS Amplify setup
├── contexts/
│   ├── AuthContext.tsx          // Main auth context
│   ├── AuthProvider.tsx         // Provider with Cognito logic
│   └── useAuth.ts              // Custom auth hook
├── services/
│   └── auth.service.ts         // Cognito service methods
├── components/
│   └── auth/
│       ├── SignIn.tsx
│       ├── SignUp.tsx
│       ├── ForgotPassword.tsx
│       ├── VerifyEmail.tsx
│       ├── UserTypeSelect.tsx
│       ├── ProtectedRoute.tsx
│       ├── AuthGuard.tsx
│       └── RoleGuard.tsx
└── types/
    └── auth.types.ts           // Auth-related types
```

## Core Types

### User Attributes Interface
```typescript
interface UserAttributes {
  sub: string;              // Cognito user ID
  email: string;
  email_verified: boolean;
  'custom:userType': 'creative' | 'fan';
  'custom:creativeType'?: 'dj' | 'artist' | 'producer' | 'club' | 'festival';
  name?: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserAttributes | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (attributes: Partial<UserAttributes>) => Promise<void>;
}
```

## Implementation Phases

### Phase 1: Core Setup ⬜️

#### AWS Amplify Configuration
```typescript
// amplify.config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH'
  }
});
```

#### Environment Variables Setup ⬜️
```env
REACT_APP_AWS_REGION=your-region
REACT_APP_COGNITO_USER_POOL_ID=your-user-pool-id
REACT_APP_COGNITO_CLIENT_ID=your-client-id
```

#### Authentication Service Implementation ⬜️
```typescript
// auth.service.ts
import { Auth } from 'aws-amplify';

export const AuthService = {
  signIn: async (email: string, password: string) => {
    return Auth.signIn(email, password);
  },
  signUp: async (email: string, password: string, userType: string) => {
    return Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        'custom:userType': userType
      }
    });
  },
  getCurrentUser: async () => {
    return Auth.currentAuthenticatedUser();
  },
  signOut: async () => {
    return Auth.signOut();
  },
  resetPassword: async (email: string) => {
    return Auth.forgotPassword(email);
  }
};
```

### Phase 2: Protected Routes & Guards ⬜️

#### Protected Route Component ⬜️
```typescript
// components/auth/ProtectedRoute.tsx
const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

#### Role Guard Implementation ⬜️
```typescript
// components/auth/RoleGuard.tsx
const RoleGuard: React.FC<Props> = ({ userType, children }) => {
  const { user } = useAuth();
  
  if (user?.['custom:userType'] !== userType) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### Phase 3: UI Components ⬜️

#### Sign In Component ⬜️
- Email/Password form
- Error handling
- Loading states
- Remember me functionality
- Forgot password link

#### Sign Up Component ⬜️
- Registration form
- User type selection
- Email verification
- Creative type selection (for creative accounts)

#### Password Reset Flow ⬜️
- Request reset
- Verification code
- New password form

## AWS Integration

### S3 Integration ⬜️
```typescript
const getStorageAccess = async () => {
  const credentials = await Auth.currentCredentials();
  return new AWS.S3({
    credentials: Auth.essentialCredentials(credentials)
  });
};
```

### CloudFront Integration ⬜️
```typescript
const generateSignedUrl = async (key: string) => {
  const credentials = await Auth.currentCredentials();
  // Generate CloudFront signed URL logic
};
```

## Security Measures

### Token Management ⬜️
- Automatic token refresh
- Secure token storage
- Token validation

### Request Interceptors ⬜️
```typescript
API.interceptors.request.use(async config => {
  const session = await Auth.currentSession();
  const token = session.getIdToken().getJwtToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Testing Strategy

### Unit Tests ⬜️
```typescript
// __tests__/auth/cognito.service.test.ts
describe('CognitoService', () => {
  test('signIn should return user data', async () => {
    // Test implementation
  });
});
```

### Integration Tests ⬜️
```typescript
// __tests__/auth/auth.integration.test.ts
describe('Authentication Flow', () => {
  test('complete sign up flow', async () => {
    // Test implementation
  });
});
```

## Implementation Checklist

### Phase 1: Core Setup
- [ ] Install AWS Amplify dependencies
- [ ] Configure AWS Amplify
- [ ] Set up environment variables
- [ ] Implement Authentication service
- [ ] Create Auth context and provider
- [ ] Implement useAuth hook

### Phase 2: Protected Routes
- [ ] Create ProtectedRoute component
- [ ] Implement AuthGuard
- [ ] Create RoleGuard
- [ ] Set up route protection

### Phase 3: UI Components
- [ ] Implement SignIn component
- [ ] Create SignUp flow
- [ ] Add ForgotPassword functionality
- [ ] Implement email verification
- [ ] Add user type selection
- [ ] Create profile completion flow

### Phase 4: AWS Integration
- [ ] Set up S3 integration
- [ ] Configure CloudFront access
- [ ] Implement signed URL generation
- [ ] Add request interceptors

### Phase 5: Testing
- [ ] Write unit tests
- [ ] Create integration tests
- [ ] Add E2E test cases
- [ ] Test error scenarios
- [ ] Verify security measures

## Dependencies
```json
{
  "dependencies": {
    "aws-amplify": "^5.x.x",
    "@aws-amplify/ui-react": "^5.x.x"
  }
}
```

## Notes
- Keep track of progress by checking off completed items
- Update documentation as implementation progresses
- Add any additional requirements or changes as needed
- Document any deviations from the plan