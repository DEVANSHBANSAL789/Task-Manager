import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This keeps it open for Railway
    allowedHosts: [
      'task-manager-production-5622.up.railway.app'
    ]
  }
})
