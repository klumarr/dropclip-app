import { Amplify } from "aws-amplify";
import { type ResourcesConfig } from "@aws-amplify/core";

// Type guard for environment variables
const requireEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  console.log(`Loading ${name}:`, value); // Add logging for each env var
  return value;
};

// Get the current origin for OAuth redirects
const currentOrigin =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5174";

// Configuration values with type safety
export const region = requireEnvVar("VITE_AWS_REGION");
export const userPoolId = requireEnvVar("VITE_USER_POOL_ID");
export const userPoolClientId = requireEnvVar("VITE_USER_POOL_CLIENT_ID");
export const identityPoolId = requireEnvVar("VITE_IDENTITY_POOL_ID");

// Log all environment variables for debugging
console.log("🔍 Environment Variables Check:", {
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
  VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  VITE_IDENTITY_POOL_ID: import.meta.env.VITE_IDENTITY_POOL_ID,
  VITE_COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
});

// Amplify v6 configuration
const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      identityPoolId,
      signUpVerificationMethod: "code" as const,
      loginWith: {
        oauth: {
          domain: requireEnvVar("VITE_COGNITO_DOMAIN"),
          scopes: [
            "openid",
            "email",
            "profile",
            "aws.cognito.signin.user.admin",
          ],
          responseType: "code",
          redirectSignIn: [currentOrigin, `${currentOrigin}/auth/signin`],
          redirectSignOut: [currentOrigin, `${currentOrigin}/auth/signout`],
        },
        username: true,
        email: true,
        phone: false,
      },
    } as any, // Type assertion to bypass strict checking
  },
  Storage: {
    S3: {
      bucket: requireEnvVar("VITE_AWS_S3_IMAGES_BUCKET"),
      region,
    },
  },
};

// Initialize Amplify with better error handling
try {
  console.log("🔄 Configuring Amplify with:", {
    region,
    userPoolId,
    userPoolClientId,
    identityPoolId,
    domain: requireEnvVar("VITE_COGNITO_DOMAIN"),
  });

  Amplify.configure(amplifyConfig);
  console.log("✅ Amplify configured successfully");
} catch (error) {
  console.error("❌ Error configuring Amplify:", error);
  if (error instanceof Error) {
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
  }
  // Re-throw to prevent app from running with incorrect configuration
  throw error;
}

export default amplifyConfig;
