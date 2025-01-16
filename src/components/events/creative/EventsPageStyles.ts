import { styled } from "@mui/material/styles";
import { Box, Card, CardContent, Button, alpha } from "@mui/material";

export const ScrollSection = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  whiteSpace: "nowrap",
  padding: theme.spacing(1, 0),
  marginTop: 0,
  width: "100%",
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

export const EventsRow = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  "& > *": {
    width: {
      xs: "280px",
      sm: "320px",
      md: "360px",
      lg: "400px",
    },
    flexShrink: 0,
    margin: theme.spacing(1),
  },
}));

export const StyledEventCard = styled(Card)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 400,
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "scale(1.02)",
    "& .MuiIconButton-root": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}));

export const EventCardMedia = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const EventCardContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(8),
  background:
    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
  color: "white",
  zIndex: 1,
  height: "60%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: theme.spacing(0.5),
}));

export const EventStatusIndicator = styled("div")<{ $isPast: boolean }>(
  ({ theme, $isPast }) => ({
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: $isPast ? "rgba(0,0,0,0.7)" : theme.palette.primary.main,
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 500,
    zIndex: 2,
  })
);

export const ActionButtonsWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: "flex",
  gap: theme.spacing(1),
  zIndex: 2,
  "& .MuiIconButton-root": {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: 1,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
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
