import { Buffer } from "buffer";

// Polyfill global
(window as any).global = window;

// Polyfill process
(window as any).process = {
  env: {
    NODE_ENV: import.meta.env.MODE,
    VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION || "eu-north-1",
    VITE_S3_BUCKET: import.meta.env.VITE_S3_BUCKET || "dropclip-content",
  },
  browser: true,
  version: "",
  platform: "browser",
  nextTick: (fn: () => void) => setTimeout(fn, 0),
};

// Polyfill Buffer
(window as any).Buffer = Buffer;

// Polyfill util
(window as any).util = {
  debuglog: () => {},
  inspect: () => {},
};
