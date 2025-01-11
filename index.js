exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // TODO: Add video processing cancellation logic here

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Video processing cancellation initiated",
        uploadId: body.uploadId,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to cancel video processing",
        error: error.message,
      }),
    };
  }
};
