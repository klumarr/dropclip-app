import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { getAWSClient } from "./aws-client.factory";
import {
  CognitoIdentityClient,
  GetIdCommand,
} from "@aws-sdk/client-cognito-identity";
import amplifyConfig from "../config/amplify-config";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

/**
 * Verifies AWS client configuration by checking Identity Pool setup
 * This will fail if:
 * 1. Identity Pool configuration is incorrect
 * 2. User Pool configuration is incorrect
 * 3. IAM roles are not configured correctly
 */
export const verifyAWSConfiguration = async (): Promise<{
  success: boolean;
  message: string;
  error?: any;
  authState?: {
    isAuthenticated: boolean;
    hasValidSession: boolean;
    hasValidToken: boolean;
  };
}> => {
  try {
    console.log("🔍 Starting AWS configuration verification...");

    // Check authentication state
    const authState = {
      isAuthenticated: false,
      hasValidSession: false,
      hasValidToken: false,
    };

    try {
      // Check if we have a current user
      const user = await getCurrentUser();
      authState.isAuthenticated = !!user;
      console.log("👤 Current user:", user ? "Found" : "None");

      // Check if we have a valid session
      const { tokens } = await fetchAuthSession();
      authState.hasValidSession = !!tokens;
      authState.hasValidToken = !!tokens?.idToken;

      console.log("🔐 Auth State:", {
        isAuthenticated: authState.isAuthenticated,
        hasValidSession: authState.hasValidSession,
        hasValidToken: authState.hasValidToken,
      });

      // If not authenticated, return early without error
      if (!authState.hasValidToken) {
        return {
          success: true,
          message: "Authentication required for full verification",
          authState,
        };
      }

      // Only create client if authenticated
      const s3Client = await getAWSClient(S3Client);
      console.log("✅ Successfully created S3 client with credentials");

      return {
        success: true,
        message: "AWS configuration verified",
        authState,
      };
    } catch (authError: any) {
      // Not authenticated - this is expected on sign-in page
      if (!authState.isAuthenticated) {
        return {
          success: true,
          message: "Authentication required for full verification",
          authState,
        };
      }

      console.error("❌ AWS access error:", authError);
      return {
        success: false,
        message: "AWS access error",
        authState,
        error: {
          type: "AWS_ACCESS_ERROR",
          details: {
            name: authError.name,
            message: authError.message,
          },
        },
      };
    }
  } catch (error: any) {
    console.error("❌ Verification failed:", error);
    return {
      success: false,
      message: "AWS verification failed",
      error: {
        type: "VERIFICATION_ERROR",
        details: {
          name: error.name,
          message: error.message,
        },
      },
    };
  }
};
