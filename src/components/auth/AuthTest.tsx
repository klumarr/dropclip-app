import { Button, Box, Typography } from "@mui/material";
import {
  signInWithRedirect,
  fetchAuthSession,
} from "../../config/aws/amplify.config";
import { useState, useEffect } from "react";

export const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();
      console.log("Current session:", session);
      setAuthStatus(session.tokens ? "Authenticated" : "Not authenticated");
      setError(null);
    } catch (err) {
      console.error("Auth check error:", err);
      setAuthStatus("Not authenticated");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthStatus("Signing in...");
      await signInWithRedirect();
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Sign in failed");
      setAuthStatus("Sign in failed");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Auth Test Component
      </Typography>

      <Typography color="primary" paragraph>
        Status: {authStatus}
      </Typography>

      {error && (
        <Typography color="error" paragraph>
          Error: {error}
        </Typography>
      )}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSignIn}>
          Sign In
        </Button>
        <Button variant="outlined" onClick={checkAuth}>
          Check Auth Status
        </Button>
      </Box>
    </Box>
  );
};
