import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { NotificationTest } from "../components/test/NotificationTest";

export const TestComponentsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Components
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Notification Service Test
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <NotificationTest />
      </Box>
    </Box>
  );
};

export default TestComponentsPage;
