import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Controls whether admin routes are included in the build
      __ADMIN_ENABLED__: JSON.stringify(env.VITE_ADMIN_ENABLED === 'true'),
      // The secret path segment for admin access (default fallback for dev)
      __ADMIN_PATH__: JSON.stringify(env.VITE_ADMIN_PATH || 'portal-ctrl'),
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  }
})
