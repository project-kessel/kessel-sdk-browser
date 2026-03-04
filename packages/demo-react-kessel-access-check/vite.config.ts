import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@project-kessel/react-kessel-access-check': path.resolve(
        __dirname,
        '../react-kessel-access-check/src/index.ts'
      ),
    },
  },
})
