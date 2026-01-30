import { defineConfig } from "vite";
import fs from 'node:fs'

import legacy from "@vitejs/plugin-legacy";

const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;

export default defineConfig({
  plugins: [legacy({
    targets: ["Android >= 4.4"],
    additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    modernPolyfills: true,
  })],
  target: ["es5", "chrome81"],
  build: {
    modulePreload: false,
    minify: false,
    rollupOptions: {
      input: {
        main: "index.html",
        worker: "ts/websocket/main.ts"
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
