import { Event } from "../../../../types/events";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface EventsGridProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  emptyMessage: string;
}

export interface EventTabsProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  upcomingCount: number;
  pastCount: number;
  automaticCount: number;
}

export interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  isPast?: boolean;
}

export interface EventsListProps {
  className?: string;
}
