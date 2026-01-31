import { defineConfig } from "vite";
import path from 'path'
import fs from 'node:fs'

import tsconfigPaths from 'vite-tsconfig-paths';

//import legacy from "@vitejs/plugin-legacy";

const ver = JSON.parse(fs.readFileSync("package.json", "utf-8"));
process.env.VITE_VERSION = ver.version;
process.env.VITE_USE_WORKER_EVENT_BUS = String(true);
process.env.VITE_SELF_UPDATE_WIDGETS = String(false);
process.env.VITE_AUTO_CONNECT_LOCAL = String(true);

export default defineConfig({
  plugins: [tsconfigPaths()],
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
