import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  confirmSignUp,
  resetPassword,
  updateUserAttributes,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { UserAttributes, UserType } from "../types/auth.types";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const handleAuthError = (error: unknown, operation: string): never => {
  console.error(`Auth error during ${operation}:`, error);

  if (error instanceof Error) {
    // Handle specific AWS Cognito error codes
    const errorCode = (error as any).code || "UnknownError";
    let message = error.message;

    switch (errorCode) {
      case "UserNotConfirmedException":
        message = "Please verify your email address before signing in.";
        break;
      case "UserNotFoundException":
        message = "Account not found. Please check your credentials.";
        break;
      case "NotAuthorizedException":
        message = "Incorrect username or password.";
        break;
      case "InvalidParameterException":
        message = "Invalid input. Please check your information.";
        break;
      case "UsernameExistsException":
        message = "An account with this email already exists.";
        break;
      case "CodeMismatchException":
        message = "Invalid verification code. Please try again.";
        break;
      case "ExpiredCodeException":
        message = "Verification code has expired. Please request a new one.";
        break;
      default:
        message = "An unexpected error occurred. Please try again.";
    }

    throw new AuthError(message, errorCode, error);
  }

  throw new AuthError("An unexpected error occurred", "UnknownError", error);
};

export const authService = {
  async signUp(email: string, password: string, userType: UserType) {
    try {
      console.log("Attempting to sign up user:", email);
      const { isSignUpComplete, userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            "custom:userType": userType,
          },
        },
      });
      console.log("Sign up successful for user:", userId);
      return { isSignUpComplete, userId };
    } catch (error) {
      return handleAuthError(error, "signup");
    }
  },

  async confirmSignUp(email: string, code: string) {
    try {
      console.log("Attempting to confirm signup for user:", email);
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      console.log("Sign up confirmation successful for user:", email);
      return isSignUpComplete;
    } catch (error) {
      return handleAuthError(error, "confirm signup");
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log("Attempting to sign in user:", email);
      const { isSignedIn } = await signIn({ username: email, password });
      console.log("Sign in successful for user:", email);
      return isSignedIn;
    } catch (error) {
      return handleAuthError(error, "signin");
    }
  },

  async signOut() {
    try {
      console.log("Attempting to sign out user");
      await signOut();
      console.log("Sign out successful");
    } catch (error) {
      return handleAuthError(error, "signout");
    }
  },

  async getCurrentUser() {
    try {
      console.log("Fetching current user");
      const user = await getCurrentUser();
      console.log("Current user fetched successfully");
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async getCurrentUserAttributes(): Promise<UserAttributes | null> {
    try {
      console.log("Fetching current user attributes");
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userTypeString = attributes["custom:userType"] || undefined;

      const userAttributes = {
        sub: attributes.sub,
        email: attributes.email,
        email_verified: attributes.email_verified === "true",
        userType: userTypeString as UserType | undefined,
      };

      console.log("User attributes fetched successfully");
      return userAttributes;
    } catch (error) {
      return handleAuthError(error, "get user attributes");
    }
  },

  async updateUserAttributes(attributes: Partial<UserAttributes>) {
    try {
      console.log("Updating user attributes");
      const updatedAttributes: Record<string, string> = {};

      if (attributes.email) {
        updatedAttributes["email"] = attributes.email;
      }
      if (attributes.userType) {
        updatedAttributes["custom:userType"] = attributes.userType;
      }

      await updateUserAttributes({
        userAttributes: updatedAttributes,
      });
      console.log("User attributes updated successfully");
    } catch (error) {
      return handleAuthError(error, "update user attributes");
    }
  },

  async resetPassword(email: string) {
    try {
      console.log("Initiating password reset for user:", email);
      await resetPassword({ username: email });
      console.log("Password reset initiated successfully");
    } catch (error) {
      return handleAuthError(error, "reset password");
    }
  },
};
