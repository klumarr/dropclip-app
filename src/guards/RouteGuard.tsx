import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserType } from "../types/auth.types";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredUserTypes?: UserType[];
  fallbackPath?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredUserTypes,
  fallbackPath = "/dashboard",
}) => {
  const { userAttributes, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("RouteGuard Check:", {
      userType: userAttributes?.userType,
      requiredTypes: requiredUserTypes,
      isLoading,
      currentPath: window.location.pathname,
    });

    if (!isLoading) {
      if (!userAttributes) {
        console.log("RouteGuard: No user attributes, redirecting to signin");
        navigate("/signin");
        return;
      }

      if (
        requiredUserTypes &&
        !requiredUserTypes.includes(userAttributes.userType)
      ) {
        console.log(
          "RouteGuard: Unauthorized user type, redirecting to fallback"
        );
        navigate(fallbackPath);
        return;
      }
    }
  }, [userAttributes, isLoading, requiredUserTypes, navigate, fallbackPath]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};
