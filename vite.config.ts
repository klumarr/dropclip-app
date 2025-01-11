import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: "stream-browserify",
      buffer: "buffer",
      util: "util",
    },
  },
  define: {
    global: {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5174, // Your current port
    strictPort: true, // Don't try other ports if 5174 is taken
  },
});
