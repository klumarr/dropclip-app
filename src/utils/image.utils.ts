import defaultAvatar from "../assets/default-avatar.png";
import defaultThumbnail from "../assets/default-thumbnail.png";
import defaultCover from "../assets/default-cover.png";

export const getPlaceholderImage = (
  type: "avatar" | "thumbnail" | "cover",
  size?: string
): string => {
  // First try to use the provided URL if it exists
  switch (type) {
    case "avatar":
      return defaultAvatar;
    case "thumbnail":
      return defaultThumbnail;
    case "cover":
      return defaultCover;
    default:
      return defaultThumbnail;
  }
};

export const getFallbackImage = (
  type: "avatar" | "thumbnail" | "cover"
): string => {
  return getPlaceholderImage(type);
};

// Use this for img tags
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  type: "avatar" | "thumbnail" | "cover"
): void => {
  const img = e.currentTarget;
  img.onerror = null; // Prevent infinite loop
  img.src = getFallbackImage(type);
};
