import { createApp } from 'vue'
import pinia from '@/stores'
import router from '@/router'
import App from './App.vue'
// Fonts served from this site (T-0636, Nov 20 2026). They were a render-blocking
// Google Fonts stylesheet, which also sent every visitor's IP address to Google.
// Same families, weights and styles as before; latin only (the course is English).
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/lora/latin-400.css'
import '@fontsource/lora/latin-600.css'
import '@fontsource/lora/latin-400-italic.css'
import '@/assets/styles/main.css'

// Initialize app
const app = createApp(App)

app.use(pinia)
app.use(router)


app.mount('#app')
