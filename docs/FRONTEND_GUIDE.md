# DropClip Frontend Development Guide

## Overview

This guide outlines the frontend development standards and best practices for the DropClip application.

## Technology Stack

### Core Technologies

- React 18.2.0
- TypeScript 5.3
- Material-UI v5
- React Router v6

### Development Tools

- ESLint
- Prettier
- Jest
- React Testing Library

## Project Structure

```
src/
├── components/
│   ├── common/         # Reusable components
│   ├── layout/         # Layout components
│   ├── features/       # Feature components
│   └── video/          # Video-related components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/             # State management
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Component Guidelines

### Component Structure

```typescript
import React from "react";
import { styled } from "@mui/material/styles";

interface Props {
  title: string;
  onAction: () => void;
}

const StyledComponent = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
}));

export const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  return (
    <StyledComponent>
      <h1>{title}</h1>
      <button onClick={onAction}>Click me</button>
    </StyledComponent>
  );
};
```

### Styling Approach

1. Use Material-UI styled components
2. Follow theme specifications
3. Implement responsive design
4. Support dark theme only

# DropVid Frontend Guide

## Design System

### Colors

```typescript
const theme = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#9c27b0",
    light: "#ba68c8",
    dark: "#7b1fa2",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
    dark: "#121212",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "rgba(0, 0, 0, 0.6)",
    disabled: "rgba(0, 0, 0, 0.38)",
  },
};
```

### Typography

```typescript
const typography = {
  h1: {
    fontSize: "2.5rem",
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.43,
  },
};
```

### Spacing

```typescript
const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
};
```

## Layout Structure

### App Layout

```typescript
interface AppLayout {
  header: {
    height: "64px";
    position: "fixed";
    zIndex: 1100;
  };
  sidebar: {
    width: "240px";
    collapsedWidth: "64px";
  };
  main: {
    minHeight: "calc(100vh - 64px)";
    paddingTop: "64px";
  };
}
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};
```

## Component Organization

### Core Components

1. **Navigation**

   - `Header`: Main navigation bar
   - `Sidebar`: Collapsible side navigation
   - `BottomNav`: Mobile navigation bar

2. **Authentication**

   - `Login`: Login form with new password flow
   - `Register`: Registration form
   - `PasswordReset`: Password reset flow
   - `EmailVerification`: Email verification component

3. **Video Components**

   - `VideoPlayer`: Custom video player
   - `VideoUploader`: Upload interface with progress
   - `VideoThumbnail`: Video preview component
   - `VideoGrid`: Grid layout for video lists

4. **User Interface**
   - `Profile`: User profile display
   - `ProfileEdit`: Profile editing form
   - `EventCard`: Event display card
   - `PlaylistCard`: Playlist display card

### Layout Components

1. **Containers**

   - `PageContainer`: Standard page wrapper
   - `ContentContainer`: Content section wrapper
   - `GridContainer`: Responsive grid system

2. **Common Elements**
   - `LoadingSpinner`: Loading indicator
   - `ErrorBoundary`: Error handling wrapper
   - `ConfirmDialog`: Confirmation dialogs
   - `Snackbar`: Toast notifications

## Page Layouts

### Dashboard

```typescript
interface DashboardLayout {
  header: HeaderComponent;
  sidebar: SidebarComponent;
  main: {
    stats: StatsSection;
    recentVideos: VideoGridComponent;
    upcomingEvents: EventListComponent;
  };
}
```

### Profile Page

```typescript
interface ProfileLayout {
  header: HeaderComponent;
  profile: {
    banner: BannerComponent;
    info: ProfileInfoComponent;
    tabs: {
      videos: VideoGridComponent;
      playlists: PlaylistGridComponent;
      events: EventGridComponent;
    };
  };
}
```

### Event Page

```typescript
interface EventLayout {
  header: HeaderComponent;
  event: {
    details: EventDetailsComponent;
    videos: VideoGridComponent;
    sharing: SharingComponent;
  };
}
```

## Styling Guidelines

### Material-UI Usage

1. Use `sx` prop for component-specific styling
2. Use `styled` components for reusable styles
3. Use theme variables for consistency
4. Follow Material Design principles

### CSS Organization

1. Component-specific styles in component file
2. Shared styles in theme configuration
3. Global styles in global.css
4. Use CSS-in-JS with emotion

### Mobile-First Approach

1. Design for mobile first
2. Add breakpoints for larger screens
3. Use responsive units (rem, %, vh/vw)
4. Test on multiple screen sizes

## Component States

### Loading States

```typescript
interface LoadingStates {
  initial: "idle";
  loading: "loading";
  success: "success";
  error: "error";
}
```

### Error States

```typescript
interface ErrorStates {
  type: "warning" | "error" | "info";
  message: string;
  action?: () => void;
}
```

## Animation Guidelines

### Transitions

```typescript
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
};
```

### Motion

1. Use subtle animations
2. Keep transitions under 300ms
3. Use easing functions
4. Respect reduced motion preferences

## Accessibility Guidelines

1. Use semantic HTML
2. Maintain proper heading hierarchy
3. Include ARIA labels
4. Ensure keyboard navigation
5. Test with screen readers
6. Support high contrast mode

## Performance Optimization

1. Lazy load components
2. Use React.memo for expensive renders
3. Implement virtual scrolling for lists
4. Optimize images and media
5. Monitor bundle size

## Testing Components

1. Write unit tests for logic
2. Use React Testing Library
3. Test user interactions
4. Verify accessibility
5. Test responsive behavior

## Documentation Standards

1. Document props with TypeScript
2. Include usage examples
3. Document state management
4. Maintain style guide
5. Update component library

## Routes and Navigation

### Main Routes

```typescript
interface AppRoutes {
  "/": DashboardPage;
  "/login": LoginPage;
  "/search": SearchPage;
  "/profile": ProfilePage;
  "/events": EventsPage;
  "/playlists": PlaylistsPage;
}
```

### Protected Routes

```typescript
interface ProtectedRoute {
  isAuthenticated: boolean;
  redirectTo: string;
  children: React.ReactNode;
}
```

## Video Player Components

### Main Video Player

```typescript
interface VideoPlayer {
  open: boolean;
  onClose: () => void;
  video?: {
    title: string;
    creator: string;
    url: string;
    thumbnail: string;
  };
}
```

### Video Controls

```typescript
interface VideoControls {
  playing: boolean;
  muted: boolean;
  volume: number;
  progress: number;
  duration: number;
  currentTime: number;
  playbackSpeed: number;
  quality: string;
  isFullscreen: boolean;
  isPiPActive: boolean;
  repeatMode: "none" | "all" | "one";
  shuffle: boolean;
  captionsEnabled: boolean;
  availableQualities: string[];
}
```

### Video Queue

```typescript
interface VideoQueue {
  open: boolean;
  videos: Video[];
  currentVideoId: string;
  onVideoSelect: (videoId: string) => void;
  onQueueReorder: (videos: Video[]) => void;
  onRemoveFromQueue: (videoId: string) => void;
}
```

### Video Social Features

```typescript
interface VideoSocialFeatures {
  videoId: string;
  comments: Comment[];
  reactions: {
    likes: Reaction;
  };
  onAddComment: (text: string) => void;
  onReact: () => void;
  onShare: (timestamp?: number) => void;
  onCreateClip: (start: number, end: number) => void;
}
```

### Video Analytics

```typescript
interface VideoAnalytics {
  views: number;
  likes: number;
  shares: number;
  averageWatchTime: number;
  retentionRate: number;
  engagementRate: number;
  chapters: Chapter[];
}
```

## Layout Components

### App Layout

```typescript
interface AppLayoutProps {
  header: {
    height: string;
    position: "fixed";
    zIndex: number;
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
    breakpoint: "sm" | "md" | "lg";
  };
  main: {
    paddingTop: string;
    paddingBottom: string;
    minHeight: string;
  };
  videoPreviewBar: {
    height: string;
    position: "fixed";
    bottom: number;
  };
}
```

### Mobile Header

```typescript
interface MobileHeaderProps {
  onMenuClick: () => void;
  user?: {
    email: string;
    avatar?: string;
  };
}
```

### Bottom Navigation

```typescript
interface BottomNavProps {
  items: {
    label: string;
    icon: React.ReactNode;
    path: string;
    showFor: "all" | "creative" | "fan";
  }[];
}
```

## Authentication Components

### Login Flow

```typescript
interface LoginProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  redirectPath?: string;
}
```

### Protected Route

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  roles?: ("creative" | "fan")[];
}
```

## Theme Configuration

### Dark Mode

```typescript
const darkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: "#9D4EDD",
      light: "#C77DFF",
      dark: "#7B2CBF",
    },
    background: {
      default: "#000000",
      paper: "#121212",
    },
  },
};
```

### Custom Components

```typescript
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: "#9D4EDD40 #000000",
        "&::-webkit-scrollbar": {
          width: 12,
        },
        "&::-webkit-scrollbar-track": {
          background: "#000000",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#9D4EDD40",
          borderRadius: 6,
          border: "3px solid #000000",
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 500,
        padding: "8px 32px",
      },
    },
  },
};
```

## Mobile Responsiveness

### Breakpoints

```typescript
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};
```

### Responsive Utilities

```typescript
const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  return { isMobile, isTablet, isDesktop };
};
```

## Testing Guidelines

### Component Testing

```typescript
interface ComponentTest {
  render: () => void;
  userInteraction: () => void;
  accessibility: () => void;
  responsiveness: () => void;
  errorHandling: () => void;
}
```

### Integration Testing

````typescript
interface IntegrationTest {
  userFlow: () => void;
  dataFlow: () => void;
  errorScenarios: () => void;
  performance: () => void;
}

## State Management

### Local State
```typescript
const [state, setState] = useState<StateType>({
  loading: false,
  error: null,
  data: null,
});
````

### Custom Hooks

```typescript
const useVideoPlayer = (videoId: string) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => setPlaying(!playing);
  const updateProgress = (value: number) => setProgress(value);

  return { playing, progress, togglePlay, updateProgress };
};
```

## Type Definitions

### Common Types

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  uploadedBy: User;
}
```

### Type Utilities

```typescript
type Nullable<T> = T | null;
type AsyncResponse<T> = Promise<{
  data: T;
  error?: string;
}>;
```

## Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
try {
  const response = await api.videos.upload(file);
  handleSuccess(response);
} catch (error) {
  handleError(error as ApiError);
}
```

## Performance Optimization

### Code Splitting

```typescript
const VideoPlayer = React.lazy(() => import("./VideoPlayer"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <VideoPlayer />
    </Suspense>
  );
}
```

### Memoization

```typescript
const MemoizedComponent = React.memo(({ data }) => (
  <div>{/* Render content */}</div>
));

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

## Testing

### Component Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";

describe("VideoPlayer", () => {
  it("plays video on button click", () => {
    render(<VideoPlayer url="test.mp4" />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByRole("video")).toHaveAttribute("playing");
  });
});
```

### Hook Tests

```typescript
import { renderHook, act } from "@testing-library/react-hooks";

test("useVideoPlayer hook", () => {
  const { result } = renderHook(() => useVideoPlayer("test-id"));
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.playing).toBe(true);
});
```

## Accessibility

### ARIA Labels

```typescript
<button aria-label="Play video" aria-pressed={playing} onClick={togglePlay}>
  {playing ? "Pause" : "Play"}
</button>
```

### Keyboard Navigation

```typescript
const handleKeyPress = (event: React.KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    togglePlay();
  }
};
```

## Documentation

### Component Documentation

```typescript
/**
 * VideoPlayer component for playing video content
 * @param {string} url - The video URL
 * @param {boolean} autoPlay - Whether to autoplay the video
 * @param {(progress: number) => void} onProgress - Progress callback
 */
```

### Code Comments

```typescript
// Format duration to MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
```

## Best Practices

1. Use TypeScript strictly
2. Follow component composition
3. Implement proper error handling
4. Write comprehensive tests
5. Maintain code documentation

## Development Workflow

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Create pull request

## Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Material-UI Documentation](https://mui.com/)
- [Testing Library](https://testing-library.com/)

## Auth Types

Creating auth types file with necessary interfaces.

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: UserData) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
}
```
