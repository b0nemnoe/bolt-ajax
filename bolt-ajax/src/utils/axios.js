import axios from "axios"
import { useToast } from "vue-toastification"
import router from '@/router'

export const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : "http://localhost:3000";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const $axios = axios.create({
    baseURL: API_URL
})

const toast = useToast()

$axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

$axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                toast.error("A munkamenet lejárt. Kérjük, jelentkezz be újra!")
                router.push('/login')
            }
        }
        return Promise.reject(error)
    }
)

export default $axios