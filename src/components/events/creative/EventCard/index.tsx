import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { Event } from "../../../../types/events";
import { styled } from "@mui/material/styles";
import { formatDate, formatTime } from "../../../../utils/dateUtils";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  padding: theme.spacing(1),
  display: "flex",
  gap: theme.spacing(1),
  background: "rgba(0, 0, 0, 0.5)",
  borderRadius: `0 ${theme.shape.borderRadius}px 0 ${theme.shape.borderRadius}px`,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  "& .MuiIconButton-root": {
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
}));

const InfoChip = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  "& .MuiSvgIcon-root": {
    fontSize: "1.2rem",
  },
}));

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onShare: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onShare,
}) => {
  const theme = useTheme();

  return (
    <StyledCard>
      {event.flyerImageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={event.flyerImageUrl}
          alt={event.title}
        />
      )}

      <CardOverlay>
        <ActionButtons>
          <Tooltip title="Edit event">
            <IconButton size="small" onClick={() => onEdit(event)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete event">
            <IconButton size="small" onClick={() => onDelete(event)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share event">
            <IconButton size="small" onClick={() => onShare(event)}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </ActionButtons>
      </CardOverlay>

      <StyledCardContent>
        <Box>
          <Typography variant="h6" gutterBottom>
            {event.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip label={event.type} color="primary" size="small" />
            {event.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <InfoChip>
            <CalendarIcon />
            <Typography variant="body2">
              {formatDate(event.date)}
              {event.date !== event.endDate &&
                ` - ${formatDate(event.endDate)}`}
            </Typography>
          </InfoChip>

          <InfoChip>
            <TimeIcon />
            <Typography variant="body2">
              {formatTime(event.time)} - {formatTime(event.endTime)}
            </Typography>
          </InfoChip>

          <InfoChip>
            <LocationIcon />
            <Typography variant="body2">
              {event.venue}, {event.city}, {event.country}
            </Typography>
          </InfoChip>
        </Box>
      </StyledCardContent>
    </StyledCard>
  );
};
