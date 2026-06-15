import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // Build for Vercel serverless functions
  preset: "vercel",
});
