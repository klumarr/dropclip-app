import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  type SignUpInput as AmplifySignUpInput,
  updateUserAttributes as amplifyUpdateUserAttributes,
} from "aws-amplify/auth";
import { AuthService } from "../services/auth.service";
import {
  AuthUser,
  SecuritySettings,
  AuthState,
  UserType,
  CreativeCategory,
  SignUpInput,
} from "../types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  userAttributes: {
    id: string;
    email: string;
    name: string;
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
  toggleTwoFactor: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  updateProfile: (attributes: Record<string, string>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  updateUserAttributes: (attributes: Record<string, string>) => Promise<void>;
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
      console.log("Checking auth state...");
      const currentUser = await getCurrentUser();
      console.log("Current user:", currentUser);

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
      console.log("Auth check failed:", {
        error,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
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
      console.log("Sign in attempt:", {
        email,
        timestamp: new Date().toISOString(),
      });

      // First check if there's an existing session
      try {
        const currentUser = await getCurrentUser();
        console.log("Found existing session, signing out first");
        await signOut();
      } catch (err) {
        // No existing session, proceed with sign in
        console.log("No existing session found");
      }

      await amplifySignIn({ username: email, password });
      await checkAuthState();
    } catch (error) {
      console.error("Sign in error:", {
        error,
        email,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
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
            name: data.name,
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
      await signOut();
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

  const toggleTwoFactor = async () => {
    try {
      if (!state.user) throw new Error("No authenticated user");

      const newTwoFactorState = !state.user.securitySettings.twoFactorEnabled;
      await updateSecuritySettings({
        twoFactorEnabled: newTwoFactorState,
      });

      setState((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              securitySettings: {
                ...prev.user.securitySettings,
                twoFactorEnabled: newTwoFactorState,
              },
            }
          : null,
      }));
    } catch (error) {
      console.error("Two-factor toggle error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const generateBackupCodes = async () => {
    try {
      // Implementation for generating backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substr(2, 8)
      );
      return codes;
    } catch (error) {
      console.error("Backup codes generation error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const switchUserType = async (newType: UserType) => {
    try {
      if (!state.user) throw new Error("No authenticated user");

      await amplifyUpdateUserAttributes({
        userAttributes: {
          "custom:userType": newType,
        },
      });

      setState((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              userType: newType,
            }
          : null,
      }));
    } catch (error) {
      console.error("User type switch error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const updateProfile = async (attributes: Record<string, string>) => {
    try {
      await amplifyUpdateUserAttributes({
        userAttributes: attributes,
      });
      await checkAuthState();
    } catch (error) {
      console.error("Profile update error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await AuthService.forgotPassword(email);
    } catch (error) {
      console.error("Forgot password error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const handleResetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    try {
      await AuthService.forgotPasswordSubmit(email, code, newPassword);
    } catch (error) {
      console.error("Reset password error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const updateUserAttributes = async (attributes: Record<string, string>) => {
    try {
      await amplifyUpdateUserAttributes({
        userAttributes: attributes,
      });
      await checkAuthState();
    } catch (error) {
      console.error("User attributes update error:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const value = {
    user: state.user,
    userAttributes: state.user
      ? {
          id: state.user.id,
          email: state.user.email,
          name: state.user.name || "",
          userType: state.user.userType,
          creativeCategory: state.user.creativeCategory,
          customCategory: state.user.customCategory,
          picture: state.user.picture,
          bio: state.user.bio,
          website: state.user.website,
          location: state.user.location,
        }
      : null,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    clearError,
    updateSecuritySettings,
    switchUserType,
    toggleTwoFactor,
    generateBackupCodes,
    updateProfile,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    updateUserAttributes,
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
