import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "./server.ts",
      // Add output configuration
      output: {
        dir: "./dist/server",
      },
    },
  },
  // Ensure build outputs to correct location
  build: {
    outDir: "./dist",
  },
});