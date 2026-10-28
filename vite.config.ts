import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": root } },
  server: {
    port: 5173,
    // Same-origin in dev, so the httpOnly auth cookie just works
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  build: { outDir: "dist" },
})
