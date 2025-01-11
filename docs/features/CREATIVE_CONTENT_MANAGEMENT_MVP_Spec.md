# Creative Content Management - MVP Specification

## Overview

Essential tools for creatives to manage and utilize fan-uploaded content effectively, focusing on core functionality that delivers immediate value.

## Core MVP Features

### 1. Basic Content Dashboard

- List view of uploads by event
- Basic sorting (date, event)
- Simple filtering (approved/pending/rejected)
- Individual content preview
- Basic content status management

Implementation:

- Single dashboard view component
- Integration with existing upload system
- Basic filtering service
- Content preview component

### 2. Essential Moderation Tools

- Approve/Reject functionality
- Basic content review interface
- Simple moderation queue
- Individual content actions

Implementation:

- Moderation status in existing uploads table
- Simple moderation interface
- Basic action tracking
- Integration with upload service

### 3. Simple Notification System

- Basic email notifications for new uploads
- In-app notification counter
- Simple notification preferences

Implementation:

- Use existing AWS SES
- Basic notification state management
- Simple preferences in user settings

### 4. Core Management Features

- View uploads by event
- Basic content status updates
- Simple export functionality
- Individual content sharing

Implementation:

- Event-based content view
- Status update functionality
- Basic export service
- Share link generation

## MVP Database Requirements

Extend existing tables:

- Add moderation status to uploads table
- Add notification preferences to user table
- Add basic analytics fields to events table

## MVP Infrastructure

Utilize existing:

- AWS S3 for storage
- DynamoDB for data
- Basic email service
- Existing authentication

## Testing Requirements

- Upload management tests
- Moderation flow tests
- Basic notification tests
- Content sharing tests

## Success Metrics

- Upload management time
- Moderation completion rate
- Content usage rate
- User engagement

## Future Expansion

- Advanced filtering
- Batch operations
- Advanced analytics
- Team collaboration
- Custom collections
- Advanced notification options

## File Structure Organization

```
src/
├── pages/
│   └── creative/
│       ├── dashboard/
│       │   ├── ContentDashboard.tsx       # Main dashboard view
│       │   ├── EventContent.tsx           # Event-specific content view
│       │   └── components/
│       │       ├── ContentList.tsx        # Reusable content list
│       │       ├── ContentPreview.tsx     # Content preview modal
│       │       └── FilterBar.tsx          # Basic filtering controls
│       └── moderation/
│           ├── ModerationQueue.tsx        # Moderation main view
│           └── components/
│               ├── ContentReview.tsx      # Individual content review
│               └── ActionButtons.tsx      # Moderation action controls
├── components/
│   └── content/
│       ├── ContentCard.tsx                # Reusable content display
│       ├── StatusBadge.tsx               # Content status indicator
│       └── ShareButton.tsx               # Basic sharing functionality
├── services/
│   ├── content.service.ts                # Content management operations
│   ├── moderation.service.ts             # Moderation operations
│   └── notification.service.ts           # Basic notification handling
├── hooks/
│   ├── useContentManagement.ts           # Content management logic
│   ├── useModeration.ts                  # Moderation state and actions
│   └── useNotifications.ts               # Notification handling
└── types/
    ├── content.types.ts                  # Content-related types
    └── moderation.types.ts               # Moderation-related types
```

## Implementation Phases

### Phase 1: Core Dashboard Setup (Days 1-2)

1. **Create Base Components**

   - Set up dashboard layout with Material-UI
   - Implement basic content list with virtualization
   - Create content preview component with video player
   - Add simple filtering with status and date filters

2. **Content Service Integration**

   - Extend existing upload service for content management
   - Add content status management (pending/approved/rejected)
   - Implement basic filtering logic
   - Create content retrieval methods with pagination

3. **Basic UI Implementation**
   - Responsive content list view
   - Status indicators with color coding
   - Basic sorting by date and status
   - Preview modal with content details

### Phase 2: Moderation Tools (Days 3-4)

1. **Moderation Infrastructure**

   - Add moderation status to DynamoDB uploads table
   - Create moderation queue service with prioritization
   - Implement action tracking with timestamps
   - Set up basic email notifications

2. **Moderation Interface**
   - Queue view with pending content
   - Review interface with content preview
   - Action buttons (approve/reject)
   - Status update notifications

### Phase 3: Integration & Polish (Days 5-7)

1. **Navigation Integration**

   - Add dashboard to main navigation menu
   - Create nested route structure
   - Set up role-based access control
   - Add breadcrumb navigation

2. **Notification Setup**
   - AWS SES email notifications
   - In-app notification counter
   - Basic preference toggles
   - Status update alerts

## Core Type Definitions

```typescript
interface Content {
  id: string;
  eventId: string;
  uploaderId: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  metadata: {
    fileSize: number;
    duration: number;
    format: string;
  };
}

interface ModerationAction {
  contentId: string;
  action: "approve" | "reject";
  moderatorId: string;
  timestamp: string;
  reason?: string;
}

interface NotificationPreference {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    newUploads: boolean;
    moderationActions: boolean;
    systemAlerts: boolean;
  };
}
```

## Integration Points

### Database Extensions

```typescript
// Add to existing uploads table
interface UploadItem {
  // ... existing fields
  moderationStatus: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  reviewedBy?: string;
}

// Add to users table
interface UserPreferences {
  // ... existing fields
  notifications: NotificationPreference;
}

// Add to events table
interface EventAnalytics {
  totalUploads: number;
  pendingUploads: number;
  approvedUploads: number;
  rejectedUploads: number;
  lastUploadAt?: string;
}
```

### API Extensions

```typescript
interface ContentAPI {
  "/api/content/list": {
    GET: {
      params: {
        eventId?: string;
        status?: string;
        page?: number;
        limit?: number;
      };
      response: {
        items: Content[];
        total: number;
        hasMore: boolean;
      };
    };
  };
  "/api/content/update": {
    POST: {
      body: {
        contentId: string;
        status: string;
        reason?: string;
      };
      response: {
        success: boolean;
        content: Content;
      };
    };
  };
  "/api/moderation/queue": {
    GET: {
      params: {
        limit?: number;
        offset?: number;
      };
      response: {
        items: Content[];
        total: number;
      };
    };
  };
}
```

## Development Guidelines

### Component Development

1. Start with basic functionality

   - Focus on core features first
   - Add enhancements iteratively
   - Maintain consistent UI patterns
   - Use Material-UI components

2. Error Handling

   - Implement error boundaries
   - Add loading states
   - Show user-friendly error messages
   - Include retry mechanisms

3. Performance
   - Use virtualization for lists
   - Implement pagination
   - Optimize image/video loading
   - Cache API responses

### Testing Strategy

1. **Unit Tests**

   - Component rendering tests
   - Service method tests
   - Hook behavior tests
   - Utility function tests

2. **Integration Tests**

   - API integration tests
   - Service interactions
   - State management tests
   - Event handling tests

3. **E2E Tests**
   - Critical user flows
   - Content management flow
   - Moderation workflow
   - Notification delivery

## Progress Tracking

### Phase 1 Checklist

- [ ] Dashboard layout implementation
- [ ] Content list component
- [ ] Preview functionality
- [ ] Basic filtering
- [ ] Service integration
- [ ] Initial tests

### Phase 2 Checklist

- [ ] Moderation queue setup
- [ ] Review interface
- [ ] Action handling
- [ ] Notification basics
- [ ] Integration tests
- [ ] Performance tests

### Phase 3 Checklist

- [ ] Navigation integration
- [ ] Route setup
- [ ] Access control
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Final testing
- [ ] Documentation

## Deployment Strategy

1. **Staging Deployment**

   - Deploy to staging environment
   - Run integration tests
   - Verify AWS services
   - Test notifications

2. **Production Release**
   - Gradual rollout
   - Monitor performance
   - Track error rates
   - Gather user feedback

## Success Metrics Tracking

1. **Performance Metrics**

   - Dashboard load time < 2s
   - List scroll performance
   - Preview load time
   - API response times

2. **User Engagement**

   - Time to moderate content
   - Notification interaction rate
   - Feature usage statistics
   - Error occurrence rate

3. **System Health**
   - API success rate
   - AWS service metrics
   - Error logging
   - Performance monitoring

Simple Notification System:
Email Client Configuration:
You're right to consider this. Without an email client configured, implementing email notifications would be premature
However, we can still design and implement the notification system's infrastructure (database tables, triggers, etc.)
This way, when you're ready to add email functionality, the underlying system will be ready
For now, we could implement in-app notifications that would later be extended to email
Email Frequency Management:
Here are some suggested approaches to make notifications less invasive:
Digest Mode: Bundle notifications into daily/weekly summaries
Threshold-Based: Only send when reaching X number of new uploads
Time-Window: Combine all notifications within a specific timeframe (e.g., 4-hour window)
Priority Levels: Let creatives set different notification levels for different events
Critical: Immediate notification (e.g., flagged content)
Standard: Daily digest (e.g., new uploads)
Low: Weekly summary (e.g., statistics)
Push Notifications:
Web Push Notifications are possible for web apps using the Push API and Service Workers
This would work in modern browsers that support these features
Key considerations:
Requires HTTPS
User must explicitly grant permission
Not all browsers support it (especially Safari has limitations)
Works even when the browser is closed
Can be implemented using libraries like web-push
Before proceeding with implementation, I'd recommend:
Start with in-app notifications first (shown in the UI)
Add web push notifications as an enhancement
Leave email integration for later when you have the email client configured

Let me outline an MVP-level in-app notification system that's both useful and manageable:

1. Core Notification Types:
   Upload Status Changes (pending → approved/rejected)
   New Fan Uploads (grouped by event)
   System Alerts (important updates or issues)
   Moderation Queue Updates (when queue reaches certain threshold)
2. Notification Display:
   Bell icon in the top navigation bar
   Counter badge showing unread notifications
   Dropdown menu showing latest notifications (last 10-15)
   Separate "All Notifications" page for history
   Simple "Mark as Read" functionality
3. Notification Storage:
   Basic notification structure:
   {
   id: string
   userId: string
   type: 'upload' | 'moderation' | 'system'
   status: 'read' | 'unread'
   title: string
   message: string
   timestamp: Date
   actionUrl?: string // Link to relevant page
   metadata?: {
   eventId?: string
   uploadId?: string
   count?: number // For grouped notifications
   }
   }
4. Notification Grouping (MVP Level):
   Group similar notifications within a 24-hour window
   Example: "5 new uploads for Event X" instead of 5 separate notifications
   Collapse older notifications automatically
   Keep critical notifications separate
5. User Preferences (Simple Version):
   Toggle notifications by type
   Mark all as read
   Clear all notifications
   No complex frequency settings for MVP
6. Real-time Updates:
   Use existing WebSocket connection if available
   Fallback to polling every 30-60 seconds if WebSocket isn't available
7. Retention Policy:
   Keep last 30 days of notifications
   Auto-delete older notifications
   Keep important system notifications longer

This approach gives us:
Immediate value for users
Manageable complexity
Foundation for future enhancements
No dependency on email configuration
Clear upgrade path for future features

## Implementation Update (January 6th, 2025)

### Completed Features

#### 1. Content Processing Infrastructure

- Implemented comprehensive processing pipeline:
  - Video processing status tracking
  - Thumbnail generation
  - Quality variants creation
  - Metadata extraction
  - Progress monitoring
  - Error handling and recovery

#### 2. Content Preview System

- Created preview functionality:
  ```typescript
  interface PreviewFeatures {
    videoPlayer: {
      controls: boolean;
      quality: string[];
      thumbnails: string[];
    };
    metadata: {
      duration: number;
      resolution: string;
      format: string;
    };
    status: {
      processing: boolean;
      progress: number;
      error?: string;
    };
  }
  ```

#### 3. Download Management

- Implemented download features:
  - Quality selection
  - Progress tracking
  - Analytics integration
  - Error handling
  - Notification system
  - Mobile optimization

### Component Implementation

1. Processing Components:

   - VideoProcessingPreview
   - ProcessingStatus
   - ThumbnailGenerator
   - QualitySelector
   - ErrorHandler

2. Download Components:

   - VideoDownload
   - QualityPicker
   - ProgressTracker
   - DownloadButton
   - ErrorDisplay

3. Notification Integration:
   - Status updates
   - Progress notifications
   - Error alerts
   - Completion notifications
   - Batch updates

### Technical Achievements

1. AWS Integration:

   - Enhanced S3 operations
   - Improved DynamoDB usage
   - Better error handling
   - Secure URL generation
   - Access control

2. User Experience:

   - Real-time updates
   - Visual feedback
   - Error recovery
   - Mobile responsiveness
   - Accessibility

3. Performance:
   - Optimized processing
   - Efficient polling
   - Resource management
   - Error handling
   - Mobile optimization

### Next Steps

1. Immediate Priorities:

   - Testing implementation
   - Performance optimization
   - Mobile enhancements
   - Analytics setup
   - Documentation

2. Future Enhancements:
   - Batch operations
   - Advanced analytics
   - Offline support
   - Mobile features
   - AI integration

### Progress Against MVP Requirements

1. Completed:

   - Processing pipeline
   - Preview system
   - Download management
   - Notification system
   - Basic analytics

2. In Progress:

   - Advanced analytics
   - Batch operations
   - Mobile optimization
   - Performance tuning
   - Documentation

3. Upcoming:
   - Enhanced features
   - Advanced tools
   - Integration expansion
   - Platform scaling
   - AI features

## Implementation Update (January 6th, 2025)

### Completed Features

#### 1. Upload Management Dashboard

- Implemented comprehensive upload management system:
  ```typescript
  interface UploadManagement {
    features: {
      statusTracking: boolean; // Track upload status across events
      batchOperations: boolean; // Delete multiple uploads
      filteringOptions: boolean; // Filter by date, type, status
      detailedView: boolean; // View upload details
      replaceUpload: boolean; // Replace existing uploads
    };
    display: {
      gridView: boolean; // Grid layout for uploads
      listView: boolean; // List view option
      thumbnailPreview: boolean; // Preview thumbnails
      progressTracking: boolean; // Show upload progress
    };
  }
  ```

#### 2. AWS S3 Integration

- Enhanced AWS S3 integration:
  - Secure file uploads
  - Proper file deletion
  - Thumbnail management
  - File replacement functionality
  - Upload status tracking

#### 3. Content Organization

- Implemented content organization tools:
  - Status-based tabs (Pending, Approved, Rejected)
  - File type and date range filtering
  - Search functionality
  - Batch delete operations
  - Upload replacement capability
  - Detailed upload information view

### Technical Achievements

1. Infrastructure:

   - Proper AWS S3 configuration
   - Efficient file management
   - Secure upload handling
   - Status tracking system

2. User Interface:

   - Intuitive dashboard layout
   - Responsive design
   - Clear status indicators
   - Easy-to-use filters
   - Batch operations support

3. Performance:
   - Optimized file uploads
   - Efficient status updates
   - Quick thumbnail loading
   - Smooth transitions

### Next Steps

1. Immediate Priorities:

   - Implement video management center
   - Add content organization tools
   - Enhance batch operations
   - Improve mobile experience

2. Future Enhancements:
   - Advanced filtering options
   - Custom views and layouts
   - Enhanced analytics
   - Additional batch operations
   - AI-powered features

This update reflects significant progress in implementing the content management system, with a focus on user experience and AWS integration. The dashboard provides a solid foundation for managing uploads efficiently while maintaining scalability for future enhancements.
