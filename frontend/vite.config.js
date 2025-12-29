import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: true, // Allow network access for mobile testing
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true
            }
        }
    }
})
