import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const hmrConfig = {};
  if (env.VITE_HMR_HOST) {
    hmrConfig.host = env.VITE_HMR_HOST;
    hmrConfig.clientPort = 443;
  } else if (env.VITE_REVERB_HOST && env.VITE_REVERB_HOST !== 'localhost' && env.VITE_REVERB_HOST !== '127.0.0.1') {
    hmrConfig.host = env.VITE_REVERB_HOST;
    hmrConfig.clientPort = 443;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'music/*'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
        },
        manifest: {
          name: 'Millionaire Quiz',
          short_name: 'Millionaire',
          description: 'Test your knowledge and become a virtual millionaire!',
          theme_color: '#0a0a2e',
          background_color: '#0a0a2e',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: false,
          type: 'module'
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-router')) {
                return 'vendor';
              }
              if (id.includes('lucide') || id.includes('motion')) {
                return 'ui';
              }
            }
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true,

      allowedHosts: [
        'parlerbien.xyz',
        'www.parlerbien.xyz'
      ],

      hmr: Object.keys(hmrConfig).length > 0 ? hmrConfig : true,

      proxy: {
        '/api': {
          target: 'http://backend:8000',
          changeOrigin: true,
        },
        '/reverb': {
          target: 'http://reverb:8081',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
