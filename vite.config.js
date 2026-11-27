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
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 50000000,
        // Hapus tflite dari precache agar SW tidak gagal install di HP
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.tflite'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'strise-tflite-models',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
            handler: 'CacheFirst',
            options: {
              cacheName: 'strise-tfjs-wasm',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
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