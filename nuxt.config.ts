import { fileURLToPath } from 'url'

// Fix for 'process' is not defined
declare const process: any;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@stores': fileURLToPath(new URL('./app/stores', import.meta.url)),
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@pinia/nuxt',
  ],

  plugins: [
    './app/plugins/vuetify.ts',
  ],
  
  // CSS
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    fileURLToPath(new URL('./app/assets/css/main.css', import.meta.url)),
    fileURLToPath(new URL('./app/assets/css/market.css', import.meta.url)),
  ],
  
  // Build configuration
  build: {
    transpile: ['vuetify'],
  },
  
  // Vite configuration for Vuetify
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  
  // App configuration
  app: {
    head: {
      title: 'Aadab - Premium Products',
      meta: [
        { name: 'description', content: 'Shop premium products at Aadab' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  
  // Runtime config (API URL etc.)
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'https://api.staging.aadab.online/api',
      mediaBase: process.env.MEDIA_BASE_URL || 'https://api.staging.aadab.online/storage/Aadab/',
      // apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api',
      // mediaBase: process.env.MEDIA_BASE_URL || 'http://localhost:8000/storage/Aadab/',
    },
  },
})