export class UploadError extends Error {
  constructor(
    message: string,
    public code:
      | "FILE_TOO_LARGE"
      | "INVALID_FILE_TYPE"
      | "UPLOAD_LIMIT_REACHED"
      | "NETWORK_ERROR"
      | "UNAUTHORIZED"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "UploadError";
  }
}
