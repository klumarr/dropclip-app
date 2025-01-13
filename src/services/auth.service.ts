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
import type { AuthUser, UserType, SignUpInput } from "../types/auth.types";

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

// Authentication service using Amplify
export const AuthService = {
  signIn: async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting to sign in with email:", email);
      const signInResult = await signIn({
        username: email,
        password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });
      console.log("✅ Sign in successful:", signInResult);
      return signInResult;
    } catch (error) {
      console.error("❌ Error signing in:", error);
      throw error;
    }
  },

  signUp: async (data: SignUpInput) => {
    try {
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

  getCurrentUser: async () => {
    try {
      return await getCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
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

  confirmSignUp: async (username: string, code: string) => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
      return true;
    } catch (error) {
      console.error("Error confirming sign up:", error);
      return false;
    }
  },

  isAuthenticated: async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      return !!(currentUser && session.tokens?.idToken);
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  },
};
