import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
  updateUserAttributes as amplifyUpdateUserAttributes,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  type FetchUserAttributesOutput,
} from "aws-amplify/auth";
import type { AuthUser } from "@aws-amplify/auth";
import { UserType } from "../types/auth.types";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  userType: UserType;
}

interface SignInParams {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  error?: Error;
}

export const AuthService = {
  signUp: async ({
    email,
    password,
    name,
    userType,
  }: SignUpParams): Promise<AuthResponse> => {
    try {
      await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            "custom:userType": userType,
          },
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error signing up:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? new AuthError(error.message)
            : new AuthError("An unknown error occurred"),
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },

  signIn: async ({ email, password }: SignInParams): Promise<AuthResponse> => {
    try {
      const { isSignedIn } = await amplifySignIn({ username: email, password });
      if (isSignedIn) {
        const user = await amplifyGetCurrentUser();
        return {
          success: true,
          user,
        };
      }
      return {
        success: false,
        message: "Sign in failed",
      };
    } catch (error) {
      console.error("Error signing in:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? new AuthError(error.message)
            : new AuthError("An unknown error occurred"),
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },

  signOut: async (): Promise<void> => {
    try {
      console.log("Attempting to sign out");
      await amplifySignOut({ global: true });
      console.log("Sign out successful");
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error instanceof Error
        ? new AuthError(error.message)
        : new AuthError("An unknown error occurred");
    }
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      return await amplifyGetCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const user = await amplifyGetCurrentUser();
      return !!user;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },

  getCurrentUserAttributes:
    async (): Promise<FetchUserAttributesOutput | null> => {
      try {
        const attributes = await fetchUserAttributes();
        return attributes;
      } catch (error) {
        console.error("Error getting user attributes:", error);
        return null;
      }
    },

  updateUserAttributes: async (
    attributes: Record<string, string>
  ): Promise<boolean> => {
    try {
      await amplifyUpdateUserAttributes({
        userAttributes: attributes,
      });
      return true;
    } catch (error) {
      console.error("Error updating user attributes:", error);
      return false;
    }
  },

  verifyCurrentUserAttribute: async (attribute: string): Promise<boolean> => {
    try {
      console.log(`Verifying attribute: ${attribute}`);
      const user = await amplifyGetCurrentUser();
      if (!user) throw new Error("No authenticated user");
      return true;
    } catch (error) {
      console.error(`Error verifying attribute ${attribute}:`, error);
      return false;
    }
  },

  verifyCurrentUserAttributeSubmit: async (
    attribute: string,
    code: string
  ): Promise<boolean> => {
    try {
      console.log(
        `Submitting verification for ${attribute} with code: ${code}`
      );
      const user = await amplifyGetCurrentUser();
      if (!user) throw new Error("No authenticated user");
      return true;
    } catch (error) {
      console.error(`Error submitting verification for ${attribute}:`, error);
      return false;
    }
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await updatePassword({ oldPassword, newPassword });
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  },

  forgotPassword: async (username: string): Promise<boolean> => {
    try {
      await resetPassword({ username });
      return true;
    } catch (error) {
      console.error("Error initiating forgot password:", error);
      return false;
    }
  },

  forgotPasswordSubmit: async (
    username: string,
    code: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error("Error submitting new password:", error);
      return false;
    }
  },

  resendSignUp: async (username: string): Promise<boolean> => {
    try {
      await amplifyConfirmSignUp({
        username,
        confirmationCode: "",
      });
      return true;
    } catch (error) {
      console.error("Error resending sign up code:", error);
      return false;
    }
  },

  confirmSignUp: async (username: string, code: string): Promise<boolean> => {
    try {
      await amplifyConfirmSignUp({
        username,
        confirmationCode: code,
      });
      return true;
    } catch (error) {
      console.error("Error confirming sign up:", error);
      return false;
    }
  },
};
