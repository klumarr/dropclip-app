import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { UserType } from "./types/auth.types";

// Protected route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
}> = ({ children, allowedUserTypes }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" />;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<div>Sign In</div>} />
        <Route path="/signup" element={<div>Sign Up</div>} />
        <Route path="/confirm-signup" element={<div>Confirm Sign Up</div>} />
        <Route path="/reset-password" element={<div>Reset Password</div>} />
        <Route
          path="/confirm-reset-password"
          element={<div>Confirm Reset Password</div>}
        />

        {/* Protected routes */}
        <Route
          path="/creative/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={[UserType.CREATIVE]}>
              <div>Creative Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fan/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={[UserType.FAN]}>
              <div>Fan Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>Profile</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div>Settings</div>
            </ProtectedRoute>
          }
        />

        {/* Default routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate
                to={
                  user?.userType === UserType.CREATIVE
                    ? "/creative/dashboard"
                    : "/fan/dashboard"
                }
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </React.Suspense>
  );
};
