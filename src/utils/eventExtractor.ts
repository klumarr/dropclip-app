import { EventFormData } from "../types/events";
import {
  ExtractedEventData,
  EventExtractionError,
  MIN_CONFIDENCE_THRESHOLD,
} from "../types/extraction";

export const extractEventData = async (
  file: File
): Promise<ExtractedEventData> => {
  try {
    // Mock OCR process
    const extractedData: ExtractedEventData = {
      name: "Sample Event",
      date: "2024-03-15",
      time: "19:00",
      venue: "Sample Venue",
      confidence: {
        name: 0.8,
        date: 0.9,
        time: 0.7,
        venue: 0.85,
      },
    };

    return extractedData;
  } catch (error) {
    console.error("Error extracting event data:", error);
    throw new EventExtractionError(
      "Failed to extract event data from image",
      error
    );
  }
};
