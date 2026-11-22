import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getUpdateTimestamp } from './build/updateTimestamp.mjs'
import { productionApiUrl } from './build/productionApi.mjs'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, import.meta.dirname, 'DEV_')
  const releaseEnv = loadEnv(mode, import.meta.dirname, 'VITE_APP_')
  // Every distributable build needs a public API, including custom build modes.
  const deployedApi = command === 'build'
    ? productionApiUrl(loadEnv(mode, import.meta.dirname, 'VITE_API_').VITE_API_URL)
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    resolve: { dedupe: ['react', 'react-dom'] },
    optimizeDeps: {
      // Lazy routes must use the same optimized React graph as the app shell.
      include: [
        'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime',
        'react/jsx-dev-runtime', 'react-router-dom', '@tanstack/react-query',
        'axios', 'lucide-react', 'recharts', 'xlsx',
      ],
    },
    define: {
      __APP_UPDATED_AT__: JSON.stringify(getUpdateTimestamp({ override: releaseEnv.VITE_APP_UPDATED_AT })),
      ...(deployedApi ? { 'import.meta.env.VITE_API_URL': JSON.stringify(deployedApi) } : {}),
    },
    server: {
      // A second instance would rewrite the first server's optimized React files.
      strictPort: true,
      proxy: env.DEV_API_PROXY_TARGET ? {
        '/api': {
          target: env.DEV_API_PROXY_TARGET,
          changeOrigin: true,
        },
        '/ws': {
          target: env.DEV_API_PROXY_TARGET,
          ws: true,
          changeOrigin: true,
        },
      } : undefined,
    },
  }
})
