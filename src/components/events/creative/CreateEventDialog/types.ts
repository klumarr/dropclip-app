import { Event, EventFormData, UploadConfig } from "../../../../types/events";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface CreateEventFormProps {
  formData: EventFormData;
  onChange: (field: keyof EventFormData, value: any) => void;
  errors: Record<string, string>;
  onSubmit: (data: EventFormData) => Promise<void>;
  formError?: { message: string };
}

export interface UploadConfigFormProps {
  config: UploadConfig;
  onChange: (field: keyof UploadConfig, value: any) => void;
  errors: Record<string, string>;
}

export interface CreateEventDialogProps {
  className?: string;
}

export interface DialogActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export interface ImageUploadProps {
  imageUrl?: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  error?: string;
  disabled?: boolean;
}
