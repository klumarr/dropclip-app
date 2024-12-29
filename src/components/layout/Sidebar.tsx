import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  styled,
} from "@mui/material";
import {
  Home,
  Search,
  VideoLibrary,
  AddBox,
  Favorite,
  Event,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 240,
  backgroundColor: theme.palette.background.default,
  borderRight: `1px solid ${theme.palette.divider}`,
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  overflow: "auto",
  paddingTop: 64,
  "&::-webkit-scrollbar": {
    width: 12,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    border: `3px solid ${theme.palette.background.default}`,
  },
}));

const StyledListItem = styled(ListItem)<{ active?: boolean }>(
  ({ theme, active }) => ({
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "& .MuiListItemIcon-root": {
      color: active ? theme.palette.primary.main : theme.palette.text.primary,
    },
  })
);

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const mainMenuItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Search", icon: <Search />, path: "/search" },
    { text: "Your Library", icon: <VideoLibrary />, path: "/playlists" },
  ];

  const libraryItems = [
    { text: "Create Playlist", icon: <AddBox />, path: "/create-playlist" },
    { text: "Liked Videos", icon: <Favorite />, path: "/liked-videos" },
    { text: "Events", icon: <Event />, path: "/events" },
  ];

  return (
    <SidebarContainer>
      <List>
        {mainMenuItems.map((item) => (
          <StyledListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            active={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

      <List>
        {libraryItems.map((item) => (
          <StyledListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            active={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider
            sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Your Playlists
            </Typography>
          </Box>
          {/* Playlist list will be added here */}
        </>
      )}
    </SidebarContainer>
  );
};
