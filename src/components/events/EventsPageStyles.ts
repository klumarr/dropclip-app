import { styled } from "@mui/material/styles";
import { Box, Card, CardContent, Button } from "@mui/material";

export const ScrollSection = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  whiteSpace: "nowrap",
  padding: theme.spacing(1, 0),
  marginTop: 0,
  "&::-webkit-scrollbar": {
    height: 8,
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
}));

export const EventsRow = styled(Box)({
  display: "inline-flex",
  gap: "16px",
  padding: "0 16px",
});

export const EventCard = styled(Card)(({ theme }) => ({
  display: "inline-block",
  width: 250,
  flexShrink: 0,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "translateY(-4px)",
  },
  whiteSpace: "normal",
  cursor: "pointer",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  margin: theme.spacing(1),
  position: "relative",
}));

export const EventCardMedia = styled("img")({
  width: "100%",
  height: 300,
  objectFit: "cover",
  display: "block",
  cursor: "pointer",
});

export const EventCardContent = styled(CardContent)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
  maxHeight: "25%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  "& .MuiTypography-root": {
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
  },
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 120,
  left: "50%",
  transform: "translateX(-50%)",
  padding: theme.spacing(1),
  zIndex: 1000,
  display: "flex",
  gap: theme.spacing(1),
  width: "auto",
  justifyContent: "center",
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 80,
  height: 28,
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.875rem",
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  "&.MuiButton-outlined": {
    borderColor: "rgba(255, 255, 255, 0.3)",
    "&:hover": {
      borderColor: "rgba(255, 255, 255, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },
  "&.MuiButton-contained": {
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));
