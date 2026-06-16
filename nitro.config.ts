import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  // Make sure server entry is correct
  server: {
    entry: "./server.ts",
  },
  // Explicitly set output directory
  output: {
    dir: ".vercel/output",
    serverDir: ".vercel/output/server",
  },
  // Ensure the build includes all needed files
  build: {
    // Include your server entry
    include: ["./server.ts"],
  },
  // Add public assets if needed
  publicAssets: [
    {
      dir: "public",
      baseURL: "/",
    },
  ],
});