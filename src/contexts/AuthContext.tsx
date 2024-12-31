import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  type SignUpInput as AmplifySignUpInput,
  updateUserAttributes,
} from "aws-amplify/auth";
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
      console.error("Failed to toggle 2FA:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const generateBackupCodes = async () => {
    try {
      if (!state.user) throw new Error("No authenticated user");

      // Generate 10 random backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      await updateSecuritySettings({
        backupCodes: codes,
      });

      setState((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              securitySettings: {
                ...prev.user.securitySettings,
                backupCodes: codes,
              },
            }
          : null,
      }));

      return codes;
    } catch (error) {
      console.error("Failed to generate backup codes:", error);
      setState((prev) => ({ ...prev, error: error as Error }));
      throw error;
    }
  };

  const updateProfile = async (attributes: Record<string, string>) => {
    try {
      await updateUserAttributes({ userAttributes: attributes });
      await checkAuthState(); // Refresh the user state
    } catch (error) {
      console.error("Failed to update profile:", error);
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
    toggleTwoFactor,
    generateBackupCodes,
    userAttributes: state.user
      ? {
          id: state.user.id,
          email: state.user.email,
          name: state.user.name || "",
          userType: state.user.userType,
          creativeCategory: state.user.creativeCategory,
          customCategory: state.user.customCategory,
          linkedAccounts: state.user.linkedAccounts,
          isDormantCreative: state.user.isDormantCreative,
          picture: state.user.picture,
        }
      : null,
    switchUserType: async (newType: UserType) => {
      try {
        // Implement user type switching logic here
        console.log("Switching user type to:", newType);
        // For now, just update the state
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
        console.error("Error switching user type:", error);
        setState((prev) => ({ ...prev, error: error as Error }));
        throw error;
      }
    },
    updateProfile,
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
