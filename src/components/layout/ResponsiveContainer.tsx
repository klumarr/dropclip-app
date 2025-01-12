import React from "react";
import { Box, Container, useTheme, useMediaQuery } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  disableGutters?: boolean;
  spacing?: number;
  sx?: SxProps<Theme>;
  fullHeight?: boolean;
  centerContent?: boolean;
  noPadding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = "lg",
  disableGutters = false,
  spacing = 2,
  sx = {},
  fullHeight = false,
  centerContent = false,
  noPadding = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const containerStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    ...(fullHeight && {
      minHeight: "100vh",
    }),
    ...(centerContent && {
      alignItems: "center",
      justifyContent: "center",
    }),
    ...(!noPadding && {
      py: {
        xs: spacing,
        sm: spacing * 1.5,
        md: spacing * 2,
      },
      px: {
        xs: disableGutters ? 0 : 2,
        sm: disableGutters ? 0 : 3,
        md: disableGutters ? 0 : 4,
      },
    }),
    ...sx,
  };

  const contentStyles: SxProps<Theme> = {
    width: "100%",
    maxWidth: maxWidth === false ? "none" : theme.breakpoints.values[maxWidth],
    mx: "auto",
    ...(isMobile && {
      px: disableGutters ? 0 : 2,
    }),
    ...(isTablet && {
      px: disableGutters ? 0 : 3,
    }),
  };

  return (
    <Box sx={containerStyles}>
      <Box sx={contentStyles}>{children}</Box>
    </Box>
  );
};
