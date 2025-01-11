import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmSignUp, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");

  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await confirmSignUp(email, code);
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          No email address provided
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/auth/sign-up")}
          sx={{ mt: 2 }}
        >
          Back to Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Verify Your Email
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 3 }}>
        We've sent a verification code to {email}. Please enter it below to
        verify your email address.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error.message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Verification Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        margin="normal"
        required
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || !code}
        sx={{ mt: 3 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Verify Email"}
      </Button>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="text"
          onClick={() => {
            // Implement resend code functionality
            console.log("Resend code for:", email);
          }}
        >
          Resend Code
        </Button>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
