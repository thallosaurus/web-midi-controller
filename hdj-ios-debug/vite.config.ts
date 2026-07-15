import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"

process.env.DEV = String(true);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
})
