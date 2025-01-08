import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";
import { CircularProgress, Box } from "@mui/material";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedUserTypes: UserType[];
}

const RouteGuard = ({ children, allowedUserTypes }: RouteGuardProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("🔒 RouteGuard:", {
    isAuthenticated,
    isLoading,
    user,
    allowedUserTypes,
    pathname: location.pathname,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("⚠️ User not authenticated, redirecting to signin");
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (!allowedUserTypes.includes(user.userType)) {
    console.log("⚠️ User type not allowed, redirecting to dashboard");
    return (
      <Navigate
        to={
          user.userType === UserType.CREATIVE
            ? "/creative/dashboard"
            : "/fan/events"
        }
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
