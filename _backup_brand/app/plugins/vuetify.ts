import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  console.log('🔌 Initializing Vuetify Plugin...')
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'aadabTheme',
      themes: {
        aadabTheme: {
          dark: false,
          colors: {
            primary: '#0B5D3B',      // Aadab emerald
            secondary: '#14201A',    // Deep green-black
            accent: '#C99A2E',       // Aadab gold
            background: '#ffffff',   // Pure White
            surface: '#ffffff',
            error: '#d32f2f',
            info: '#0288d1',
            success: '#2e7d32',
            warning: '#ed6c02',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'pill',
        fontWeight: 750,
        elevation: 0,
        variant: 'flat',
      },
      VCard: {
        rounded: 'xl',
        elevation: 0,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VAutocomplete: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
    },
  })
  
  app.vueApp.use(vuetify)
})
