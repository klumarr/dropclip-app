import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { UserType } from "../types/auth.types";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    from: string;
    currentUserType: UserType;
    requiredUserType: UserType;
  } | null;

  return (
    <Box
      sx={{
        p: 3,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Access Restricted
      </Typography>
      <Typography variant="body1" paragraph>
        {state ? (
          <>
            This page requires a {state.requiredUserType.toLowerCase()} account.
            <br />
            Your current account type is: {state.currentUserType.toLowerCase()}.
          </>
        ) : (
          "You don't have permission to access this page."
        )}
      </Typography>
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2 }}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};
