import axios from "axios"
import { useToast } from "vue-toastification"
import router from '@/router'
import { useUserStore } from '@/stores/user'

export const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : "";

export const API_URL = import.meta.env.VITE_API_URL || "/api"

const $axios = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

const toast = useToast()

$axios.interceptors.request.use((config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

$axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (originalRequest.url === '/auth/refresh') {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                const userStore = useUserStore();
                userStore.token = res.data.accessToken;
                if (res.data.user) userStore.user = res.data.user;

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return $axios(originalRequest);
            } catch (err) {
                const userStore = useUserStore();
                userStore.token = '';
                userStore.user = null;
                localStorage.removeItem('user');
                toast.error("A munkamenet lejárt. Kérjük, jelentkezz be újra!")
                router.push('/login');
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export default $axios