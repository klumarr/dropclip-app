import { fetchAuthSession, signIn } from "@aws-amplify/auth";

export const testAuthFlow = async (username: string, password: string) => {
  try {
    console.log("1. Attempting to sign in...");
    const signInResult = await signIn({
      username,
      password,
      options: {
        authFlowType: "USER_PASSWORD_AUTH",
      },
    });
    console.log("Sign in successful:", signInResult);

    if (signInResult.isSignedIn) {
      console.log("2. Fetching auth session...");
      const session = await fetchAuthSession();
      console.log(
        "ID Token:",
        session.tokens?.idToken?.toString().substring(0, 20) + "..."
      );

      if (session.credentials) {
        console.log("3. AWS credentials obtained:");
        console.log(
          "Access Key ID:",
          session.credentials.accessKeyId.substring(0, 10) + "..."
        );
        console.log("Identity ID:", session.identityId);
      }

      return {
        success: true,
        session,
        signInResult,
      };
    } else {
      console.log("Sign in response indicates not signed in:", signInResult);
      return {
        success: false,
        error: new Error("Sign in response indicates not signed in"),
        signInResult,
      };
    }
  } catch (error) {
    console.error("Authentication test failed:", error);
    return {
      success: false,
      error,
    };
  }
};
