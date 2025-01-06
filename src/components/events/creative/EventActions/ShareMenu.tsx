import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
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
  const handleShare = (platform: SharePlatform) => {
    if (event) {
      onShare(event, platform);
      onClose();
    }
  };

  return (
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
      <MenuItem onClick={() => handleShare("whatsapp")}>
        <ListItemIcon>
          <WhatsAppIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Share on WhatsApp</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleShare("email")}>
        <ListItemIcon>
          <EmailIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Share via Email</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleShare("copy")}>
        <ListItemIcon>
          <ContentCopyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy Link</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ShareMenu;
