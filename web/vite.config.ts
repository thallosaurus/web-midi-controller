import { defineConfig } from "vite";
import path from 'path'
import fs from 'node:fs'

import tsconfigPaths from 'vite-tsconfig-paths';
import handlebars from 'vite-plugin-handlebars';

//import legacy from "@vitejs/plugin-legacy";

const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;
process.env.VITE_USE_WORKER_EVENT_BUS = String(true);
process.env.VITE_USE_DEV_BACKEND = String(true);
process.env.VITE_SELF_UPDATE_WIDGETS = String(false);
process.env.VITE_AUTO_CONNECT_LOCAL = String(false);

export default defineConfig({
  //plugins: [tsconfigPaths()],
  plugins: [handlebars({
    partialDirectory: path.resolve(__dirname, 'html')
  })],
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, '../backend/bindings'),
      '@core': path.resolve(__dirname, 'ts/ui'),
      '@common': path.resolve(__dirname, 'ts/common'),
      '@widgets': path.resolve(__dirname, 'ts/widgets'),
      '@eventbus': path.resolve(__dirname, 'ts/event_bus'),
      '@websocket': path.resolve(__dirname, 'ts/websocket'),
      '@bindings': path.resolve(__dirname, 'bindings'),
    }
  },
  worker: {
    format: "es",
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      input: {
        main: "index.html",
      }
    }
  }
});
