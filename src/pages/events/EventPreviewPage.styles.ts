import { styled } from "@mui/material/styles";
import { Box, Container, Paper } from "@mui/material";

export const PreviewContainer = styled(Container)(({ theme }) => ({
  padding: 0,
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
}));

export const HeroSection = styled(Paper)(({ theme }) => ({
  position: "relative",
  height: "60vh",
  minHeight: 400,
  width: "100%",
  borderRadius: 0,
  overflow: "hidden",
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.01)",
  },
  [theme.breakpoints.up("sm")]: {
    borderRadius: theme.shape.borderRadius,
    height: "70vh",
  },
}));

export const HeroImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "rgba(0, 0, 0, 0.03)",
});

export const ContentSection = styled(Box)(({ theme }) => ({
  position: "relative",
  marginTop: theme.spacing(-6),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(-8),
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
}));

export const ActionBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  bottom: 0,
  zIndex: 1,
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    position: "static",
    boxShadow: "none",
    borderTop: "none",
  },
}));

export const CreativeSectionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],

  "& .MuiAvatar-root": {
    width: 64,
    height: 64,
    marginRight: theme.spacing(2),
  },

  "& .creative-header": {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },

  "& .creative-stats": {
    display: "flex",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },

  "& .creative-actions": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
}));

export const StatsItem = styled(Box)(({ theme }) => ({
  textAlign: "center",

  "& .MuiTypography-h6": {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },

  "& .MuiTypography-body2": {
    color: theme.palette.text.secondary,
  },
}));

export const UpcomingEventsList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),

  "& .MuiTypography-subtitle1": {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
}));
