import { Event } from "../types/events";
import { SharePlatform } from "../types/share";

export const trackEventShare = async (
  event: Event,
  platform: SharePlatform
): Promise<void> => {
  console.log("Analytics - Event Share:", {
    eventId: event.id,
    eventName: event.name,
    platform,
    timestamp: Date.now(),
  });
};
