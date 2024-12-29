import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Access Denied
      </Typography>

      <Typography variant="body1" paragraph>
        You don't have permission to access this page.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/dashboard")}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};
