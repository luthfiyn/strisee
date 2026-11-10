import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Strise Smart Farming',
        short_name: 'Strise',
        theme_color: '#ffffff',
        icons: [
          { src: '/icons.svg', sizes: '192x192', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 50000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,tflite,wasm}'], 
      }
    })
  ],
  server: {
    host: true, 
    allowedHosts: true 
  },
  resolve: {
    alias: {
      '@tensorflow/tfjs-tflite': '@tensorflow/tfjs-tflite/dist/tf-tflite.min.js'
    }
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs-tflite']
  }
});