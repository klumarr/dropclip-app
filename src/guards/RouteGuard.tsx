import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserType } from "../types/auth.types";
import { Box, CircularProgress } from "@mui/material";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredUserTypes?: UserType[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredUserTypes,
}) => {
  const { isAuthenticated, userAttributes, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log("🔒 RouteGuard Mount:", {
      path: currentPath,
      timestamp: new Date().toISOString(),
    });

    console.log("🔑 Auth State:", {
      isAuthenticated,
      userType: userAttributes?.userType,
      isLoading,
      requiredTypes: requiredUserTypes,
    });

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log(
          "❌ Not authenticated, redirecting to signin from:",
          currentPath
        );
        navigate("/auth/signin", { replace: true });
        return;
      }

      if (
        requiredUserTypes &&
        userAttributes?.userType &&
        !requiredUserTypes.includes(userAttributes.userType)
      ) {
        console.log("⚠️ User type not allowed:", {
          current: userAttributes.userType,
          required: requiredUserTypes,
          path: currentPath,
        });
        navigate("/dashboard", { replace: true });
        return;
      }

      console.log("✅ Access granted to:", currentPath);
    }
  }, [isAuthenticated, userAttributes, isLoading, requiredUserTypes, navigate]);

  if (isLoading) {
    console.log("⏳ Loading auth state...");
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
