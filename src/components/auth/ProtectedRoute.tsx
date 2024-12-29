import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserType } from "../../types/auth.types";

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

  // For protected routes, redirect to login if not authenticated
  if (!isPublic && !isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type if required
  if (requiredUserType && userAttributes?.userType !== requiredUserType) {
    console.log(
      `User type ${userAttributes?.userType} does not match required type ${requiredUserType}`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
