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

export const authService = {
  async signUp(email: string, password: string, userType: UserType) {
    try {
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
      return { isSignUpComplete, userId };
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  async confirmSignUp(email: string, code: string) {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return isSignUpComplete;
    } catch (error) {
      console.error("Error confirming sign up:", error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      return isSignedIn;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  async signOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async getCurrentUserAttributes(): Promise<UserAttributes | null> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userTypeString = attributes["custom:userType"] || undefined;

      return {
        sub: attributes.sub,
        email: attributes.email,
        email_verified: attributes.email_verified === "true",
        userType: userTypeString as UserType | undefined,
      };
    } catch (error) {
      console.error("Error getting user attributes:", error);
      return null;
    }
  },

  async updateUserAttributes(attributes: Partial<UserAttributes>) {
    try {
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
    } catch (error) {
      console.error("Error updating user attributes:", error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      console.error("Error initiating password reset:", error);
      throw error;
    }
  },
};
