import { Event } from "../types/events";

// Deep link types
export type DeepLinkType = "event" | "profile" | "collection";

export interface DeepLinkParams {
  type: DeepLinkType;
  id: string;
  referrer?: string;
}

/**
 * Generates a deep link URL for the given event
 */
export const generateEventDeepLink = (
  event: Event,
  referrer?: string
): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();

  // Add deep link parameters
  params.append("type", "event");
  params.append("id", event.id);
  if (referrer) {
    params.append("referrer", referrer);
  }

  return `${baseUrl}/events/${event.id}?${params.toString()}`;
};

/**
 * Parses a deep link URL and returns the parameters
 */
export const parseDeepLink = (url: string): DeepLinkParams | null => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const type = params.get("type") as DeepLinkType;
    const id = params.get("id");
    const referrer = params.get("referrer") || undefined;

    if (!type || !id) {
      return null;
    }

    return { type, id, referrer };
  } catch (error) {
    console.error("Error parsing deep link:", error);
    return null;
  }
};

/**
 * Handles deep link navigation based on the parameters
 */
export const handleDeepLink = async (params: DeepLinkParams): Promise<void> => {
  const { type, id } = params;

  switch (type) {
    case "event":
      // Navigate to event page
      window.location.href = `/events/${id}`;
      break;
    case "profile":
      // Navigate to profile page
      window.location.href = `/profile/${id}`;
      break;
    case "collection":
      // Navigate to collection page
      window.location.href = `/collections/${id}`;
      break;
    default:
      console.error("Unknown deep link type:", type);
  }
};
