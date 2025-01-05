import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Event } from "../../../../types/events";

interface ShareMenuProps {
  event: Event;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onShare: (event: Event, platform: string) => void;
}

const ShareMenu: React.FC<ShareMenuProps> = ({
  event,
  anchorEl,
  onClose,
  onShare,
}) => {
  const shareOptions = [
    {
      label: "Facebook",
      icon: <FacebookIcon fontSize="small" />,
      platform: "facebook",
    },
    {
      label: "Twitter",
      icon: <TwitterIcon fontSize="small" />,
      platform: "twitter",
    },
    {
      label: "WhatsApp",
      icon: <WhatsAppIcon fontSize="small" />,
      platform: "whatsapp",
    },
    {
      label: "Email",
      icon: <EmailIcon fontSize="small" />,
      platform: "email",
    },
    {
      label: "Copy Link",
      icon: <CopyIcon fontSize="small" />,
      platform: "copy",
    },
  ];

  const handleShare = (platform: string) => {
    onShare(event, platform);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {shareOptions.map((option, index) => (
        <React.Fragment key={option.platform}>
          <MenuItem onClick={() => handleShare(option.platform)}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
          {index < shareOptions.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );
};

export default ShareMenu;
