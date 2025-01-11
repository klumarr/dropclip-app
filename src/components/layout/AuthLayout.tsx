import React from "react";
import { Box, Paper, Container, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={isMobile ? 0 : 3}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            bgcolor: "background.paper",
            minHeight: isMobile ? "100vh" : "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
