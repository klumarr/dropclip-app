import {
  Event,
  EventFormData,
  UploadConfig,
  defaultUploadConfig as baseDefaultUploadConfig,
  initialEventFormData as baseInitialEventFormData,
  CategorizedEvents,
} from "../../../types/events";

export type { EventFormData, UploadConfig, Event, CategorizedEvents };

export interface EventsListProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  isPast?: boolean;
}

// Export the base configurations
export const defaultUploadConfig = baseDefaultUploadConfig;
export const initialEventFormData = baseInitialEventFormData;
