import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import RouteGuard from "../components/auth/RouteGuard";
import { UserType } from "../types/auth.types";
import { ErrorBoundary } from "../components/error/ErrorBoundary";
import { LoadingState } from "../components/common/LoadingState";

// Lazy load all pages
const SignInPage = lazy(() => import("../pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/creative/DashboardPage"));
const VideosPage = lazy(() => import("../pages/creative/VideosPage"));
const VideoUploadPage = lazy(() => import("../pages/creative/VideoUploadPage"));
const EventsPage = lazy(() => import("../pages/creative/EventsPage"));
const AnalyticsPage = lazy(() => import("../pages/creative/AnalyticsPage"));
const SettingsPage = lazy(() => import("../pages/creative/SettingsPage"));
const MemoryManagerPage = lazy(
  () => import("../pages/creative/MemoryManagerPage")
);
const SearchPage = lazy(() => import("../pages/fan/SearchPage"));
const EventsPageFan = lazy(() => import("../pages/fan/EventsPageFan"));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState message="Loading page..." />}>
    {children}
  </Suspense>
);

export const routes = [
  {
    path: "/",
    element: <Navigate to="/auth/signin" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth",
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "signin",
        element: (
          <SuspenseWrapper>
            <SignInPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "signup",
        element: (
          <SuspenseWrapper>
            <SignUpPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "reset-password",
        element: (
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "/creative",
    element: (
      <RouteGuard allowedUserTypes={[UserType.CREATIVE]}>
        <MainLayout />
      </RouteGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "videos",
        element: (
          <SuspenseWrapper>
            <VideosPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "videos/upload",
        element: (
          <SuspenseWrapper>
            <VideoUploadPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "events",
        element: (
          <SuspenseWrapper>
            <EventsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <AnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "memories",
        element: (
          <SuspenseWrapper>
            <MemoryManagerPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "/fan",
    element: (
      <RouteGuard allowedUserTypes={[UserType.FAN, UserType.CREATIVE]}>
        <MainLayout />
      </RouteGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <Navigate to="search" replace />,
      },
      {
        path: "search",
        element: (
          <SuspenseWrapper>
            <SearchPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "events",
        element: (
          <SuspenseWrapper>
            <EventsPageFan />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/signin" replace />,
    errorElement: <ErrorBoundary />,
  },
];
