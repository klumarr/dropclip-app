import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Instagram as InstagramIcon,
  Sms as SmsIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { Event } from "../../../../types/events";
import { SharePlatform } from "../../../../types/share";
import { generateEventDeepLink } from "../../../../utils/deepLinks";

interface ShareMenuProps {
  event: Event | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onShare: (event: Event, platform: SharePlatform) => Promise<void>;
}

const ShareMenu: React.FC<ShareMenuProps> = ({
  event,
  open,
  anchorEl,
  onClose,
  onShare,
}) => {
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const getShareUrl = (event: Event) => {
    return generateEventDeepLink(event);
  };

  const handleShare = async (platform: SharePlatform) => {
    if (!event) return;

    const shareUrl = getShareUrl(event);
    const shareText = `Check out ${event.name} at ${event.venue}!`;

    try {
      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`,
            "_blank"
          );
          break;
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              `${shareText}\n${shareUrl}`
            )}`,
            "_blank"
          );
          break;
        case "email":
          window.location.href = `mailto:?subject=${encodeURIComponent(
            event.name
          )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          break;
        case "sms":
          // Only works on mobile devices
          window.location.href = `sms:?body=${encodeURIComponent(
            `${shareText}\n${shareUrl}`
          )}`;
          break;
        case "instagram":
          // Copy to clipboard since Instagram doesn't support direct sharing
          await navigator.clipboard.writeText(shareUrl);
          setSnackbarMessage(
            "Link copied! Share it in your Instagram bio or story"
          );
          setSnackbarOpen(true);
          break;
        case "copy":
          await navigator.clipboard.writeText(shareUrl);
          setSnackbarMessage("Link copied to clipboard!");
          setSnackbarOpen(true);
          break;
        case "qr":
          setQrDialogOpen(true);
          break;
      }

      await onShare(event, platform);
    } catch (error) {
      console.error("Error sharing:", error);
      setSnackbarMessage("Failed to share. Please try again.");
      setSnackbarOpen(true);
    }

    if (platform !== "qr") {
      onClose();
    }
  };

  return (
    <>
      <Menu
        id="share-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        MenuListProps={{
          "aria-labelledby": "share-button",
        }}
      >
        <MenuItem onClick={() => handleShare("facebook")}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("twitter")}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("instagram")}>
          <ListItemIcon>
            <InstagramIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("whatsapp")}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("sms")}>
          <ListItemIcon>
            <SmsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via SMS</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("email")}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("qr")}>
          <ListItemIcon>
            <QrCodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Show QR Code</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("copy")}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Event QR Code</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
          }}
        >
          {event && (
            <QRCodeSVG
              value={getShareUrl(event)}
              size={256}
              level="H"
              includeMargin={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              const svg = document.querySelector("svg");
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  const link = document.createElement("a");
                  link.download = `${event?.name}-qr.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                };
                img.src = "data:image/svg+xml;base64," + btoa(svgData);
              }
            }}
            color="primary"
          >
            Download QR Code
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default ShareMenu;
