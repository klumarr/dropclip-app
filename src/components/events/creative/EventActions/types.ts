import { Event } from "../../../../types/events";
import { SharePlatform } from "../../../../types/share";

export interface ShareMenuProps {
  event: Event | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onShare: (event: Event, platform: SharePlatform) => Promise<void>;
}

export interface DeleteDialogProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export interface QRDialogProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

export interface EventActionsProps {
  selectedEvent: Event;
  isLoading: boolean;
  error: string | null;
  handleInitiateDelete: (event: Event) => Promise<void>;
  handleInitiateEdit: (event: Event) => Promise<void>;
  handleConfirmDelete: () => Promise<void>;
  handleShare: (event: Event, platform: SharePlatform) => Promise<void>;
  className?: string;
}

export interface ShareOption {
  platform: SharePlatform;
  label: string;
  icon: React.ElementType;
  color?: string;
}
