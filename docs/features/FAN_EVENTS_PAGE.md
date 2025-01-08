# Fan Events Page Architecture

## Overview

The Fan Events Page serves as a personalized event discovery and management hub, focusing on events from followed creatives while enabling discovery of new artists through event collaborations.

## Database Schema

### Events Table (existing)

```typescript
interface Event {
  event_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  flyer_url: string;
  ticket_url?: string;
  created_by: string; // creative_id
  status: "upcoming" | "past";
  created_at: string;
  updated_at: string;
}
```

### Event Collaborators Table (new)

```typescript
interface EventCollaborator {
  event_id: string;
  creative_id: string;
  role: string; // e.g., 'headliner', 'support', 'guest'
  set_time?: string;
  created_at: string;
}
```

### Saved Events Table (new)

```typescript
interface SavedEvent {
  fan_id: string;
  event_id: string;
  saved_at: string;
  notification_preferences: {
    updates: boolean;
    reminders: boolean;
    videos: boolean;
  };
}
```

### Event Playlists Table (new)

```typescript
interface EventPlaylist {
  playlist_id: string;
  event_id: string;
  title: string;
  description: string;
  created_by: string; // creative_id
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
}
```

## Component Structure

```
src/
├── pages/
│   ├── fan/
│   │   ├── EventsPageFan.tsx               # Main events page
│   │   ├── EventDetailsPage.tsx            # Detailed event view
│   │   └── EventVideosPage.tsx             # Event videos/playlists
├── components/
│   ├── events/
│   │   ├── fan/
│   │   │   ├── FanEventCard.tsx            # Event card for fans
│   │   │   ├── EventCollaborators.tsx      # Collaborators list
│   │   │   ├── SaveEventButton.tsx         # Save functionality
│   │   │   ├── EventTicketButton.tsx       # Ticket link
│   │   │   ├── EventPlaylistGrid.tsx       # Playlists display
│   │   │   └── CollaboratorProfile.tsx     # Mini profile card
│   │   └── shared/
│   │       ├── EventFilters.tsx            # Filter controls
│   │       └── EventTabs.tsx               # Tab navigation
├── services/
│   ├── event.service.ts                    # Event data handling
│   ├── playlist.service.ts                 # Playlist management
│   └── collaborator.service.ts             # Collaborator data
```

## Core Features

### 1. Event Discovery

#### Personalized Feed

- Events from followed creatives
- Collaborative events featuring followed creatives
- Location-based recommendations
- Genre-based suggestions

#### Filter System

- Upcoming/Past tabs
- Saved events filter
- Date range selection
- Location radius
- Genre/type filtering

### 2. Event Interaction

#### Save Functionality

- One-click save/unsave
- Notification preferences
- Custom reminders
- Share options
- Add to calendar

#### Ticket Integration

- Direct ticket link
- Price comparison
- Availability status
- Group booking options
- Ticket type selection

### 3. Collaborator Discovery

#### Artist Network

- Collaborator profiles
- Genre tags
- Similar artists
- Previous collaborations
- Upcoming events

## Enhancement Ideas

### 1. Smart Event Recommendations

Pros:

- Personalized discovery
- Increased engagement
- Better user retention
- Data-driven suggestions
- Cross-pollination of audiences

Cons:

- Algorithm complexity
- Data privacy concerns
- Processing overhead
- Cold start problem
- Maintenance complexity

### 2. Event Social Features

Pros:

- Community building
- Viral marketing potential
- Increased engagement
- Social proof
- User-generated content

Cons:

- Moderation needs
- Privacy concerns
- Feature complexity
- Server load
- UI clutter

### 3. Dynamic Ticket Integration

Pros:

- Real-time availability
- Price comparison
- Seamless purchase
- Commission potential
- Better user experience

Cons:

- API dependencies
- Technical complexity
- Maintenance overhead
- Partner agreements
- Support requirements

### 4. Event Reminders & Notifications

Pros:

- Better engagement
- Attendance rates
- User convenience
- Marketing opportunities
- Data collection

Cons:

- Push notification fatigue
- Implementation complexity
- Server resources
- User permissions
- Battery impact

### 5. Interactive Event Maps

Pros:

- Visual discovery
- Location context
- Route planning
- Venue information
- Area exploration

Cons:

- API costs
- Performance impact
- Data maintenance
- Mobile optimization
- Complexity

### 6. Event Chat/Discussion

Pros:

- Community engagement
- Real-time interaction
- Information sharing
- Artist interaction
- Event buzz

Cons:

- Moderation needs
- Infrastructure costs
- Feature complexity
- Privacy concerns
- Resource intensive

### 7. Event Analytics for Fans

Pros:

- Personalized insights
- Attendance tracking
- Spending analysis
- Genre preferences
- Social connections

Cons:

- Data privacy
- Storage requirements
- Processing overhead
- UI complexity
- Implementation effort

### 8. Collaborative Event Planning

Pros:

- Group coordination
- Shared expenses
- Social engagement
- Better organization
- Feature differentiation

Cons:

- Complex permissions
- Group dynamics
- Technical complexity
- Support needs
- Feature bloat

### 9. Event Memory Timeline

Pros:

- Personal history
- Content organization
- Social sharing
- Engagement driver
- Emotional connection

Cons:

- Storage requirements
- Implementation complexity
- Privacy management
- Performance impact
- Data organization

### 10. AI Event Assistant

Pros:

- Personalized help
- Quick answers
- 24/7 availability
- Reduced support load
- Enhanced UX

Cons:

- Development cost
- Maintenance overhead
- Training requirements
- Error potential
- Resource intensive

## Database Strategy

### 1. Core Tables

#### Events

- Primary event information
- Status tracking
- Location data
- Ticket information
- Media links

#### Event_Collaborators

- Artist relationships
- Role definitions
- Performance details
- Contact information
- Social links

#### Saved_Events

- User preferences
- Notification settings
- Interaction history
- Custom notes
- Sharing status

### 2. Indexing Strategy

#### Primary Indexes

- event_id
- creative_id
- fan_id
- date
- location

#### Secondary Indexes

- status
- genre
- venue
- ticket_status
- saved_status

### 3. Query Optimization

#### Common Queries

```sql
-- Get upcoming events for followed creatives
SELECT e.*
FROM events e
JOIN follows f ON e.created_by = f.creative_id
WHERE f.fan_id = :fan_id
  AND e.date > NOW()
  AND e.status = 'upcoming'
ORDER BY e.date ASC;

-- Get collaborator details for event
SELECT c.*, u.name, u.profile_pic
FROM event_collaborators ec
JOIN creatives c ON ec.creative_id = c.id
JOIN users u ON c.user_id = u.id
WHERE ec.event_id = :event_id;

-- Get saved events
SELECT e.*
FROM events e
JOIN saved_events se ON e.id = se.event_id
WHERE se.fan_id = :fan_id
ORDER BY e.date DESC;
```

## Next Steps

1. Database Implementation

   - Create new tables
   - Set up indexes
   - Implement triggers
   - Test queries
   - Optimize performance

2. Core Features

   - Event discovery
   - Save functionality
   - Collaborator system
   - Filter implementation
   - Basic UI

3. Priority Enhancements

   - Smart recommendations
   - Event reminders
   - Basic social features
   - Interactive maps
   - Analytics foundation

4. Testing & Optimization
   - Performance testing
   - Load testing
   - UI/UX testing
   - Mobile testing
   - Security audit

This document will be updated as implementation progresses and new requirements are identified.

## Implementation Plan - Basic Fan Events Page (v1.0)

### Phase 1: Core Page Setup

1. Create Route & Component Structure

   - Add `/fan/events` route in `src/App.tsx`
   - Create `src/pages/fan/EventsPageFan.tsx` as main container
   - Update post-login navigation to redirect to `/fan/events` instead of `/fan/search`

2. Integrate Existing Services

   - Leverage `AttendanceService` for event attendance status
   - Use `FollowService` for following status
   - Utilize `EventService` for event fetching
   - Connect `NotificationService` for event updates

3. Basic UI Components (Initial Version)
   ```
   EventsPageFan
   ├── EventFilters (simple version)
   │   ├── Upcoming/Past toggle
   │   └── Following filter
   ├── EventGrid
   │   └── EventCard
   │       ├── Event details
   │       ├── Attendance status
   │       └── Creative info with follow status
   └── LoadingState
   ```

### Phase 2: Data Integration

1. Main Query Implementation

   ```typescript
   // Core data fetch combining existing services
   const fetchFollowedEvents = async (userId: string) => {
     // Get followed creatives
     const follows = await followService.getFollowing(userId);

     // Fetch events from followed creatives
     const events = await Promise.all(
       follows.map((follow) =>
         eventService.getEventsByCreative(follow.creativeId)
       )
     );

     // Get attendance status for events
     const attendance = await attendanceService.getAttendanceForUser(userId);

     return correlateEventData(events, attendance);
   };
   ```

2. State Management
   - Use React Query for data fetching and caching
   - Implement basic filters in local state
   - Store attendance/follow updates optimistically

### Phase 3: MVP Features

1. Essential Features

   - View events from followed creatives
   - Display attendance status
   - Show following status for creatives
   - Basic event filtering (upcoming/past)
   - Loading states and error handling

2. Event Card Actions

   - Toggle attendance status
   - View event details
   - Quick access to creative profile

3. Performance Considerations
   - Implement pagination
   - Cache followed creatives list
   - Optimize attendance status updates

### Integration Points

1. Existing Components to Reuse

   - `EventCard` from search page (enhance with attendance)
   - `FollowButton` from creative profiles
   - `LoadingSpinner` from shared components
   - `ErrorBoundary` from shared components

2. Service Enhancements Needed

   ```typescript
   // Add to EventService
   getEventsByCreatives(creativeIds: string[]): Promise<EventItem[]>

   // Add to AttendanceService
   getMultipleEventStatus(userId: string, eventIds: string[]): Promise<Map<string, string>>
   ```

3. New Types Required
   ```typescript
   interface EnhancedEventItem extends EventItem {
     attendanceStatus?: "attending" | "not_attending";
     creative: {
       id: string;
       name: string;
       isFollowing: boolean;
     };
   }
   ```

### Testing Strategy

1. Unit Tests

   - Event fetching logic
   - Data correlation functions
   - Filter implementations

2. Integration Tests

   - Service interactions
   - Component rendering
   - User interactions

3. Test Cases
   - Events load correctly for followed creatives
   - Attendance status displays accurately
   - Following status shows correctly
   - Filters work as expected
   - Error states handled properly

### Next Steps

1. Immediate Actions

   - Create basic page structure
   - Implement core data fetching
   - Add essential UI components
   - Setup basic routing

2. Follow-up Tasks

   - Add more sophisticated filters
   - Enhance event cards
   - Implement real-time updates
   - Add event notifications

3. Future Enhancements
   - Location-based filtering
   - Advanced search capabilities
   - Social features
   - Event recommendations

This implementation plan focuses on getting a functional MVP that allows fans to view and interact with events from creatives they follow, while laying the groundwork for more advanced features in the future.
