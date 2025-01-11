import { Box, CircularProgress } from "@mui/material";

export const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
};
