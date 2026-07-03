import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import fs from "fs";

process.env.VITE_BACKEND = "ws://127.0.0.1:8080/ws"
const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), legacy({
    targets: ["Android >= 4"],
    renderModernChunks: false,
  })],
  optimizeDeps: {
    include: ["@hdj/homebrewdj-web-client"],
  }
})
