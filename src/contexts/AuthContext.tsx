import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  signIn,
  signUp,
  signOut as amplifySignOut,
  fetchUserAttributes as amplifyFetchUserAttributes,
} from "aws-amplify/auth";
import type { AuthUser } from "@aws-amplify/auth";
import type {
  AuthContextType,
  UserAttributes,
  SignUpInput,
  UserType,
} from "../types/auth.types";
import { AuthError } from "../services/auth.service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  user: AuthUser | null;
  userAttributes: UserAttributes | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userAttributes: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: Error | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const fetchUserAttributes = async () => {
    try {
      console.log("Fetching user attributes");
      const attributes = await amplifyFetchUserAttributes();
      setState((prev) => ({
        ...prev,
        userAttributes: {
          sub: attributes.sub || "",
          email: attributes.email || "",
          email_verified: attributes.email_verified === "true",
          name: attributes.name,
          picture: attributes.picture,
          userType: attributes["custom:userType"] as UserType,
        },
      }));
      console.log("User attributes fetched successfully");
    } catch (err) {
      console.error("Error fetching user attributes:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch user attributes")
      );
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication");
        const currentUser = await getCurrentUser();
        setState((prev) => ({ ...prev, user: currentUser }));
        await fetchUserAttributes();
      } catch (err) {
        console.log("No user currently signed in");
        // Not setting this as an error since it's an expected state
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
        }));
      }
    };

    initializeAuth();
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      console.log("Attempting to sign in");
      const result = await signIn({ username, password });
      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
        setState((prev) => ({ ...prev, user: currentUser }));
        await fetchUserAttributes();
        console.log("Sign in successful");
      }
      return result.nextStep;
    } catch (err) {
      console.error("Sign in error:", err);
      const error =
        err instanceof AuthError ? err : new Error("Failed to sign in");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (input: SignUpInput) => {
    clearError();
    setLoading(true);
    try {
      console.log("Attempting to sign up");
      const result = await signUp(input);
      console.log("Sign up successful");
      return result.nextStep;
    } catch (err) {
      console.error("Sign up error:", err);
      const error =
        err instanceof AuthError ? err : new Error("Failed to sign up");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    clearError();
    setLoading(true);
    try {
      console.log("Attempting to sign out");
      await amplifySignOut();
      setState((prev) => ({
        ...prev,
        user: null,
        userAttributes: null,
      }));
      console.log("Sign out successful");
    } catch (err) {
      console.error("Sign out error:", err);
      const error =
        err instanceof AuthError ? err : new Error("Failed to sign out");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (attributes: Record<string, string>) => {
    clearError();
    setLoading(true);
    try {
      console.log("Attempting to update profile");
      // Implement profile update logic here
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...attributes } : null,
      }));
      await fetchUserAttributes();
      console.log("Profile update successful");
    } catch (err) {
      console.error("Profile update error:", err);
      const error =
        err instanceof AuthError ? err : new Error("Failed to update profile");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        userAttributes: state.userAttributes,
        isLoading: state.isLoading,
        isAuthenticated: !!state.user,
        isInitialized: state.isInitialized,
        error: state.error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
