import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserType } from "../../types/auth.types";
import { useEffect } from "react";

const LoadingContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: theme.palette.background.default,
}));

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
  isPublic?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredUserType,
  isPublic = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userAttributes } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute state:", {
      isAuthenticated,
      isLoading,
      isPublic,
      requiredUserType,
      userType: userAttributes?.userType,
      path: location.pathname,
    });
  }, [
    isAuthenticated,
    isLoading,
    isPublic,
    requiredUserType,
    userAttributes,
    location,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  // For public routes (like login/signup), redirect to dashboard if already authenticated
  if (isPublic && isAuthenticated) {
    console.log("User is authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // For protected routes, redirect to signin if not authenticated
  if (!isPublic && !isAuthenticated) {
    console.log("User not authenticated, redirecting to signin");
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  // Check user type if required
  if (requiredUserType && userAttributes?.userType !== requiredUserType) {
    console.log(
      `User type mismatch - Current: ${userAttributes?.userType}, Required: ${requiredUserType}`
    );
    // Instead of redirecting, we'll show an unauthorized message or redirect to a specific page
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          currentUserType: userAttributes?.userType,
          requiredUserType,
        }}
      />
    );
  }

  // If we get here, the user is authenticated and has the correct user type (if required)
  return <>{children}</>;
};
