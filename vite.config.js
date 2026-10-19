import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { premApiPlugin } from './server/devApiPlugin.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_PROXY_TARGET || 'https://backend-nkn2pg.fly.dev'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy API/auth through the Vite dev server so credentialed
        // browser requests stay same-origin and avoid CORS failures.
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
        '/auth': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
