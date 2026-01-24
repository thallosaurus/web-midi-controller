import { defineConfig } from 'vite'

// Polyfills via babel
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [legacy({
      targets: ['Android >= 4.4'], // KitKat
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // für async/await
      modernPolyfills: true
    })
  ],
  target: ['es5', "chrome81"], // Transpile alles runter
  build: {
    minify: false // optional, für Debug einfacher
  }
})