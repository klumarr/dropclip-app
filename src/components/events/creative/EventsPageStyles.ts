import { styled } from "@mui/material/styles";
import { Box, Card, CardContent, Button, alpha } from "@mui/material";

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
  gap: "8px",
  padding: "0 8px",
});

export const EventCard = styled(Card)(({ theme }) => ({
  position: "relative",
  width: 280,
  minWidth: 280,
  height: 400,
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
  height: "100%",
  objectFit: "cover",
});

export const EventCardContent = styled(CardContent)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background:
    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  height: "60%",
  "& .MuiTypography-root": {
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
  },
  "& .MuiTypography-h6": {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  "& .MuiTypography-body1": {
    fontSize: "0.9rem",
    marginBottom: theme.spacing(0.5),
  },
  "& .MuiTypography-body2": {
    fontSize: "0.8rem",
    opacity: 0.9,
    marginBottom: theme.spacing(0.5),
  },
  "& .MuiIconButton-root": {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.3)",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.5)",
    },
  },
}));

export const EventStatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isPast",
})<{ isPast?: boolean }>(({ theme, isPast }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: isPast
    ? alpha(theme.palette.grey[500], 0.9)
    : alpha(theme.palette.primary.main, 0.9),
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  backdropFilter: "blur(4px)",
  zIndex: 1,
}));

export const ActionButtonsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  "& .MuiIconButton-root": {
    color: "#fff",
    backgroundColor: alpha(theme.palette.common.black, 0.3),
    backdropFilter: "blur(4px)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.black, 0.5),
      transform: "scale(1.1)",
    },
  },
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 160,
  left: "50%",
  transform: "translateX(-50%)",
  padding: theme.spacing(1),
  zIndex: 1000,
  display: "flex",
  gap: theme.spacing(1),
  width: "auto",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  borderRadius: 28,
  backdropFilter: "blur(8px)",
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

export const UploadIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
  },
  "& .MuiTypography-root": {
    fontSize: "0.75rem",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
  },
}));
