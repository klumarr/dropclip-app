import { useState } from "react";
import { Event } from "../types/events";
import { SharePlatform } from "../types/share";
import { generateEventDeepLink } from "../utils/deepLinks";

export const useEventActions = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleShare = async (event: Event, platform: SharePlatform) => {
    const eventUrl = generateEventDeepLink(event);
    const eventText = `Check out ${event.name} on ${event.date} at ${event.venue}!`;
    const encodedText = encodeURIComponent(eventText);
    const encodedUrl = encodeURIComponent(eventUrl);

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank");
        break;
      case "instagram":
        // Instagram doesn't support direct sharing via URL
        // Instead, we'll copy the event details to clipboard for manual sharing
        await navigator.clipboard.writeText(`${eventText}\n\n${eventUrl}`);
        alert("Event details copied! Open Instagram and paste in your story or post.");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
        break;
      case "sms":
        // Check if device is mobile
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = `sms:?&body=${encodedText}%20${encodedUrl}`;
        } else {
          alert("SMS sharing is only available on mobile devices");
        }
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodedText}&body=${eventText}%0A%0A${eventUrl}`;
        break;
      case "copy":
        await navigator.clipboard.writeText(eventUrl);
        alert("Link copied to clipboard!");
        break;
      case "qr":
        // QR code handling is done in the ShareMenu component
        break;
    }
  };

  return {
    anchorEl,
    handleShareClick,
    handleShareClose,
    handleShare,
  };
};

export default useEventActions;
