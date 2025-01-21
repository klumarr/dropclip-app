import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { signIn } from "aws-amplify/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  onSuccess,
  message = "Please sign in to continue",
}) => {
  const { isLoading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSignIn = async () => {
    try {
      setError(null);

      // Sign in with email/password
      const signInResult = await signIn({
        username: email,
        password: password,
      });

      if (!signInResult.isSignedIn) {
        throw new Error("Sign in failed");
      }

      console.log("Successfully signed in with email/password");

      // Wait a moment for auth context to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSuccess();
      onClose(); // Explicitly close the modal
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error signing in:", err);
      setError(
        "Failed to sign in. Please check your credentials and try again."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 400,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle>Sign In Required</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>
            {message}
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          {isLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: "column", p: 2, gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSignIn}
          disabled={isLoading || !email || !password}
        >
          Sign In
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
