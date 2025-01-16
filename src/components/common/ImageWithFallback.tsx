import React, { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { BrokenImage as BrokenImageIcon } from "@mui/icons-material";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  showLoadingIndicator?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText = "Image not available",
  showLoadingIndicator = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    console.log("✅ Image loaded successfully:", { src });
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    console.error("❌ Image load error:", { src });
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        ...props.style,
      }}
    >
      {isLoading && showLoadingIndicator && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            p: 2,
            textAlign: "center",
          }}
        >
          <BrokenImageIcon sx={{ fontSize: 48, opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {fallbackText}
          </Typography>
        </Box>
      ) : (
        <img
          {...props}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            ...props.style,
            display: isLoading ? "none" : "block",
          }}
        />
      )}
    </Box>
  );
};

export default ImageWithFallback;
