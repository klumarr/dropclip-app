import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { QRDialogProps } from "./types";

const QRDialog: React.FC<QRDialogProps> = ({ event, open, onClose }) => {
  const [qrValue, setQrValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (event) {
      try {
        const eventUrl = `${window.location.origin}/events/${event.id}`;
        setQrValue(eventUrl);
        setError(null);
      } catch (err) {
        console.error("Error generating QR code:", err);
        setError("Failed to generate QR code");
      } finally {
        setIsLoading(false);
      }
    }
  }, [event]);

  const handleDownload = () => {
    try {
      const svg = document.querySelector("svg");
      if (!svg) {
        throw new Error("QR code not found");
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.download = `${event?.title
        .toLowerCase()
        .replace(/\s+/g, "-")}-qr.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Error downloading QR code:", err);
      setError("Failed to download QR code");
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event QR Code</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <QRCodeSVG value={qrValue} size={256} level="H" includeMargin />
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  {event.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Scan this QR code to access the event page
                </Typography>
                {downloadSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    QR code downloaded successfully
                  </Alert>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={isLoading || !!error}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRDialog;
