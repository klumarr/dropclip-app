import React, { useState } from "react";
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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUserAttributes, getCurrentUser, signOut } from "aws-amplify/auth";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      // First check if there's an existing session
      try {
        await getCurrentUser();
        console.log("Found existing session, signing out first");
        await signOut();
      } catch (err) {
        // No existing session, proceed with sign in
        console.log("No existing session found");
      }

      await signIn(formData.email, formData.password);
      const userType = await getUserType();
      if (userType === "CREATIVE") {
        navigate("/creative/dashboard");
      } else {
        navigate("/fan/search");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const getUserType = async () => {
    try {
      const attributes = await fetchUserAttributes();
      return attributes?.["custom:userType"] || null;
    } catch (error) {
      console.error("Error fetching user type:", error);
      return null;
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
        width: "100%",
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
