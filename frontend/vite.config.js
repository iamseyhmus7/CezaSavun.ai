import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      // '/api' ile başlayan tüm istekleri backend'e (8000 portuna) yönlendir
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket (gerçek zamanlı iletişim) desteğini aç
      }
    }
  }
})