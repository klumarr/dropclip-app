import { Event } from "../types/events";
import { SharePlatform } from "../types/share";

interface ShareEventAnalytics {
  eventId: string;
  eventName: string;
  platform: SharePlatform;
  timestamp: number;
  userId?: string;
}

/**
 * Tracks when an event is shared on any platform
 * @param event The event that was shared
 * @param platform The platform where the event was shared
 */
export const trackEventShare = async (
  event: Event,
  platform: SharePlatform
): Promise<void> => {
  try {
    const analytics: ShareEventAnalytics = {
      eventId: event.id,
      eventName: event.name,
      platform,
      timestamp: Date.now(),
    };

    // TODO: Send to analytics backend
    console.log("Analytics - Event Share:", analytics);
  } catch (error) {
    console.error("Error tracking event share:", error);
  }
};
