import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });

  const email = location.state?.email;

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(
        "No email address provided. Please try the forgot password process again."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await resetPassword(email, formData.code, formData.password);
      setSuccess("Password has been reset successfully!");
      setTimeout(() => navigate("/auth/signin"), 2000);
    } catch (err) {
      setError(
        "Failed to reset password. Please check your code and try again."
      );
      console.error("Reset password error:", err);
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
        Reset Password
      </Typography>

      <Typography variant="body1" align="center" color="text.secondary">
        Enter the verification code sent to your email and your new password.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        required
        fullWidth
        label="Verification Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="Enter 6-digit code"
        autoFocus
      />

      <TextField
        required
        fullWidth
        label="New Password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        required
        fullWidth
        label="Confirm New Password"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
      >
        {loading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPasswordPage;
