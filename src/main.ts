import { createApp } from 'vue'
import pinia from '@/stores'
import router from '@/router'
import App from './App.vue'
import '@/assets/styles/main.css'

// Initialize app
const app = createApp(App)

app.use(pinia)
app.use(router)

// Initialize auth listener after pinia is available
import { useAuthStore } from '@/stores/auth.store'
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
