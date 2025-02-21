import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import "vue-toastification/dist/index.css";

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiBagCheckFill } from "oh-vue-icons/icons";

addIcons(BiBagCheckFill);
console.log("Registered Icons:", BiBagCheckFill);

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from "vue-toastification";

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.component("v-icon", OhVueIcon);

const options = {
    position: "top-right",
    timeout: 2000,
    closeOnClick: true
};

app.use(createPinia())
app.use(router)
app.use(Toast, options)

app.mount('#app')
