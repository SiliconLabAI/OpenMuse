import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Optional: also proxy via Vite if server not used alone
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/webhook": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/events": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
