import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueApexCharts from "vue3-apexcharts"
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

// PrimeVue Setup
import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import 'primeicons/primeicons.css'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
authStore.initializeSession()

app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark',
        }
    }
})

app.use(ToastService)
app.use(ConfirmationService)
app.use(VueApexCharts)

app.mount('#app')
