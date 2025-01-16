import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  Link,
  DialogTitle,
  Grid,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  LocalActivity as TicketIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  StyledEventCard,
  EventCardMedia,
  EventCardContent,
  EventStatusIndicator,
  ActionButtonsWrapper,
} from "../creative/EventsPageStyles";
import { Event } from "../../../types/events";
import ShareMenu from "../creative/EventActions/ShareMenu";
import ImageWithFallback from "../../common/ImageWithFallback";
import { FlyerScanner } from "../creative/FlyerScanner";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onShare: (event: Event) => Promise<void>;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onShare,
  isPast = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(event);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleImageClick = () => {
    if (event.flyerUrl) {
      setIsImageDialogOpen(true);
    } else {
      setIsScannerOpen(true);
    }
  };

  const handleScanComplete = (scannedData: any) => {
    setIsScannerOpen(false);
    onEdit({ ...event, ...scannedData });
  };

  const getLocationString = (event: Event) => {
    return [event.venue, event.city, event.country].filter(Boolean).join(", ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <StyledEventCard>
        <EventStatusIndicator $isPast={isPast}>
          {isPast ? "Past" : "Upcoming"}
        </EventStatusIndicator>

        {event.flyerUrl && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: "pointer",
            }}
            onClick={handleImageClick}
          >
            <ImageWithFallback
              src={event.flyerUrl}
              alt={event.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        <EventCardContent>
          <Box sx={{ mb: 0.5 }}>
            <Chip
              label={event.type}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                backdropFilter: "blur(4px)",
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
              mb: 0.25,
              lineHeight: 1.2,
            }}
          >
            {event.name}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              mb: 0.25,
              lineHeight: 1.3,
            }}
          >
            {formatDate(event.date)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              lineHeight: 1.2,
            }}
          >
            {getLocationString(event)}
          </Typography>
        </EventCardContent>

        <ActionButtonsWrapper>
          <IconButton
            onClick={() => onEdit(event)}
            size="small"
            sx={{ color: "white" }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={handleDeleteClick}
            size="small"
            sx={{ color: "white" }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={handleShareClick}
            size="small"
            sx={{ color: "white" }}
          >
            <ShareIcon />
          </IconButton>
          {event.ticketLink && (
            <IconButton
              href={event.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: "white" }}
            >
              <TicketIcon />
            </IconButton>
          )}
        </ActionButtonsWrapper>
      </StyledEventCard>

      <Dialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{event.name}</Typography>
          <IconButton
            onClick={() => setIsImageDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {event.flyerUrl && (
                <Box sx={{ width: "100%", position: "relative" }}>
                  <ImageWithFallback
                    src={event.flyerUrl}
                    alt={event.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Event Type
                  </Typography>
                  <Chip label={event.type} size="small" />
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(event.date)} at {event.time}
                  </Typography>
                  {event.endDate && (
                    <Typography variant="body2" color="text.secondary">
                      Until {formatDate(event.endDate)}
                      {event.endTime && ` at ${event.endTime}`}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {getLocationString(event)}
                  </Typography>
                </Box>

                {event.description && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{event.description}</Typography>
                  </Box>
                )}

                {event.tags && event.tags.length > 0 && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {event.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {event.ticketLink && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TicketIcon />}
                    href={event.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Tickets
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.name}"? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 1 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </Box>
      </Dialog>

      <FlyerScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onEventDetected={handleScanComplete}
      />

      <ShareMenu
        event={event}
        anchorEl={anchorEl}
        onClose={handleShareClose}
        onShare={onShare}
        open={Boolean(anchorEl)}
      />
    </>
  );
};

export default EventCard;
