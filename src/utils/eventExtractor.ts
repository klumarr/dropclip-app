import { EventFormData, UploadConfig } from "../types/events";
import { createWorker } from "tesseract.js";

const defaultUploadConfig: UploadConfig = {
  enabled: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ["video/*"],
  maxFiles: 10,
};

interface ExtractedEventData {
  name?: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  venue?: string;
  city?: string;
  country?: string;
  type?: "Other";
  ticketLink?: string;
}

// Helper functions to extract specific information
const extractTitle = (text: string): string | undefined => {
  const patterns = [
    // Event name after common prefixes
    /(?:PRESENTS|FEATURING|PRESENTS:|PROUDLY PRESENTS)\s+([A-Z][^\n]+)/i,
    // Event name with common suffixes
    /([A-Z][^\n]+)(?:\s+TOUR|CONCERT|FESTIVAL|SHOW|PERFORMANCE)(?:\s|$)/i,
    // Text in all caps at start of line
    /^([A-Z][A-Z\s&]+)(?:\n|$)/m,
    // Long text without lowercase
    /(?:^|\n)([A-Z][^a-z\n]{10,})/m,
    // Text between quotes
    /"([^"]+)"/,
    // Text after common event words
    /(?:EVENT|SHOW|CONCERT|PERFORMANCE|FESTIVAL):\s+([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const title = match[1].trim();
      // Remove common prefixes/suffixes
      return title.replace(/^(?:THE|A|AN)\s+/i, "");
    }
  }

  // Fallback: first line if nothing else matches
  const firstLine = text.split("\n")[0].trim();
  return firstLine.length > 0 ? firstLine : "Untitled Event";
};

const extractDate = (text: string): string | undefined => {
  const patterns = [
    // Common date formats
    /(?:ON|DATE:?|WHEN:?)\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})/i,
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})/i,
    // ISO format
    /\b(\d{4}-\d{2}-\d{2})\b/,
    // US format
    /\b(\d{2}\/\d{2}\/\d{4})\b/,
    // UK format
    /\b(\d{2}-\d{2}-\d{4})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
  }

  return new Date().toISOString().split("T")[0];
};

const extractTime = (text: string): { time?: string; endTime?: string } => {
  const timePatterns = [
    // 24-hour format
    /(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/,
    // 12-hour format
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))(?:\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)))?/i,
    // Time words
    /(?:FROM|STARTS?|DOORS?|OPENS?)\s*(?:@|AT)?\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      const startTime = match[1]?.trim();
      const endTime = match[2]?.trim();

      // Convert to 24-hour format if needed
      return {
        time: startTime ? convertTo24Hour(startTime) : undefined,
        endTime: endTime ? convertTo24Hour(endTime) : undefined,
      };
    }
  }

  return { time: "18:00" };
};

const convertTo24Hour = (time: string): string => {
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours);
  const isPM = time.toLowerCase().includes("pm");
  const isAM = time.toLowerCase().includes("am");

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${
    minutes ? minutes.replace(/[^\d]/g, "") : "00"
  }`;
};

const extractLocation = (text: string): string | undefined => {
  const patterns = [
    // Location after keywords
    /(?:AT|VENUE|LOCATION|WHERE):\s*([^\n,]+)(?:,|\n|$)/i,
    // Address-like patterns
    /(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd)[^,\n]*)/i,
    // Venue names
    /(?:^|\n)([A-Z][^,\n]+(?:Club|Lounge|Bar|Venue|Arena|Stadium|Hall|Theatre|Theater)[^,\n]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
};

export const extractEventData = async (
  imageFile: File
): Promise<Partial<EventFormData>> => {
  try {
    console.log("Starting event data extraction from image:", imageFile.name);

    const worker = await createWorker({
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const {
      data: { text },
    } = await worker.recognize(imageFile);
    await worker.terminate();

    console.log("Extracted text:", text);

    // Extract event details from the text
    const extractedData: ExtractedEventData = {
      name: extractTitle(text),
      description: text.substring(0, 500), // First 500 characters as description
      date: extractDate(text),
      ...extractTime(text),
      venue: extractLocation(text),
      city: "",
      country: "",
      type: "Other",
    };

    console.log("Extracted event data:", extractedData);

    return {
      ...extractedData,
      uploadConfig: defaultUploadConfig,
    };
  } catch (error) {
    console.error("Error extracting event data:", error);
    throw error;
  }
};
