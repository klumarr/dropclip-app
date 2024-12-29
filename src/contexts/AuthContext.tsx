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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserAttributes = async () => {
    try {
      const attributes = await amplifyFetchUserAttributes();
      setUserAttributes({
        sub: attributes.sub || "",
        email: attributes.email || "",
        email_verified: attributes.email_verified === "true",
        name: attributes.name,
        picture: attributes.picture,
        userType: attributes.userType as UserType,
      });
    } catch (err) {
      console.error("Error fetching user attributes:", err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await fetchUserAttributes();
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to get user"));
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    try {
      const result = await signIn({ username, password });
      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await fetchUserAttributes();
      }
      return result.nextStep;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in"));
      throw err;
    }
  };

  const handleSignUp = async (input: SignUpInput) => {
    try {
      const result = await signUp(input);
      return result.nextStep;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign up"));
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      setUserAttributes(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign out"));
      throw err;
    }
  };

  const handleUpdateProfile = async (attributes: Record<string, string>) => {
    try {
      // Implement profile update logic here
      setUser((prevUser) => ({ ...prevUser!, ...attributes }));
      await fetchUserAttributes();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update profile")
      );
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userAttributes,
        isLoading,
        isAuthenticated: !!user,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
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
