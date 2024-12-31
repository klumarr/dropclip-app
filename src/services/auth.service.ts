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
  type UpdateUserAttributesInput,
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

export const signUp = async ({
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
};

export const signIn = async ({
  email,
  password,
}: SignInParams): Promise<AuthResponse> => {
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
};

export const signOut = async (): Promise<void> => {
  try {
    console.log("Attempting to sign out");
    await amplifySignOut({ global: true });
    console.log("Sign out successful");
    // Clear any local storage or session storage items
    localStorage.clear();
    sessionStorage.clear();
    // Force reload the page to clear any cached state
    window.location.href = "/login";
  } catch (error) {
    console.error("Error signing out:", error);
    throw error instanceof Error
      ? new AuthError(error.message)
      : new AuthError("An unknown error occurred");
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    return await amplifyGetCurrentUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getCurrentUserAttributes =
  async (): Promise<FetchUserAttributesOutput | null> => {
    try {
      const attributes = await fetchUserAttributes();
      return attributes;
    } catch (error) {
      console.error("Error getting user attributes:", error);
      return null;
    }
  };

export const updateUserAttributes = async (
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
};

export const verifyCurrentUserAttribute = async (
  attribute: string
): Promise<boolean> => {
  try {
    // This functionality needs to be implemented differently in Amplify v6
    // For now, return false
    console.warn("verifyCurrentUserAttribute not implemented in Amplify v6");
    return false;
  } catch (error) {
    console.error("Error verifying attribute:", error);
    return false;
  }
};

export const verifyCurrentUserAttributeSubmit = async (
  attribute: string,
  code: string
): Promise<boolean> => {
  try {
    // This functionality needs to be implemented differently in Amplify v6
    // For now, return false
    console.warn(
      "verifyCurrentUserAttributeSubmit not implemented in Amplify v6"
    );
    return false;
  } catch (error) {
    console.error("Error submitting attribute verification:", error);
    return false;
  }
};

export const changePassword = async (
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
};

export const forgotPassword = async (username: string): Promise<boolean> => {
  try {
    await resetPassword({ username });
    return true;
  } catch (error) {
    console.error("Error initiating forgot password:", error);
    return false;
  }
};

export const forgotPasswordSubmit = async (
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
};

export const resendSignUp = async (username: string): Promise<boolean> => {
  try {
    await amplifyConfirmSignUp({
      username,
      confirmationCode: "", // This is actually for confirming signup, not resending. We need to find the correct API
    });
    return true;
  } catch (error) {
    console.error("Error resending sign up code:", error);
    return false;
  }
};

export const confirmSignUp = async (
  username: string,
  code: string
): Promise<boolean> => {
  try {
    await amplifyConfirmSignUp({
      username,
      confirmationCode: code,
    });
    return true;
  } catch (error) {
    console.error("Error confirming sign up:", error);
    throw error instanceof Error
      ? new AuthError(error.message)
      : new AuthError("An unknown error occurred");
  }
};
