import { defineConfig } from "vite";
import path from 'path'
import fs from 'node:fs'

//import legacy from "@vitejs/plugin-legacy";

const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;
process.env.VITE_USE_WORKER_EVENT_BUS = true;
process.env.VITE_SELF_UPDATE_WIDGETS = false;
process.env.VITE_AUTO_CONNECT_LOCAL = true;

export default defineConfig({
  /*plugins: [legacy({
    targets: ["Android >= 4.4"],
    additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    modernPolyfills: false,
  })],*/
  worker: {
    format: "es",
    /*rollupOptions: {
      /*input: {
        worker: "ts/websocket/main.ts",
        event_bus: "ts/event_bus/main.ts"
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    }*/
  },
  resolve: {
    alias: {
      '@websocket': path.resolve(__dirname,'./ts/websocket/worker'),
      '@websocket-client': path.resolve(__dirname,'./ts/websocket/client'),
      '@eventbus': path.resolve(__dirname,'./ts/event_bus/worker'),
      '@eventbus-client': path.resolve(__dirname,'./ts/event_bus/client'),
    }
  },
  //target: ["chrome81"],
  build: {
    modulePreload: false,
    rollupOptions: {
      input: {
        main: "index.html",
      }
    }
  }
  /*build: {
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
  },*/
});
