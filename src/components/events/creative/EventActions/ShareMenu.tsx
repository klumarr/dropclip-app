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
  const eventUrl = event ? `${window.location.origin}/events/${event.id}` : "";

  const handleShare = (platform: SharePlatform) => {
    if (event) {
      onShare(event, platform);
      if (platform !== "qr") {
        onClose();
      }
    }
  };

  const handleQrClick = () => {
    setQrDialogOpen(true);
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
        <MenuItem onClick={handleQrClick}>
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
          <QRCodeSVG
            value={eventUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
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
    </>
  );
};

export default ShareMenu;
