import { EventFormData } from "./events";

export interface ConfidenceScores {
  name: number;
  date: number;
  time: number;
  venue: number;
}

export interface ExtractedEventData extends Partial<EventFormData> {
  confidence?: ConfidenceScores;
}

export class EventExtractionError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = "EventExtractionError";
    Object.setPrototypeOf(this, EventExtractionError.prototype);
  }
}

export const MIN_CONFIDENCE_THRESHOLD = 0.6;

export const validateExtractedData = (data: ExtractedEventData): boolean => {
  // Check confidence scores
  if (data.confidence) {
    const avgConfidence =
      (data.confidence.name +
        data.confidence.date +
        data.confidence.time +
        data.confidence.venue) /
      4;

    if (avgConfidence < MIN_CONFIDENCE_THRESHOLD) {
      console.warn(`Low overall confidence score: ${avgConfidence}`);
      return false;
    }
  }

  // Validate required fields
  if (!data.name || data.name.length < 3) return false;
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return false;
  if (data.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time))
    return false;

  return true;
};
