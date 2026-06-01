import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('firebase')) return 'firebase'
          if (id.includes('mapbox-gl')) return 'mapbox'
          if (id.includes('@fullcalendar')) return 'calendar'
          if (id.includes('primevue') || id.includes('@primevue')) return 'primevue'
          if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) return 'charts'
          if (id.includes('@fortawesome')) return 'icons'

          return 'vendor'
        },
      },
    },
  },
})
