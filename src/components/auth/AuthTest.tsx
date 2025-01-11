import { Button, Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { AuthService } from "../../services/auth.service";

export const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      setAuthStatus(isAuthenticated ? "Authenticated" : "Not authenticated");
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
      // This will redirect to Cognito hosted UI
      window.location.href = `https://${
        import.meta.env.VITE_COGNITO_DOMAIN
      }/login?client_id=${
        import.meta.env.VITE_COGNITO_CLIENT_ID
      }&response_type=code&scope=email+openid+profile&redirect_uri=${
        window.location.origin
      }`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
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
