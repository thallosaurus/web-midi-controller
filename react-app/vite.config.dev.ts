import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

process.env.VITE_BACKEND = "ws://127.0.0.1:8080/ws"

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
