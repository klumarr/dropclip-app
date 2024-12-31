import { Amplify } from "aws-amplify";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  AuthUser,
} from "@aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "@aws-amplify/auth/cognito";
import { ResourcesConfig } from "@aws-amplify/core";

// Ensure environment variables exist
const requiredEnvVars = {
  userPoolId: import.meta.env.VITE_USER_POOL_ID ?? "",
  userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID ?? "",
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN ?? "",
  redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN ?? "",
  redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT ?? "",
} as const;

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: requiredEnvVars.userPoolId,
      userPoolClientId: requiredEnvVars.userPoolClientId,
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
        phone: false,
        username: false,
        oauth: {
          domain: requiredEnvVars.cognitoDomain,
          scopes: ["openid", "email", "profile"],
          responseType: "code",
          redirectSignIn: [requiredEnvVars.redirectSignIn] as [string],
          redirectSignOut: [requiredEnvVars.redirectSignOut] as [string],
        },
      },
    },
  },
};

console.log("Amplify Configuration:", requiredEnvVars);

Amplify.configure(awsConfig);

// Configure token signing for the Cognito User Pool
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  async getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  async setItem(key: string, value: string) {
    return Promise.resolve(localStorage.setItem(key, value));
  },
  async removeItem(key: string) {
    return Promise.resolve(localStorage.removeItem(key));
  },
  async clear() {
    return Promise.resolve(localStorage.clear());
  },
});

// Helper functions
export const getAuthenticatedUser = async (): Promise<AuthUser | null> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch {
    return null;
  }
};

export const getAuthSession = async () => {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch {
    return null;
  }
};

// Re-export auth functions with proper types
export { signInWithRedirect, signOut, fetchAuthSession, type AuthUser };
