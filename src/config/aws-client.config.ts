import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fetchAuthSession } from "@aws-amplify/auth";
import { Amplify } from "aws-amplify";
import env from "./env.config";

// Amplify configuration with Identity Pool
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.aws.userPoolId,
      userPoolClientId: env.aws.userPoolClientId,
      identityPoolId: env.aws.identityPoolId,
      region: env.aws.region,
      signUpVerificationMethod: "code",
      authenticationFlowType: "USER_SRP_AUTH",
    },
  },
} as const;

// Add debug logging for configuration
console.log("🔐 Cognito Configuration:", {
  userPool: {
    id: amplifyConfig.Auth.Cognito.userPoolId,
    clientId: amplifyConfig.Auth.Cognito.userPoolClientId,
    region: amplifyConfig.Auth.Cognito.region,
  },
  identityPool: {
    id: amplifyConfig.Auth.Cognito.identityPoolId,
    expectedProviderName: `cognito-idp.${amplifyConfig.Auth.Cognito.region}.amazonaws.com/${amplifyConfig.Auth.Cognito.userPoolId}`,
  },
  timestamp: new Date().toISOString(),
});

try {
  Amplify.configure(amplifyConfig as any);
  console.log("✅ Amplify configured successfully with Identity Pool");
} catch (error) {
  console.error("❌ Error configuring Amplify:", error);
  if (error instanceof Error) {
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
  }
}

const region = env.aws.region;

// Create AWS credentials using Identity Pool
const createCredentials = async () => {
  try {
    console.log("🔄 Starting credential creation process...");

    // 1. Get the auth session
    const authSession = await fetchAuthSession();
    console.log("📦 Auth Session:", {
      hasTokens: !!authSession.tokens,
      identityPoolId: amplifyConfig.Auth.Cognito.identityPoolId,
      region,
    });

    // 2. Get and validate the ID token
    const idToken = authSession.tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error("No ID token found in session");
    }

    // 3. Decode the token to check its contents
    const tokenPayload = JSON.parse(atob(idToken.split(".")[1]));
    console.log("🎫 Token Info:", {
      iss: tokenPayload.iss,
      sub: tokenPayload.sub,
      tokenUse: tokenPayload.token_use,
      exp: new Date(tokenPayload.exp * 1000).toISOString(),
    });

    // 4. Construct the provider name
    const providerName = `cognito-idp.${region}.amazonaws.com/${amplifyConfig.Auth.Cognito.userPoolId}`;
    console.log("🔑 Using provider:", providerName);

    // 5. Create credentials
    console.log("🔐 Creating credentials with config:", {
      region,
      identityPoolId: amplifyConfig.Auth.Cognito.identityPoolId,
      providerName,
    });

    const credentials = fromCognitoIdentityPool({
      client: new CognitoIdentityClient({
        region,
        credentials: undefined,
      }),
      identityPoolId: amplifyConfig.Auth.Cognito.identityPoolId,
      logins: {
        [providerName]: idToken,
      },
    });

    // 6. Test the credentials
    const credentialsTest = await credentials();
    console.log("✅ Credentials created successfully:", {
      hasAccessKeyId: !!credentialsTest.accessKeyId,
      hasSecretKey: !!credentialsTest.secretAccessKey,
      hasSessionToken: !!credentialsTest.sessionToken,
      expiration: credentialsTest.expiration,
    });

    return credentials;
  } catch (error) {
    console.error("❌ Credential creation failed:", {
      error,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

// Create the DynamoDB client with Identity Pool credentials
const createDynamoDBClient = async () => {
  try {
    const credentials = await createCredentials();

    console.log("Creating DynamoDB client");
    console.log("Using region:", region);
    console.log(
      "Using identity pool:",
      amplifyConfig.Auth.Cognito.identityPoolId
    );

    const client = new DynamoDBClient({
      region,
      credentials,
    });

    return DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  } catch (error) {
    console.error("Error creating DynamoDB client:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Authentication required to access DynamoDB");
  }
};

// Create and export the DynamoDB Document client
export let docClient: DynamoDBDocumentClient;

// Initialize the client
export const initializeAWSClient = async () => {
  docClient = await createDynamoDBClient();
};

// Generic function to create any AWS client with Identity Pool credentials
export const createAWSClient = async <T>(
  ClientClass: new (config: any) => T
): Promise<T> => {
  const credentials = await createCredentials();
  return new ClientClass({ region, credentials });
};

// Table names with proper environment variable access
export const TableNames = {
  NOTIFICATIONS: import.meta.env.VITE_NOTIFICATIONS_TABLE,
  USERS: import.meta.env.VITE_USERS_TABLE,
  CONTENT: import.meta.env.VITE_CONTENT_TABLE,
  EVENTS: import.meta.env.VITE_EVENTS_TABLE,
  COLLECTIONS: import.meta.env.VITE_COLLECTIONS_TABLE,
  PLAYLISTS: import.meta.env.VITE_PLAYLISTS_TABLE,
  USER_PROFILES: import.meta.env.VITE_USER_PROFILES_TABLE,
  FOLLOWS: import.meta.env.VITE_FOLLOWS_TABLE,
  UPLOAD_LINKS: import.meta.env.VITE_UPLOAD_LINKS_TABLE,
  ATTENDANCE: import.meta.env.VITE_ATTENDANCE_TABLE,
  COLLECTION_UPLOADS: import.meta.env.VITE_COLLECTION_UPLOADS_TABLE,
} as const;
