import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: 'dist_assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),      // drawer bundle entry
      },
      output: {
        entryFileNames: '[name].bundle.js',                       // will output main.bundle.js and drawer.bundle.js
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
