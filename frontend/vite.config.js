import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills(),
    ],
    define: {
        global: 'globalThis',
        'process.env': {}
    },
    server: {
        port: 8000,
        host: true, // Allow network access for mobile testing
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
