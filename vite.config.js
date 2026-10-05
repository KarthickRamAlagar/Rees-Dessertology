import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { apiDevMiddleware } from './vite-plugins/apiDevMiddleware.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to the browser (import.meta.env).
  // The api/** serverless functions need the server-side ones too
  // (FIREBASE_SERVICE_ACCOUNT_JSON, ADMIN_EMAILS, etc.) on process.env, since
  // in dev they now run inside this same Vite process via apiDevMiddleware
  // instead of `vercel dev`'s own Node runtime, which set these up for us.
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
