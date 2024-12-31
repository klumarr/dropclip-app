import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  styled,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Public as PublicIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import InstagramService from "../../services/instagram";

const PlatformCard = styled(Card)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  marginBottom: theme.spacing(2),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  status: "connected" | "disconnected" | "error";
  accessToken?: string;
}

interface SocialMediaHubProps {
  onEventImported: (eventData: ImportedEventData) => void;
}

interface ImportedEventData {
  title: string;
  date: string;
  location: string;
  description: string;
}

const SocialMediaHub = ({ onEventImported }: SocialMediaHubProps) => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: <InstagramIcon />,
      connected: false,
      status: "disconnected",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FacebookIcon />,
      connected: false,
      status: "disconnected",
    },
    {
      id: "ra",
      name: "Resident Advisor",
      icon: <PublicIcon />,
      connected: false,
      status: "disconnected",
    },
  ]);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    // Check for Instagram auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      handleInstagramCallback(code);
    }
  }, []);

  const handleInstagramCallback = async (code: string) => {
    try {
      const instagram = InstagramService.getInstance();
      const accessToken = await instagram.getAccessToken(code);

      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === "instagram"
            ? {
                ...p,
                connected: true,
                status: "connected",
                lastSync: new Date().toISOString(),
                accessToken,
              }
            : p
        )
      );

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error handling Instagram callback:", error);
      setPlatforms((prev) =>
        prev.map((p) => (p.id === "instagram" ? { ...p, status: "error" } : p))
      );
    }
  };

  const handleConnect = async (platformId: string) => {
    if (platformId === "instagram") {
      try {
        const instagram = InstagramService.getInstance();
        const authUrl = instagram.getAuthUrl();
        window.location.href = authUrl;
      } catch (error) {
        console.error("Error connecting to Instagram:", error);
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === "instagram" ? { ...p, status: "error" } : p
          )
        );
      }
    } else {
      // Mock connection for other platforms
      console.log(`Connecting to ${platformId}...`);
      setPlatforms(
        platforms.map((p) =>
          p.id === platformId
            ? {
                ...p,
                connected: true,
                status: "connected",
                lastSync: new Date().toISOString(),
              }
            : p
        )
      );
    }
  };

  const handleSync = async (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform?.accessToken) return;

    setSyncing(platformId);

    try {
      if (platformId === "instagram") {
        const instagram = InstagramService.getInstance();
        const media = await instagram.getUserMedia(platform.accessToken);

        // Convert Instagram posts to events
        for (const post of media) {
          const eventData = {
            title: post.caption?.split("\n")[0] || "Instagram Event",
            date: new Date(post.timestamp).toISOString(),
            location: extractLocationFromCaption(post.caption),
            description: post.caption,
            imageUrl: post.media_url,
            platform: "instagram",
            originalPost: post.permalink,
          };

          onEventImported(eventData);
        }

        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === platformId
              ? { ...p, lastSync: new Date().toISOString() }
              : p
          )
        );
      } else {
        // Mock sync for other platforms
        const mockEvent = {
          title: "Event from " + platformId,
          date: new Date().toISOString(),
          location: "Imported Location",
          description: "Imported from social media",
          platform: platformId,
        };

        onEventImported(mockEvent);
      }
    } catch (error) {
      console.error(`Error syncing with ${platformId}:`, error);
      setPlatforms((prev) =>
        prev.map((p) => (p.id === platformId ? { ...p, status: "error" } : p))
      );
    } finally {
      setSyncing(null);
    }
  };

  const extractLocationFromCaption = (caption: string): string => {
    // Try to find location in caption (📍 or @ followed by location)
    const locationMatch = caption?.match(/(?:📍|@)([^,\n]+)/);
    return locationMatch?.[1] || "Location TBD";
  };

  const handleAutoSync = (platformId: string, enabled: boolean) => {
    console.log(
      `Auto-sync ${enabled ? "enabled" : "disabled"} for ${platformId}`
    );
    // Implement auto-sync logic here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircleIcon color="success" />;
      case "error":
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Connected Platforms
      </Typography>

      {platforms.map((platform) => (
        <PlatformCard key={platform.id}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {platform.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {platform.name}
              </Typography>
              <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                {platform.status !== "disconnected" && (
                  <Tooltip title={platform.status}>
                    <IconButton size="small">
                      {getStatusIcon(platform.status)}
                    </IconButton>
                  </Tooltip>
                )}
                {platform.lastSync && (
                  <Chip
                    size="small"
                    label={`Last sync: ${new Date(
                      platform.lastSync
                    ).toLocaleString()}`}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Box>

            {platform.connected ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      onChange={(e) =>
                        handleAutoSync(platform.id, e.target.checked)
                      }
                    />
                  }
                  label="Auto-sync events"
                />
                <Button
                  startIcon={
                    syncing === platform.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SyncIcon />
                    )
                  }
                  onClick={() => handleSync(platform.id)}
                  disabled={syncing === platform.id}
                  sx={{ ml: "auto" }}
                >
                  {syncing === platform.id ? "Syncing..." : "Sync Now"}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={() => handleConnect(platform.id)}
              >
                Connect {platform.name}
              </Button>
            )}
          </CardContent>
        </PlatformCard>
      ))}
    </Box>
  );
};

export default SocialMediaHub;
