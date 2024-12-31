import { Routes, Route, Navigate } from "react-router-dom";
import EventsPage from "./pages/EventsPage";
import EventManagementPage from "./pages/EventManagementPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SearchPage } from "./pages/SearchPage";
import { UploadPage } from "./pages/UploadPage";
import { LoginPage } from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserType } from "./types/auth.types";

export const AppRoutes = () => {
  console.log("AppRoutes rendering");
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <ProtectedRoute isPublic>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <ProtectedRoute isPublic>
            <SignUpPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute isPublic>
            <VerifyEmailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:eventId/manage"
        element={
          <ProtectedRoute requiredUserType={UserType.CREATIVE}>
            <EventManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute requiredUserType={UserType.CREATIVE}>
            <UploadPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
