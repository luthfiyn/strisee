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
        // Memastikan file tflite dan wasm ikut di-cache agar PWA bisa berjalan offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,tflite,wasm}'], 
      }
    })
  ],
  server: {
    host: true, // Mengekspos server ke IP jaringan lokal (WiFi)
    allowedHosts: true // Mencegah error "Blocked request" dari Vite
  },
  resolve: {
    alias: {
      // Solusi jitu: Arahkan semua import @tensorflow/tfjs-tflite 
      // ke versi minified yang sudah dibundle secara utuh oleh TFJS.
      '@tensorflow/tfjs-tflite': '@tensorflow/tfjs-tflite/dist/tf-tflite.min.js'
    }
  },
  optimizeDeps: {
    // Mengecualikan tfjs-tflite dari proses pre-bundling Vite yang ketat
    exclude: ['@tensorflow/tfjs-tflite']
  }
});