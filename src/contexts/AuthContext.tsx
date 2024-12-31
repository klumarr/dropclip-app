import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  type SignUpInput as AmplifySignUpInput,
} from "aws-amplify/auth";
import {
  AuthUser,
  SecuritySettings,
  AuthState,
  UserType,
  CreativeCategory,
} from "../types/auth.types";

interface SignUpInput {
  email: string;
  password: string;
  userType: UserType;
  creativeCategory?: CreativeCategory;
  customCategory?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpInput) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateSecuritySettings: (
    settings: Partial<SecuritySettings>
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      console.log("User attributes:", attributes);

      setState({
        user: {
          id: attributes.sub || "",
          email: attributes.email || "",
          userType: (attributes["custom:userType"] as UserType) || UserType.FAN,
          creativeCategory:
            (attributes["custom:creativeCategory"] as CreativeCategory) ||
            undefined,
          customCategory: attributes["custom:customCategory"] || undefined,
          securitySettings: {
            twoFactorEnabled: attributes["custom:twoFactorEnabled"] === "true",
            emailNotifications:
              attributes["custom:emailNotifications"] === "true",
            sessionTimeout: parseInt(
              attributes["custom:sessionTimeout"] || "30",
              10
            ),
            passwordLastChanged: new Date(
              attributes["custom:passwordLastChanged"] || Date.now()
            ),
            backupCodes: attributes["custom:backupCodes"]?.split(",") || [],
          },
          isEmailVerified: attributes.email_verified === "true",
          createdAt: new Date(attributes["custom:createdAt"] || Date.now()),
          updatedAt: new Date(attributes["custom:updatedAt"] || Date.now()),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log("No authenticated user");
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await amplifySignIn({ username: email, password });
      await checkAuthState();
    } catch (error) {
      console.error("Sign in error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const handleSignUp = async (data: SignUpInput) => {
    try {
      console.log("Signing up with data:", data);
      const signUpData: AmplifySignUpInput = {
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            "custom:userType": data.userType.toString(),
            ...(data.creativeCategory && {
              "custom:creativeCategory": data.creativeCategory.toString(),
            }),
            ...(data.customCategory && {
              "custom:customCategory": data.customCategory,
            }),
            "custom:createdAt": new Date().toISOString(),
            "custom:updatedAt": new Date().toISOString(),
          },
        },
      };
      console.log(
        "Formatted sign up data:",
        JSON.stringify(signUpData, null, 2)
      );
      await amplifySignUp(signUpData);
    } catch (error) {
      console.error("Sign up error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const updateSecuritySettings = async (
    settings: Partial<SecuritySettings>
  ) => {
    // Implementation for updating security settings
    console.log("Updating security settings:", settings);
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });
    } catch (error) {
      console.error("Confirmation error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const value = {
    ...state,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    clearError,
    updateSecuritySettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
