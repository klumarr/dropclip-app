import React from "react";
import { Box, Paper } from "@mui/material";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: number | string;
  noPaper?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 600,
  noPaper = false,
}) => {
  const content = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: { xs: "flex-start", sm: "center" },
        p: { xs: 0, sm: 3 },
        width: "100%",
        overflow: "hidden",
      }}
    >
      {noPaper ? (
        <Box
          sx={{
            width: "100%",
            maxWidth,
            height: { xs: "auto", sm: "auto" },
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            pt: { xs: 2, sm: 4 },
            pb: { xs: 1, sm: 4 },
            width: "100%",
            maxWidth,
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 3 },
            height: { xs: "auto", sm: "auto" },
            minHeight: { xs: "auto", sm: "auto" },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {children}
        </Paper>
      )}
    </Box>
  );

  return content;
};
