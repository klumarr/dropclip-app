import env from "../config/env.config";

export const cloudfrontOperations = {
  async invalidateCache(paths: string[]): Promise<void> {
    try {
      const response = await fetch(
        `${env.api.endpoint}/cloudfront/invalidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paths }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invalidate cache");
      }
    } catch (error) {
      console.error("Error invalidating cache:", error);
      throw error;
    }
  },

  async invalidateEventCache(eventId: string): Promise<void> {
    await this.invalidateCache([`/events/${eventId}/*`]);
  },

  async invalidateUploadCache(
    eventId: string,
    uploadId: string
  ): Promise<void> {
    await this.invalidateCache([`/uploads/${eventId}/${uploadId}/*`]);
  },

  getFileUrl(key: string): string {
    return `${env.api.endpoint}/files/${encodeURIComponent(key)}`;
  },
};
