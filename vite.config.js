import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({ filename: 'dist/stats.html', open: false })],
  build: {
    // Increase warning limit to reduce noisy warnings while we optimize
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('firebase')) return 'vendor-firebase'
            return 'vendor'
          }
        }
      }
    }
  }
})
