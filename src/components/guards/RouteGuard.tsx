import React, { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";
import { useSignInModal } from "../../hooks/useSignInModal";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedUserTypes = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openSignInModal } = useSignInModal();

  const checkAccess = useCallback(() => {
    // Skip checks during loading or user type transition
    if (isLoading || sessionStorage.getItem("isUserTypeTransition")) {
      return;
    }

    console.log("🔒 RouteGuard Check:", {
      isAuthenticated,
      isLoading,
      userType: user?.userType,
      allowedUserTypes,
      currentPath: location.pathname,
      timestamp: new Date().toISOString(),
    });

    // If not authenticated, show sign-in modal
    if (!isAuthenticated) {
      console.log("⚠️ User not authenticated, showing sign-in modal");
      openSignInModal(() => {
        console.log("🔑 Successfully signed in, continuing to protected route");
      });
      return;
    }

    // If user type doesn't match required types, redirect to appropriate dashboard
    if (
      user?.userType &&
      allowedUserTypes.length > 0 &&
      !allowedUserTypes.includes(user.userType)
    ) {
      console.log(
        "🚫 User type not allowed, redirecting to appropriate dashboard"
      );
      const landingPath =
        user.userType === UserType.CREATIVE
          ? "/creative/dashboard"
          : "/fan/search";

      // Only navigate if we're not already on the target path
      if (location.pathname !== landingPath) {
        console.log("✅ Navigating to:", landingPath);
        navigate(landingPath, { replace: true });
      } else {
        console.log("✅ Already on correct path:", landingPath);
      }
    } else {
      console.log("✅ Access granted to:", location.pathname);
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    navigate,
    allowedUserTypes,
    openSignInModal,
    location.pathname,
  ]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Show nothing while loading or during transition
  if (isLoading || sessionStorage.getItem("isUserTypeTransition")) {
    return null;
  }

  // If not authenticated, render nothing (modal will be shown)
  if (!isAuthenticated) {
    return null;
  }

  // If user type is not allowed, render nothing (redirect will happen)
  if (
    user?.userType &&
    allowedUserTypes.length > 0 &&
    !allowedUserTypes.includes(user.userType)
  ) {
    return null;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default RouteGuard;
