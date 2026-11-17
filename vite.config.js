import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page build: add new pages to build.rollupOptions.input
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
    },
  },
})
