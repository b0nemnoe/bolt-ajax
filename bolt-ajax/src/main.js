import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

import { OhVueIcon, addIcons } from "oh-vue-icons"
import { BiBagCheckFill } from "oh-vue-icons/icons"

addIcons(BiBagCheckFill)

const app = createApp(App)
app.component("v-icon", OhVueIcon)
app.use(createPinia())
app.use(router)

const toastOptions = {
    position: "top-right",
    timeout: 2000,
    closeOnClick: true
}
app.use(Toast, toastOptions)

app.mount('#app')