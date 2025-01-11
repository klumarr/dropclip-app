# Linting Issues to Fix - January 9th, 2025

## Overview

During the Identity Pool migration push, several linting issues were identified. This document tracks these issues for future fixing.

## Issues by Category

### Unused Imports

1. Components:

   - `src/components/events/creative/CreateEventDialog/CreateEventForm.tsx`: Unused `FormHelperText`
   - `src/components/events/creative/EventActions/index.tsx`: Unused `Button`
   - `src/components/layout/SideMenu.tsx`: Multiple unused imports (Person, AccountCircle, etc.)

2. Services:
   - `src/services/events.service.ts`: Unused `BatchGetCommand`
   - `src/services/notification.service.ts`: Unused `AWS_REGION`
   - `src/services/video-processing.service.ts`: Multiple unused imports

### Type Safety Issues

1. Any Types to Fix:

   - `src/config/aws-client.config.ts`: Lines 38, 164
   - `src/services/aws-client.factory.ts`: Lines 36, 76, 86
   - `src/polyfills.ts`: Multiple any types

2. Unused Variables:
   - `src/pages/creative/EventsPageCreative.tsx`: Multiple unused state variables
   - `src/pages/creative/MemoryManagerPage.tsx`: Unused theme and rejectedUploads

### React Hooks Issues

1. Missing Dependencies:
   - `src/contexts/NotificationContext.tsx`: useEffect missing fetchNotifications
   - `src/pages/DownloadCenterPage.tsx`: useEffect missing loadUploads
   - `src/pages/creative/VideoUploadPage.tsx`: useCallback missing fetchStorageQuota

### Fast Refresh Warnings

1. Component Export Issues:
   - `src/config/routes.config.tsx`: Multiple fast refresh warnings
   - `src/contexts/EventsContext.tsx`: Export components warning

## Priority Order

1. Type Safety Issues (High Priority)
2. Unused Imports (Medium Priority)
3. React Hooks Issues (Medium Priority)
4. Fast Refresh Warnings (Low Priority)

## Next Steps

1. Create separate branches for each category of fixes
2. Implement fixes with proper testing
3. Update documentation as needed
4. Create PRs for review

## Notes

- Total Issues: 165 (137 errors, 28 warnings)
- Some issues may be fixed automatically using `--fix` option
- Consider updating ESLint rules for specific cases
- Review TypeScript configuration for stricter type checking
