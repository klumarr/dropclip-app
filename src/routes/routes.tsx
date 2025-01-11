import VideoUploadPage from "../pages/creative/VideoUploadPage";
import { UserType } from "../types/auth.types";

// ... existing imports ...

export const routes = [
  // ... existing routes ...
  {
    path: "/creative/videos/upload",
    element: <VideoUploadPage />,
    allowedUserTypes: [UserType.CREATIVE],
  },
  // ... other routes ...
];
