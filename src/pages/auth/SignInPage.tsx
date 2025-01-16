import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signIn, fetchUserAttributes, signOut } from "aws-amplify/auth";
import { UserType } from "../../types/auth.types";

const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);

  // This useEffect handles the redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, redirecting...", {
        userType: user.userType,
      });
      const redirectPath =
        user.userType === UserType.CREATIVE
          ? "/creative/dashboard"
          : "/fan/search";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("🔑 SignInPage - Attempting sign in:", {
        email: formData.email,
      });

      await signIn(formData.email, formData.password);
      // The useEffect above will handle the redirect once auth state updates
    } catch (err) {
      console.error("🔑 SignInPage - Sign in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setError("");
      setLoading(true);

      console.log("Attempting to change password...");
      await completeNewPassword(
        formData.email,
        formData.password,
        formData.newPassword
      );
      console.log("Password changed successfully");

      // After successful password change, we're already signed in
      // Get user attributes and navigate
      const attributes = await fetchUserAttributes();
      console.log("Fetched user attributes after password change:", attributes);
      const userType = attributes?.["custom:userType"];

      // Navigate to appropriate dashboard
      const defaultPath =
        userType === "CREATIVE" ? "/creative/dashboard" : "/dashboard";
      console.log(
        "Navigating to default path after password change:",
        defaultPath
      );
      navigate(defaultPath);
    } catch (err: Error | unknown) {
      console.error("Password change error:", err);
      setError(
        (err as Error)?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isNewPasswordRequired) {
    return (
      <Box
        component="form"
        onSubmit={handlePasswordChange}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: "400px",
          mx: "auto",
          p: 3,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Change Password Required
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your password must contain: • At least 8 characters • At least one
          uppercase letter • At least one lowercase letter • At least one number
          • At least one special character
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          required
          fullWidth
          label="New Password"
          name="newPassword"
          type={showPassword ? "text" : "password"}
          value={formData.newPassword}
          onChange={handleChange}
          autoFocus
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
          name="confirmNewPassword"
          type={showPassword ? "text" : "password"}
          value={formData.confirmNewPassword}
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? "Changing Password..." : "Change Password"}
        </Button>
      </Box>
    );
  }

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
        Sign In
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        required
        fullWidth
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        autoFocus
      />

      <TextField
        required
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to="/auth/forgot-password"
          variant="body2"
          sx={{ display: "block", mb: 1 }}
        >
          Forgot password?
        </Link>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/auth/signup"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignInPage;
