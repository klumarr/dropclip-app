import React from "react";
import { Box, Typography } from "@mui/material";

export const TestComponentsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Components
      </Typography>
      {/* Add test components here */}
    </Box>
  );
};

export default TestComponentsPage;
