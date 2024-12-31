import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { confirmSignUp } from "../services/auth.service";

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await confirmSignUp(email, code);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Container>
        <Alert severity="error">No email address provided</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please enter the verification code sent to {email}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Verification Code"
              name="code"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify Email"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
