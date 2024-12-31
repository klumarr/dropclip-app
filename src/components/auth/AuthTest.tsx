import { Button, Box, Typography } from "@mui/material";
import {
  signInWithRedirect,
  signOut,
  fetchAuthSession,
} from "../../config/aws/amplify.config";
import { useState, useEffect } from "react";

export const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();
      setAuthStatus(session.tokens ? "Authenticated" : "Not authenticated");
      setError(null);
    } catch (err) {
      setAuthStatus("Not authenticated");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithRedirect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthStatus("Not authenticated");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Auth Status: {authStatus}
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          Error: {error}
        </Typography>
      )}
      <Box sx={{ mt: 2 }}>
        {authStatus === "Not authenticated" ? (
          <Button variant="contained" onClick={handleSignIn}>
            Sign In
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSignOut}>
            Sign Out
          </Button>
        )}
      </Box>
    </Box>
  );
};
