import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from "@mui/material";

interface VerifyEmailFormProps {
  verificationCode: string;
  isLoading: boolean;
  onVerificationCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResendCode: () => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  verificationCode,
  isLoading,
  onVerificationCodeChange,
  onSubmit,
  onResendCode,
}) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{ fontSize: "1.25rem", mb: 1, color: "white" }}
        >
          Verify Your Email
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 3, px: 2, fontSize: "0.875rem", color: "text.secondary" }}
        >
          Please check your email for a verification code.
        </Typography>

        <Box sx={{ px: 2, mb: 2 }}>
          <TextField
            required
            fullWidth
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => onVerificationCodeChange(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: {
                height: 40,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.1)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            }}
            sx={{
              mb: 2,
              "& .MuiInputBase-input": {
                color: "white",
                "&::placeholder": {
                  color: "text.secondary",
                  opacity: 1,
                },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !verificationCode}
            sx={{
              height: "40px !important",
              background: `linear-gradient(45deg, #9c27b0, #673ab7) !important`,
              "&:hover": {
                background: `linear-gradient(45deg, #7b1fa2, #512da8) !important`,
              },
              "&.Mui-disabled": {
                opacity: "0.7 !important",
                background: "rgba(255, 255, 255, 0.12) !important",
              },
              textTransform: "none",
              fontSize: "0.9rem",
              mb: 2,
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : "Verify"}
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: "0.75rem",
            mt: 1,
          }}
        >
          Didn't receive the code?{" "}
          <Link
            component="button"
            type="button"
            onClick={onResendCode}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontSize: "0.75rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Resend
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
