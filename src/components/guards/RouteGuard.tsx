import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredUserTypes: UserType[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredUserTypes,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for authentication state to be determined
    if (isLoading) return;

    // If not authenticated, redirect to sign in
    if (!isAuthenticated) {
      navigate("/auth/sign-in");
      return;
    }

    // If user type doesn't match required types, redirect to appropriate dashboard
    if (user?.userType && !requiredUserTypes.includes(user.userType)) {
      const dashboardPath =
        user.userType === UserType.CREATIVE
          ? "/creative/dashboard"
          : "/fan/dashboard";
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, isLoading, navigate, requiredUserTypes]);

  // Show nothing while loading
  if (isLoading) return null;

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default RouteGuard;
