import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await forgotPassword(email);
      setSuccess(
        "Password reset instructions have been sent to your email address."
      );
      setTimeout(
        () =>
          navigate("/auth/reset-password", {
            state: { email },
          }),
        2000
      );
    } catch (err) {
      setError(
        "Failed to send password reset email. Please check your email address."
      );
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Forgot Password
      </Typography>

      <Typography variant="body1" align="center" color="text.secondary">
        Enter your email address and we'll send you instructions to reset your
        password.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        required
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || !email}
      >
        {loading ? "Sending..." : "Send Reset Instructions"}
      </Button>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          Remember your password?{" "}
          <Link component={RouterLink} to="/auth/signin">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
