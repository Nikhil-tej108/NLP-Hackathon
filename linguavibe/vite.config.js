import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows network access
    allowedHosts: ['fd272036bc62.ngrok-free.app'], // add your ngrok host here
    proxy: {
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true
      },
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
})
