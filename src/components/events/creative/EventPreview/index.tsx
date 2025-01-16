import React from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Divider,
  Grid,
  Stack,
  Link,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { EventDetails, UploadConfig } from "../../../../types/events";
import { formatDate, formatTime } from "../../../../utils/dateUtils";

interface EventPreviewProps {
  details: EventDetails;
  uploadConfig: UploadConfig;
}

export const EventPreview: React.FC<EventPreviewProps> = ({
  details,
  uploadConfig,
}) => {
  console.log("Rendering EventPreview with:", { details, uploadConfig });

  return (
    <Card variant="outlined">
      {details.flyerUrl && (
        <CardMedia
          component="img"
          height="300"
          image={details.flyerUrl}
          alt="Event flyer"
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent>
        <Typography variant="h5" gutterBottom>
          {details.title}
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label={details.type} color="primary" size="small" />
          {details.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="body1" paragraph>
          {details.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon color="action" />
                <Box>
                  <Typography>Starts: {formatDate(details.date)}</Typography>
                  {details.date !== details.endDate && (
                    <Typography>Ends: {formatDate(details.endDate)}</Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimeIcon color="action" />
                <Box>
                  <Typography>From: {formatTime(details.time)}</Typography>
                  <Typography>To: {formatTime(details.endTime)}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon color="action" />
                <Typography>
                  {details.venue}, {details.city}, {details.country}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {details.venue}, {details.city}, {details.country}
              </Typography>

              {details.ticketLink && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Tickets:
                  </Typography>
                  <Link
                    href={details.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ wordBreak: "break-all" }}
                  >
                    {details.ticketLink}
                  </Link>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <CloudUploadIcon color="action" />
                  <Typography variant="subtitle1">
                    Fan Upload Settings
                  </Typography>
                </Box>

                {uploadConfig.enabled ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Upload window: {formatDate(uploadConfig.startTime)} to{" "}
                      {formatDate(uploadConfig.endTime)}
                    </Typography>
                    <Typography variant="body2">
                      Allowed files:{" "}
                      {uploadConfig.allowedTypes
                        .map((type) =>
                          type === "video/*" ? "Videos" : "Images"
                        )
                        .join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      Maximum file size: {uploadConfig.maxFileSize} MB
                    </Typography>
                    {uploadConfig.maxFiles && (
                      <Typography variant="body2">
                        Maximum files per user: {uploadConfig.maxFiles}
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Fan uploads are disabled for this event
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
