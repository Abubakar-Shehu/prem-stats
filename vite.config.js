import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { premApiPlugin } from './server/devApiPlugin.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_PROXY_TARGET || 'https://backend-nkn2pg.fly.dev'

  // Expose football-data key to the Vite middleware process when present.
  if (env.FOOTBALL_DATA_API_KEY || env.API_KEY) {
    process.env.FOOTBALL_DATA_API_KEY = env.FOOTBALL_DATA_API_KEY || env.API_KEY
  }

  return {
    plugins: [react(), premApiPlugin()],
    server: {
      proxy: {
        // Season-aware /api/prem* is handled by premApiPlugin.
        // Keep auth on the existing Fly backend.
        '/auth': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
