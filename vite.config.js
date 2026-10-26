import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getUpdateTimestamp } from './build/updateTimestamp.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'DEV_')
  const releaseEnv = loadEnv(mode, import.meta.dirname, 'VITE_APP_')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __APP_UPDATED_AT__: JSON.stringify(getUpdateTimestamp({ override: releaseEnv.VITE_APP_UPDATED_AT })),
    },
    server: {
      proxy: env.DEV_API_PROXY_TARGET ? {
        '/api': {
          target: env.DEV_API_PROXY_TARGET,
          changeOrigin: true,
        },
      } : undefined,
    },
  }
})
