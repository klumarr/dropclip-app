import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity";
import {
  fetchAuthSession,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  confirmSignUp,
  type SignUpInput as AmplifySignUpInput,
} from "aws-amplify/auth";
import type {
  AuthUser,
  UserType,
  SignUpInput,
  AuthServiceType,
} from "../types/auth.types";
import { userService } from "./user.service";

// Cache for AWS credentials
interface CachedCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
  identityId: string;
}

let cachedCredentials: CachedCredentials | null = null;

const areCachedCredentialsValid = () => {
  if (!cachedCredentials) return false;
  // Add 5 minute buffer before expiration
  const expirationWithBuffer = new Date(
    cachedCredentials.expiration.getTime() - 5 * 60 * 1000
  );
  return new Date() < expirationWithBuffer;
};

export const getCredentials = async () => {
  try {
    // Return cached credentials if they're still valid
    if (areCachedCredentialsValid() && cachedCredentials) {
      console.log("🔄 Using cached AWS credentials");
      return cachedCredentials;
    }

    console.log("🔄 Fetching new AWS credentials...");

    // Get current auth session from Amplify
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();

    if (!idToken) {
      throw new Error("No ID token found in session");
    }

    const region = import.meta.env.VITE_AWS_REGION;
    const userPoolId = import.meta.env.VITE_USER_POOL_ID;
    const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

    // Log configuration being used
    console.log("Using AWS configuration:", {
      region,
      userPoolId,
      identityPoolId,
      timestamp: new Date().toISOString(),
    });

    const client = new CognitoIdentityClient({ region });
    const providerName = `cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    // Get Identity ID
    const getIdCommand = new GetIdCommand({
      IdentityPoolId: identityPoolId,
      Logins: {
        [providerName]: idToken,
      },
    });

    const { IdentityId } = await client.send(getIdCommand);

    if (!IdentityId) {
      throw new Error("Failed to get identity ID");
    }

    console.log("✅ Got Identity ID:", IdentityId);

    // Get credentials
    const getCredentialsCommand = new GetCredentialsForIdentityCommand({
      IdentityId,
      Logins: {
        [providerName]: idToken,
      },
    });

    const response = await client.send(getCredentialsCommand);

    if (!response.Credentials) {
      throw new Error("Failed to get credentials");
    }

    console.log("✅ Got AWS credentials");

    // Construct the full ARN
    const accountId = "872515266409"; // This should come from your config
    const identityArn = `arn:aws:sts::${accountId}:assumed-role/dropclip-creative-role/CognitoIdentityCredentials`;

    // Log the full identity information
    console.log("Identity Information:", {
      IdentityId,
      IdentityPoolId: identityPoolId,
      identityArn,
      timestamp: new Date().toISOString(),
    });

    const credentials = {
      accessKeyId: response.Credentials.AccessKeyId!,
      secretAccessKey: response.Credentials.SecretKey!,
      sessionToken: response.Credentials.SessionToken!,
      expiration: response.Credentials.Expiration!,
      identityId: identityArn, // Store the full ARN instead of just the Identity ID
    };

    // Cache the credentials
    cachedCredentials = credentials;

    return credentials;
  } catch (error) {
    console.error("❌ Error getting AWS credentials:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};

// Helper to generate a username from email
const generateUsername = (email: string): string => {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

// Authentication service using Amplify
export const AuthService: AuthServiceType = {
  signIn: async (
    email: string,
    password: string
  ): Promise<{ isSignedIn: boolean }> => {
    try {
      console.log("🔑 AuthService - Starting sign in process");

      const signInResult = await signIn({
        username: email,
        password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });

      console.log("🔑 AuthService - Sign in result:", signInResult);

      // Immediately fetch user attributes after successful sign in
      if (signInResult.isSignedIn) {
        const attributes = await fetchUserAttributes();
        console.log(
          "🔑 AuthService - User attributes after sign in:",
          attributes
        );
      }

      return signInResult;
    } catch (error) {
      console.error("🔑 AuthService - Sign in error:", error);
      throw error;
    }
  },

  signUp: async (data: SignUpInput) => {
    try {
      console.log("🔑 AuthService - Starting sign up process", data);

      // First, create the Cognito user
      const signUpResult = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            name: data.name,
            "custom:userType": data.userType,
            ...(data.creativeCategory && {
              "custom:creativeCategory": data.creativeCategory,
            }),
            ...(data.customCategory && {
              "custom:customCategory": data.customCategory,
            }),
          },
        },
      });

      console.log("🔑 AuthService - Cognito signup successful:", signUpResult);

      // After successful Cognito signup, create DynamoDB user record
      if (signUpResult.userId) {
        try {
          await userService.createUserRecord({
            id: signUpResult.userId,
            email: data.email,
            userType: data.userType,
            displayName: data.name || data.email.split("@")[0],
            username: generateUsername(data.email),
          });
          console.log("🔑 AuthService - DynamoDB user record created");
        } catch (dbError) {
          console.error(
            "🔑 AuthService - Error creating DynamoDB record:",
            dbError
          );
          // Don't throw here - user is still created in Cognito
          // They can complete their profile later
        }
      }

      return signUpResult;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await signOut();
      // Clear credentials cache on sign out
      cachedCredentials = null;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<Record<string, any> | null> => {
    try {
      console.log("🔑 AuthService - Getting current user");
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      console.log("🔑 AuthService - Current user data:", {
        currentUser,
        attributes,
      });

      return attributes;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("User needs to be authenticated")
      ) {
        console.log("🔑 AuthService - No authenticated user");
        return null;
      }
      console.error("🔑 AuthService - Error getting current user:", error);
      throw error;
    }
  },

  getUserAttributes: async () => {
    try {
      return await fetchUserAttributes();
    } catch (error) {
      console.error("Error getting user attributes:", error);
      return null;
    }
  },

  updateUserAttributes: async (attributes: Record<string, string>) => {
    try {
      await updateUserAttributes({ userAttributes: attributes });
      return true;
    } catch (error) {
      console.error("Error updating user attributes:", error);
      return false;
    }
  },

  completeNewPassword: async (
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      // First sign in with the old password
      const signInResult = await signIn({
        username: email,
        password: oldPassword,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });

      if (!signInResult.isSignedIn) {
        throw new Error("Failed to sign in with old password");
      }

      // TODO: Implement the actual password change logic here
      // This will depend on your specific AWS Cognito setup
      // You might need to use the Cognito API directly

      return true;
    } catch (error) {
      console.error("Error completing new password:", error);
      throw error;
    }
  },

  confirmSignUp: async (username: string, code: string): Promise<boolean> => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
      return true;
    } catch (error) {
      console.error("Error confirming sign up:", error);
      return false;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();
      return !!currentUser;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  },
};
