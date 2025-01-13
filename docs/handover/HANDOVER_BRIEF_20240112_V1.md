# DropClip Events Page Implementation - Handover Brief

Version: 1.0
Date: January 12, 2024

## Current Project Status

We are implementing a new Events Page for the DropClip application, specifically for creative users. The page has been moved to the creative section and includes basic CRUD operations with a focus on clean UI and proper error handling.

## Recent Accomplishments

1. Successfully implemented basic list view for events
2. Added delete functionality with confirmation dialog
3. Restored action buttons with animations
4. Fixed IAM permissions for DynamoDB operations
5. Corrected import paths after moving to creative section

## Current Implementation Details

- Location: Events page is now in `src/pages/creative/EventsPage.tsx`
- Current Features:
  - Event list with sorting and filtering
  - Delete functionality with confirmation
  - Floating action button with animations
  - Success/error alerts
  - Basic error handling

## Key Files to Scan

1. `src/pages/creative/EventsPage.tsx`

   - Main events page component
   - Contains event management logic and UI

2. `src/components/events/creative/EventList/index.tsx`

   - Handles event list display
   - Implements sorting and filtering

3. `src/components/events/creative/ActionButtons/index.tsx`

   - Floating action button implementation
   - Create event and scan flyer options

4. `src/components/events/creative/DeleteConfirmationDialog/index.tsx`

   - Delete confirmation dialog
   - Loading state handling

5. `src/contexts/EventsContext.tsx`

   - Events state management
   - CRUD operations for events

6. `src/types/events.ts`

   - Type definitions for events
   - Interface definitions

7. `src/config/routes.config.tsx`
   - Routing configuration
   - Events page integration

## Current Infrastructure

- DynamoDB Table: `dev-events`
  - Composite key: `id` (partition), `creativeId` (sort)
- IAM Role: `dropclip-creative-role`
  - Has three inline policies:
    - `creative-base-policy`
    - `creative-index-policy`
    - `creative-write-policy` (recently updated with all DynamoDB actions)

## Next Steps in Progress

1. Implementing edit functionality

   - Reuse existing create event dialog
   - Add loading states
   - Implement optimistic updates

2. Enhancing create event functionality

   - Integrate with action button
   - Add form validation
   - Handle file uploads

3. Adding scan flyer feature
   - Implement scanning logic
   - Handle image processing
   - Update event creation flow

## Known Issues/Considerations

1. Event form needs to handle overnight events properly
2. Need to implement proper validation for event fields
3. Consider implementing websockets for real-time updates
4. May need to adjust cache duration for event fetching

## Roadmap Reference

The implementation follows the roadmap in `NEWER_EVENTS_PAGE_MVP.md`, currently focusing on core functionality and basic UI implementation.

## Testing Instructions

1. Check event list display and filtering
2. Test delete functionality with confirmation
3. Verify action button animations
4. Confirm proper error handling
5. Test authentication state handling

## Event Type Structure

```typescript
interface Event {
  id: string;
  creativeId: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  eventType: string;
  tags?: string[];
  flyerUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

## AWS Configuration Notes

- Region: eu-north-1
- Table Name: dev-events
- Identity Pool: Used for authentication
- S3 Bucket: Configured for flyer uploads

## Development Environment

- Node.js version: 18.19.0
- TypeScript version: 5.3
- React version: 18.2.0
- Material-UI version: v5
- AWS SDK: Latest version

## Contact Information

For any questions about this implementation, please refer to the project documentation or reach out to the development team.
