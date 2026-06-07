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
            primary: '#EED056',      // Golden Yellow
            secondary: '#232323',    // Dark
            accent: '#F6E27F',       // Light Gold
            background: '#FFFDF5',   // Cream
            surface: '#FFFFFF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
        fontWeight: 600,
      },
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
    },
  })
  
  app.vueApp.use(vuetify)
})
