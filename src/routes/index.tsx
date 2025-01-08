import { Routes, Route, Navigate } from "react-router-dom";
import { UserType } from "../types/auth.types";
import { RouteGuard } from "../guards/RouteGuard";
import { useAuth } from "../contexts/AuthContext";
import { lazy, Suspense } from "react";
import MainLayout from "../components/layout/MainLayout";

// Import named exports directly
import { DashboardPage } from "../pages/DashboardPage";
import { SearchPage } from "../pages/SearchPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TestComponentsPage } from "../pages/TestComponentsPage";
import UploadManagementDashboard from "../pages/fan/uploads";

// Lazy load components with default exports
const EventsPage = lazy(() => import("../pages/EventsPage"));
const PlaylistsPage = lazy(() => import("../pages/PlaylistsPage"));
const SignInPage = lazy(() => import("../pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("../pages/SignUpPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth/signin"
          element={
            !isAuthenticated ? <SignInPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/auth/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

        {/* Protected Routes - Wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <RouteGuard>
                <DashboardPage />
              </RouteGuard>
            }
          />
          <Route
            path="/events"
            element={
              <RouteGuard requiredUserTypes={[UserType.CREATIVE]}>
                <EventsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/search"
            element={
              <RouteGuard>
                <SearchPage />
              </RouteGuard>
            }
          />
          <Route
            path="/playlists"
            element={
              <RouteGuard>
                <PlaylistsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RouteGuard>
                <SettingsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/dashboard/test-components"
            element={
              <RouteGuard requiredUserTypes={[UserType.CREATIVE, UserType.FAN]}>
                <TestComponentsPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* Default Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/auth/signin" />
            )
          }
        />
        <Route path="/fan">
          <Route
            path="uploads"
            element={
              <RouteGuard>
                <UploadManagementDashboard />
              </RouteGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};
