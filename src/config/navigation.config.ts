import { UserType } from "../types/auth.types";
import {
  Dashboard,
  Event,
  Search,
  VideoLibrary,
  CloudDownload,
  Collections,
  Settings,
  Analytics,
  Favorite,
} from "@mui/icons-material";

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  showInMobileNav?: boolean;
  showInDashboard?: boolean;
  showInSidebar?: boolean;
}

interface NavigationConfig {
  creative: NavigationItem[];
  fan: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  creative: [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/creative/dashboard",
      icon: Dashboard,
      showInMobileNav: true,
      showInSidebar: true,
    },
    {
      id: "videos",
      label: "My Videos",
      path: "/creative/videos",
      icon: VideoLibrary,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "events",
      label: "Events",
      path: "/creative/events",
      icon: Event,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "memories",
      label: "Memory Manager",
      path: "/creative/memories",
      icon: Collections,
      showInDashboard: true,
      showInSidebar: true,
      showInMobileNav: true,
    },
    {
      id: "analytics",
      label: "Analytics",
      path: "/creative/analytics",
      icon: Analytics,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "settings",
      label: "Settings",
      path: "/creative/settings",
      icon: Settings,
      showInDashboard: true,
      showInSidebar: true,
    },
  ],
  fan: [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/fan/dashboard",
      icon: Dashboard,
      showInMobileNav: true,
      showInSidebar: true,
    },
    {
      id: "search",
      label: "Discover",
      path: "/fan/search",
      icon: Search,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "events",
      label: "Events",
      path: "/fan/events",
      icon: Event,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "playlists",
      label: "My Playlists",
      path: "/fan/playlists",
      icon: VideoLibrary,
      showInMobileNav: true,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "following",
      label: "Following",
      path: "/fan/following",
      icon: Favorite,
      showInDashboard: true,
      showInSidebar: true,
    },
    {
      id: "settings",
      label: "Settings",
      path: "/fan/settings",
      icon: Settings,
      showInDashboard: true,
      showInSidebar: true,
    },
  ],
};

export const getAuthorizedNavItems = (
  userType: UserType | undefined,
  displayLocation: "mobileNav" | "dashboard" | "sidebar"
): NavigationItem[] => {
  if (!userType) return [];

  const items =
    userType === UserType.CREATIVE
      ? navigationConfig.creative
      : navigationConfig.fan;

  return items.filter((item) => {
    switch (displayLocation) {
      case "mobileNav":
        return item.showInMobileNav;
      case "dashboard":
        return item.showInDashboard;
      case "sidebar":
        return item.showInSidebar;
      default:
        return false;
    }
  });
};
