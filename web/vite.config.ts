import { defineConfig } from "vite";
import fs from 'node:fs'

import legacy from "@vitejs/plugin-legacy";

const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;
process.env.VITE_USE_WORKER_EVENT_BUS = true;
process.env.VITE_SELF_UPDATE_WIDGETS = false;
process.env.VITE_AUTO_CONNECT_LOCAL = false;

export default defineConfig({
  plugins: [legacy({
    targets: ["Android >= 4.4"],
    additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    modernPolyfills: false,
  })],
  target: ["es5", "chrome81"],
  build: {
    modulePreload: false,
    minify: false,
    rollupOptions: {
      input: {
        main: "index.html",
        worker: "ts/websocket/main.ts",
        event_bus: "ts/event_bus/event_bus_client.ts"
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
