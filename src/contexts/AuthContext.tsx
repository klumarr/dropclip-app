import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/auth.service";
import {
  AuthUser,
  SecuritySettings,
  AuthState,
  UserType,
  CreativeCategory,
  SignUpInput,
} from "../types/auth.types";
import { clearAWSClients } from "../services/aws-client.factory";
import { verifyAWSConfiguration } from "../services/aws-client.verify";

interface AuthContextType {
  user: AuthUser | null;
  userAttributes: {
    id: string;
    email: string;
    name?: string;
    userType: UserType;
    creativeCategory?: CreativeCategory;
    customCategory?: string;
    linkedAccounts?: {
      fan?: boolean;
      creative?: boolean;
    };
    isDormantCreative?: boolean;
    picture?: string;
    bio?: string;
    website?: string;
    location?: string;
  } | null;
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
  switchUserType: (newType: UserType) => Promise<void>;
  updateProfile: (attributes: Record<string, string>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  updateUserAttributes: (
    attributes: Record<string, string>
  ) => Promise<boolean>;
  completeNewPassword: (
    email: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;
  toggleTwoFactor: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
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
    console.log("Auth State Changed:", {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      userType: state.user?.userType,
      currentPath: window.location.pathname,
      hasError: !!state.error,
      timestamp: new Date().toISOString(),
    });
  }, [state]);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if this is a public route (like event preview)
      const isPublicRoute = window.location.pathname.startsWith("/events/");

      if (isPublicRoute) {
        console.log(
          "AuthContext - Accessing public route, skipping auth check"
        );
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      console.log("Checking auth state...");
      const user = await AuthService.getCurrentUser();

      if (user) {
        setState({
          user: {
            id: user.sub || "",
            email: user.email || "",
            userType:
              (user["custom:userType"]?.toUpperCase() as UserType) ||
              UserType.FAN,
            creativeCategory:
              (user["custom:creativeCategory"] as CreativeCategory) ||
              undefined,
            customCategory: user["custom:customCategory"] || undefined,
            securitySettings: {
              twoFactorEnabled: user["custom:twoFactorEnabled"] === "true",
              emailNotifications: user["custom:emailNotifications"] === "true",
              sessionTimeout: parseInt(
                user["custom:sessionTimeout"] || "30",
                10
              ),
              passwordLastChanged: new Date(
                user["custom:passwordLastChanged"] || Date.now()
              ),
              backupCodes: user["custom:backupCodes"]?.split(",") || [],
            },
            isEmailVerified: user.email_verified === "true",
            createdAt: new Date(user["custom:createdAt"] || Date.now()),
            updatedAt: new Date(user["custom:updatedAt"] || Date.now()),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Authentication check failed"),
      });
      if (!window.location.pathname.startsWith("/events/")) {
        setState((prev) => ({ ...prev, error: true }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log("🔑 AuthContext - Starting sign in process");

      const signInResult = await AuthService.signIn(email, password);
      console.log("🔑 AuthContext - Sign in result:", signInResult);

      if (!signInResult.isSignedIn) {
        throw new Error("Sign in failed");
      }

      // Immediately fetch and set user data after successful sign in
      const userData = await AuthService.getCurrentUser();
      console.log("🔑 AuthContext - User data fetched:", userData);

      if (!userData) {
        throw new Error("Failed to get user data after sign in");
      }

      // Update state with user data
      setState({
        user: {
          id: userData.sub || "",
          email: userData.email || "",
          userType:
            (userData["custom:userType"]?.toUpperCase() as UserType) ||
            UserType.FAN,
          creativeCategory: userData[
            "custom:creativeCategory"
          ] as CreativeCategory,
          customCategory: userData["custom:customCategory"],
          securitySettings: {
            twoFactorEnabled: userData["custom:twoFactorEnabled"] === "true",
            emailNotifications:
              userData["custom:emailNotifications"] === "true",
            sessionTimeout: parseInt(
              userData["custom:sessionTimeout"] || "30",
              10
            ),
            passwordLastChanged: new Date(
              userData["custom:passwordLastChanged"] || Date.now()
            ),
            backupCodes: userData["custom:backupCodes"]?.split(",") || [],
          },
          isEmailVerified: userData.email_verified === "true",
          createdAt: new Date(userData["custom:createdAt"] || Date.now()),
          updatedAt: new Date(userData["custom:updatedAt"] || Date.now()),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log("🔑 AuthContext - Authentication state updated successfully");
    } catch (error) {
      console.error("🔑 AuthContext - Sign in error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Sign in failed"),
      }));
      throw error;
    }
  };

  const handleSignUp = async (data: SignUpInput): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await AuthService.signUp(data);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Sign up error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Sign up failed"),
      }));
      throw error;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await AuthService.signOut();
      clearAWSClients();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Sign out failed"),
      }));
      throw error;
    }
  };

  const handleConfirmSignUp = async (
    email: string,
    code: string
  ): Promise<void> => {
    const success = await AuthService.confirmSignUp(email, code);
    if (!success) {
      throw new Error("Failed to confirm sign up");
    }
  };

  const handleUpdateProfile = async (
    attributes: Record<string, string>
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const success = await AuthService.updateUserAttributes(attributes);
      if (!success) {
        throw new Error("Failed to update profile");
      }
      await checkAuthState(); // Refresh user data after update
    } catch (error) {
      console.error("Profile update error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error : new Error("Profile update failed"),
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateUserAttributes = async (
    attributes: Record<string, string>
  ): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const success = await AuthService.updateUserAttributes(attributes);
      if (!success) {
        throw new Error("Failed to update user attributes");
      }
      await checkAuthState(); // Refresh user data after update
      return true;
    } catch (error) {
      console.error("Update attributes error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Update attributes failed"),
      }));
      return false;
    }
  };

  const handleToggleTwoFactor = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (!state.user) {
        throw new Error("No user found");
      }

      const currentSettings = state.user.securitySettings;
      const newTwoFactorState = !currentSettings.twoFactorEnabled;

      await AuthService.updateUserAttributes({
        "custom:twoFactorEnabled": String(newTwoFactorState),
      });

      await checkAuthState(); // Refresh user data
    } catch (error) {
      console.error("Toggle 2FA error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error : new Error("Failed to toggle 2FA"),
      }));
      throw error;
    }
  };

  const handleGenerateBackupCodes = async (): Promise<string[]> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (!state.user) {
        throw new Error("No user found");
      }

      // Generate 10 random backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );

      await AuthService.updateUserAttributes({
        "custom:backupCodes": codes.join(","),
      });

      await checkAuthState(); // Refresh user data
      return codes;
    } catch (error) {
      console.error("Generate backup codes error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to generate backup codes"),
      }));
      throw error;
    }
  };

  const value = {
    user: state.user,
    userAttributes: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    clearError: () => setState((prev) => ({ ...prev, error: null })),
    updateSecuritySettings: async (settings) => {
      // Implementation will be added later
      console.log("Update security settings:", settings);
    },
    switchUserType: async (newType) => {
      // Implementation will be added later
      console.log("Switch user type:", newType);
    },
    updateProfile: handleUpdateProfile,
    forgotPassword: async (email) => {
      // Implementation will be added later
      console.log("Forgot password:", email);
    },
    resetPassword: async (email, code, newPassword) => {
      // Implementation will be added later
      console.log("Reset password:", { email, code });
    },
    updateUserAttributes: handleUpdateUserAttributes,
    completeNewPassword: async (email, oldPassword, newPassword) => {
      // Implementation will be added later
      console.log("Complete new password:", { email });
    },
    toggleTwoFactor: handleToggleTwoFactor,
    generateBackupCodes: handleGenerateBackupCodes,
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
