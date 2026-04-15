import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const r = (...segments: string[]) => fileURLToPath(new URL(path.posix.join(...segments), import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": r("./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
