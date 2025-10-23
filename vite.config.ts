import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fix 404 on refresh in development
    historyApiFallback: true,
  },
  preview: {
    port: 5173,
  },
})
