import { defineConfig } from "vite";

// Polyfills via babel
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [legacy({
    targets: ["Android >= 4.4"],
    additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    modernPolyfills: true,
  })],
  target: ["es5", "chrome81"],
  build: {
    minify: true,
    /*rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },*/
  },
});
