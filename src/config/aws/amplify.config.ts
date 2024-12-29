import { Amplify } from "aws-amplify";
import { fetchAuthSession, signInWithRedirect } from "aws-amplify/auth";

// Get the development port from environment or use default
const devPort = import.meta.env.VITE_DEV_PORT || "5174";

// Get the base URL for redirects
const baseUrl = import.meta.env.DEV
  ? `http://localhost:${devPort}`
  : import.meta.env.VITE_APP_URL || window.location.origin;

// Validate required environment variables
const validateConfig = () => {
  const required = {
    VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("Environment validation:", {
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    region: import.meta.env.VITE_AWS_REGION,
    devPort,
    baseUrl,
    isDev: import.meta.env.DEV,
  });
};

// Configure Amplify
const config = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "",
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || "",
      region: import.meta.env.VITE_AWS_REGION || "",
      loginWith: {
        username: true,
        email: true,
        phone: false,
      },
      // Only add OAuth config if domain is provided
      ...(import.meta.env.VITE_AUTH_DOMAIN && {
        oauth: {
          domain: import.meta.env.VITE_AUTH_DOMAIN,
          scope: ["email", "profile", "openid"],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN || baseUrl],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT || baseUrl],
          responseType: "code",
        },
      }),
    },
  },
};

console.log("Amplify Configuration:", config);

try {
  // Validate environment variables first
  validateConfig();

  // Configure Amplify with the auth config
  Amplify.configure(config);

  // Test the configuration by attempting to fetch the current session
  fetchAuthSession()
    .then((session) => {
      console.log("Auth session test result:", session);
    })
    .catch((error) => {
      console.log(
        "No active session (this is normal if not logged in):",
        error.message
      );
    });

  console.log("Amplify configured successfully");
} catch (error) {
  console.error("Error during Amplify setup:", error);
  throw error;
}

// Export useful auth functions
export { signInWithRedirect, fetchAuthSession };
