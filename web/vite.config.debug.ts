import { defineConfig } from "vite";
import path from 'path'
import fs from 'node:fs'

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
  assetsInclude: ["**/.svg"],
  plugins: [handlebars({
    context: {
      devMode: true
    },
    partialDirectory: path.resolve(__dirname, 'html')
  })],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'ts/core'),
      '@common': path.resolve(__dirname, 'ts/common'),
      '@widgets': path.resolve(__dirname, 'ts/widgets'),
      '@eventbus': path.resolve(__dirname, 'ts/eventbus'),
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
