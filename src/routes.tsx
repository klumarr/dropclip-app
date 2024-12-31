import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import SignInPage from "./pages/SignInPage.tsx";
import SignUpPage from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import EventManagementPage from "./pages/EventManagementPage";
import EventUploadPage from "./pages/EventUploadPage";
import { SettingsPage } from "./pages/SettingsPage";
import FanUploadPage from "./pages/FanUploadPage";
import UploadSuccessPage from "./pages/UploadSuccessPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import DownloadCenterPage from "./pages/DownloadCenterPage";

export const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/upload/:linkId" element={<FanUploadPage />} />
        <Route
          path="/upload-success/:uploadId"
          element={<UploadSuccessPage />}
        />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/event/:eventId" element={<EventManagementPage />} />
      <Route path="/event/:eventId/upload" element={<EventUploadPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/playlists" element={<PlaylistsPage />} />
      <Route path="/downloads" element={<DownloadCenterPage />} />
      <Route path="/upload/:linkId" element={<FanUploadPage />} />
      <Route path="/upload-success/:uploadId" element={<UploadSuccessPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
