# DropClip Project Context - January 5th, 2025

## Project Overview

DropClip is a single-page application built with React 18.2.0, TypeScript 5.3, and Material-UI v5. The project integrates with AWS services and uses Firebase for authentication. We are currently refactoring the Events Page system, focusing on modularizing the EventsPageCreative component.

## Current Development Status

### Active Focus

1. **Component Modularization**

   - Breaking down EventsPageCreative into smaller components
   - Implementing context-based state management
   - Ensuring TypeScript type safety

2. **Current Challenges**
   - Resolving QRDialog linter errors
   - Completing event sharing functionality
   - Finalizing modular component integration

### Important Files Structure

```
src/contexts/EventsContext/
├── index.tsx        # Main context implementation
├── types.ts         # Type definitions
├── reducer.ts       # State management reducer

src/components/events/creative/
├── EventsList/
│   ├── index.tsx
│   ├── EventsGrid.tsx
│   └── types.ts
├── EventActions/
│   ├── index.tsx
│   ├── ShareMenu.tsx
│   ├── DeleteDialog.tsx
│   ├── QRDialog.tsx
│   └── types.ts
├── CreateEventDialog/
│   ├── index.tsx
│   ├── CreateEventForm.tsx
│   ├── ImageUpload.tsx
│   └── types.ts
└── FlyerScanner/
    ├── index.tsx
    └── types.ts

src/hooks/
├── useEventActions.ts
├── useEventForm.ts
├── useEventScanner.ts
└── useImageUpload.ts
```

### Recent Major Changes

1. EventsPageCreative component split into modules
2. New event management context system
3. Custom hooks implementation
4. Comprehensive TypeScript types
5. Enhanced UI with grid layout
6. Improved mobile responsiveness

### Current Branch Information

- Branch: development-3
- Status: Event page split (some linter issues pending)

### Immediate Tasks

1. **Linter Error Resolution**

   - QRDialog: QRCode type issues
   - EventsGrid.tsx: Unused variables
   - CreateEventDialog/index.tsx: Type definitions
   - EventActions/index.tsx: Unused imports

2. **Implementation Completion**
   - Event sharing functionality
   - QR code generation/download
   - Image upload handling
   - Event deletion confirmation

## Technical Architecture

### State Management

- EventsContext for centralized state
- Reducer pattern for state updates
- Custom hooks for specific operations

### Component Architecture

- Modular components with type definitions
- Shared utilities and hooks
- Error boundaries
- Loading states

### Technology Stack

- React 18.2.0
- TypeScript 5.3
- Material-UI v5
- AWS SDK
- Firebase Authentication
- PostgreSQL
- Jest with TestType

### Development Guidelines

1. Strict modular architecture
2. Dedicated type definitions required
3. Mobile-first approach
4. Error boundaries mandatory
5. Loading states required
6. AWS integration via API Gateway

### AWS Integration

- Configurations centralized in main.tsx
- API Gateway for backend communication
- S3 for file storage
- Cognito for authentication
- DynamoDB for data persistence

## Latest Version Information

Current Version: 1.3.0 (January 5th, 2025)

### Recent Updates

- Comprehensive Events Page Modularization
- Enhanced State Management
- UI/UX Improvements
- Architecture Refactoring
- Technical Improvements
- Security Enhancements

## Development Process

### Code Quality Standards

1. TypeScript strict mode enabled
2. ESLint configuration
3. Proper error handling
4. Loading state implementation
5. Mobile responsiveness
6. Component documentation

### Testing Requirements

1. Jest with TestType system
2. Component unit tests
3. Integration tests
4. Error boundary testing
5. Mobile responsiveness testing

### Security Considerations

1. Role-based access control
2. Secure event sharing
3. Deletion confirmation
4. Unauthorized action handling
5. Data validation

## Next Steps

1. Review changelog in docs/CHANGELOG.md
2. Scan key files listed above
3. Check current linter errors
4. Review EventsContext implementation
5. Examine component hierarchy

## Additional Notes

- AWS configurations in main.tsx
- Material-UI v5 for styling
- Firebase authentication
- PostgreSQL database
- TestType system guidelines
