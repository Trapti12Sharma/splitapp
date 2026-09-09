import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor code out of the app bundle. Recharts alone is a large chunk
    // that only the Analytics page needs, so bundling everything together made
    // every user download it before the dashboard could render.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'util-vendor': ['axios', 'date-fns', 'react-hot-toast'],
        },
      },
    },
    // The vendor chunks above are legitimately large; warn only past a size that
    // would actually indicate a problem.
    chunkSizeWarningLimit: 700,
    // Source maps make production stack traces readable without shipping the
    // original source to the browser.
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
