import { Event } from "../../../../types/events";

export interface ShareMenuProps {
  event: Event | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onShare: (platform: SharePlatform) => void;
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
  className?: string;
}

export type SharePlatform =
  | "facebook"
  | "twitter"
  | "whatsapp"
  | "email"
  | "copy";

export interface ShareOption {
  platform: SharePlatform;
  label: string;
  icon: React.ElementType;
  color?: string;
}
