import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MoreVert,
  CloudDownload,
  Delete,
  Folder,
  InsertDriveFile,
} from "@mui/icons-material";

interface DownloadItem {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "document";
  size: string;
  progress: number;
  status: "downloading" | "completed" | "failed";
  downloadDate: string;
}

const DownloadsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Mock data - replace with actual data from API
  const downloads: DownloadItem[] = [
    {
      id: "1",
      name: "Performance Video.mp4",
      type: "video",
      size: "1.2 GB",
      progress: 100,
      status: "completed",
      downloadDate: "2023-12-01",
    },
    {
      id: "2",
      name: "Background Music.mp3",
      type: "audio",
      size: "45 MB",
      progress: 65,
      status: "downloading",
      downloadDate: "2023-12-02",
    },
    // Add more mock downloads here
  ];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    itemId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDelete = () => {
    if (selectedItem) {
      // Implement delete functionality
      console.log("Delete download:", selectedItem);
    }
    handleMenuClose();
  };

  const getFileIcon = (type: DownloadItem["type"]) => {
    switch (type) {
      case "video":
        return <InsertDriveFile sx={{ color: "primary.main" }} />;
      case "audio":
        return <InsertDriveFile sx={{ color: "secondary.main" }} />;
      case "image":
        return <InsertDriveFile sx={{ color: "success.main" }} />;
      case "document":
        return <InsertDriveFile sx={{ color: "info.main" }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Download Center
      </Typography>

      <Grid container spacing={3}>
        {downloads.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getFileIcon(item.type)}
                  <Box sx={{ ml: 1, flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.size}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, item.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                {item.status === "downloading" && (
                  <Box sx={{ width: "100%", mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="right"
                      sx={{ mt: 0.5 }}
                    >
                      {item.progress}%
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Downloaded on{" "}
                    {new Date(item.downloadDate).toLocaleDateString()}
                  </Typography>
                  {item.status === "completed" && (
                    <Button
                      size="small"
                      startIcon={<CloudDownload />}
                      onClick={() => {
                        // Implement download functionality
                        console.log("Download file:", item.id);
                      }}
                    >
                      Download
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {downloads.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center",
          }}
        >
          <Folder sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No downloads available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your downloaded files will appear here
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DownloadsPage;
