import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  Add as AddIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface SocialMediaHubProps {
  onEventImported: (eventData: any) => void;
}

const mockEvents = [
  {
    id: "1",
    platform: "instagram",
    title: "Live Performance",
    date: new Date("2024-03-15"),
    location: "Jazz Club Downtown",
  },
  {
    id: "2",
    platform: "facebook",
    title: "Album Release Party",
    date: new Date("2024-04-01"),
    location: "Music Hall",
  },
  {
    id: "3",
    platform: "twitter",
    title: "Open Mic Night",
    date: new Date("2024-03-20"),
    location: "The Coffee House",
  },
];

const SocialMediaHub = ({ onEventImported }: SocialMediaHubProps) => {
  const theme = useTheme();
  const [importedEvents, setImportedEvents] = useState<string[]>([]);

  const handleImport = (event: any) => {
    setImportedEvents((prev) => [...prev, event.id]);
    onEventImported(event);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook />;
      case "twitter":
        return <Twitter />;
      case "instagram":
        return <Instagram />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connected Accounts
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <Instagram />
          </ListItemIcon>
          <ListItemText
            primary="Instagram"
            secondary="Connected as @username"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Facebook />
          </ListItemIcon>
          <ListItemText primary="Facebook" secondary="Connected as Your Name" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Twitter />
          </ListItemIcon>
          <ListItemText primary="Twitter" secondary="Connected as @handle" />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Detected Events
      </Typography>
      <List>
        {mockEvents.map((event) => (
          <ListItem key={event.id}>
            <ListItemIcon>{getPlatformIcon(event.platform)}</ListItemIcon>
            <ListItemText
              primary={event.title}
              secondary={`${event.date.toLocaleDateString()} at ${
                event.location
              }`}
            />
            <ListItemSecondaryAction>
              {importedEvents.includes(event.id) ? (
                <IconButton edge="end" disabled>
                  <CheckIcon color="success" />
                </IconButton>
              ) : (
                <IconButton edge="end" onClick={() => handleImport(event)}>
                  <AddIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<Instagram />}
          onClick={() => {
            // Handle refresh
          }}
        >
          Refresh Instagram
        </Button>
      </Box>
    </Box>
  );
};

export default SocialMediaHub;
