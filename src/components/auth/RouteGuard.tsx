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
  const currentPath = location.pathname;

  // Prevent infinite loops by checking if we're already on the signin page
  const isAuthPath = currentPath.startsWith("/auth/");

  console.log("🔒 RouteGuard Check:", {
    isAuthenticated,
    isLoading,
    userType: user?.userType,
    allowedUserTypes,
    currentPath,
    isAuthPath,
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

  // If not authenticated and not already on an auth path, redirect to signin
  if (!isAuthenticated && !isAuthPath) {
    console.log("⚠️ User not authenticated, redirecting to signin");
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // If authenticated but wrong user type, redirect to appropriate dashboard
  if (isAuthenticated && user && !allowedUserTypes.includes(user.userType)) {
    const redirectPath =
      user.userType === UserType.CREATIVE
        ? "/creative/dashboard"
        : "/fan/search";

    console.log(`⚠️ Wrong user type, redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and correct user type, render children
  if (isAuthenticated && user && allowedUserTypes.includes(user.userType)) {
    console.log("✅ Access granted to:", currentPath);
    return <>{children}</>;
  }

  // Default case - show loading
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
};

export default RouteGuard;
