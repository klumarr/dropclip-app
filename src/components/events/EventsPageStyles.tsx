import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const ScrollSection = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  overflowY: "hidden",
  paddingBottom: theme.spacing(2),
  "&::-webkit-scrollbar": {
    height: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.primary.main,
    borderRadius: 3,
  },
}));

export const EventsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  minHeight: 300,
}));

export const EventCard = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 280,
  minWidth: 280,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: "transform 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

export const EventCardMedia = styled("img")({
  width: "100%",
  height: 200,
  objectFit: "cover",
});

export const EventCardContent = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(2),
  background:
    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
  color: theme.palette.common.white,
  marginTop: -80,
  height: 200,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  "& .MuiTypography-root": {
    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
  },
  "& .MuiIconButton-root": {
    color: theme.palette.common.white,
    backgroundColor: "rgba(0,0,0,0.4)",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.6)",
    },
  },
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.shape.borderRadius * 2,
  zIndex: 1000,
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
  borderRadius: theme.shape.borderRadius * 2,
}));

export const UploadIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: "rgba(0,0,0,0.7)",
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  fontSize: "0.75rem",
  zIndex: 1,
}));
