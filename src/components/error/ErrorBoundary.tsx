import React from "react";
import { useRouteError } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {error?.message || "An unexpected error occurred"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => (window.location.href = "/")}
      >
        Go to Home
      </Button>
    </Box>
  );
};
