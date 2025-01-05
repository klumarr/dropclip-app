export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (time?: string): string => {
  if (!time) return "";
  return time;
};
