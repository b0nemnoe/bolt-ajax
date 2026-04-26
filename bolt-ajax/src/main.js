import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import vue3GoogleLogin from 'vue3-google-login'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

import { OhVueIcon, addIcons } from "oh-vue-icons"
import { BiBagCheckFill, BiHeart, BiHeartFill, BiStar, BiStarFill, BiTrash, BiPencil, BiFacebook } from "oh-vue-icons/icons"
addIcons(BiBagCheckFill, BiHeart, BiHeartFill, BiStar, BiStarFill, BiTrash, BiPencil, BiFacebook)

const app = createApp(App)
app.component("v-icon", OhVueIcon)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID'
})

const toastOptions = {
    position: "top-right",
    timeout: 2000,
    closeOnClick: true,
    maxToasts: 3,
    newestOnTop: true,
    filterBeforeCreate: (toast, toasts) => {
        if (toasts.filter(t => t.content === toast.content).length !== 0) {
            return false;
        }
        return toast;
    }
}
app.use(Toast, toastOptions)

app.mount('#app')