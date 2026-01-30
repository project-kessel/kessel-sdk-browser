import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point directly to the index.ts entry point
      '@project-kessel/react-kessel-access-check': path.resolve(__dirname, '../../packages/react-kessel-access-check/src/index.ts'),
    },
  },
  // Exclude the local package from pre-bundling so changes are picked up immediately
  optimizeDeps: {
    exclude: ['@project-kessel/react-kessel-access-check'],
  },
})
