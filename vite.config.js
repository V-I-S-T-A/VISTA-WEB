import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getUpdateTimestamp } from './build/updateTimestamp.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'DEV_')
  const releaseEnv = loadEnv(mode, import.meta.dirname, 'VITE_APP_')

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
    },
    server: {
      // A second instance would rewrite the first server's optimized React files.
      strictPort: true,
      proxy: env.DEV_API_PROXY_TARGET ? {
        '/api': {
          target: env.DEV_API_PROXY_TARGET,
          changeOrigin: true,
        },
      } : undefined,
    },
  }
})
