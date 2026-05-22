import { defineStore } from "pinia"
import { ref } from "vue"
import $axios from "@/utils/axios"
import { useToast } from "vue-toastification"
import router from '@/router'
import { useCartStore } from "./cart"

export const useUserStore = defineStore("user", () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const token = ref('')
    const wishlist = ref([])
    const toast = useToast()

    const login = async (email, password) => {
        try {
            const response = await $axios.post('/auth/login', { email, password })
            token.value = response.data.token || response.data.accessToken
            user.value = response.data.user
            
            localStorage.setItem('user', JSON.stringify(user.value))
            
            toast.success("Sikeres bejelentkezés!")
            await fetchWishlist() // Betöltjük a kedvenceket
            await useCartStore().fetchCart() // Betöltjük a kosarat
            
            if (user.value.isAdmin) router.push('/admin-orders')
            else router.push('/')
        } catch (error) {
            toast.error(error.response?.data?.message || "Hibás bejelentkezés!")
        }
    }

    const loginWithGoogle = async (credential) => {
        try {
            const response = await $axios.post('/auth/google', { credential })
            token.value = response.data.token || response.data.accessToken
            user.value = response.data.user
            
            localStorage.setItem('user', JSON.stringify(user.value))
            
            toast.success("Sikeres bejelentkezés Google-lel!")
            await fetchWishlist()
            await useCartStore().fetchCart()
            
            if (user.value.isAdmin) router.push('/admin-orders')
            else router.push('/')
        } catch (error) {
            toast.error(error.response?.data?.message || "Hibás Google bejelentkezés!")
        }
    }

    const loginWithFacebook = async (accessToken) => {
        try {
            const response = await $axios.post('/auth/facebook', { accessToken })
            token.value = response.data.token || response.data.accessToken
            user.value = response.data.user
            
            localStorage.setItem('user', JSON.stringify(user.value))
            
            toast.success("Sikeres bejelentkezés Facebookkal!")
            await fetchWishlist()
            await useCartStore().fetchCart()
            
            if (user.value.isAdmin) router.push('/admin-orders')
            else router.push('/')
        } catch (error) {
            toast.error(error.response?.data?.message || "Hibás Facebook bejelentkezés!")
        }
    }

    const register = async (email, password) => {
        try {
            await $axios.post('/auth/register', { email, password })
            toast.success("Sikeres regisztráció!")
            router.push('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || "Hiba történt!")
        }
    }

    const logout = async () => {
        try {
            await $axios.post('/auth/logout');
        } catch (e) {
            console.error("Hiba a kijelentkezéskor");
        }
        token.value = ''
        user.value = null
        wishlist.value = []
        localStorage.removeItem('user')
        
        const cartStore = useCartStore()
        cartStore.cart = {}
        localStorage.removeItem('cart')
        
        router.push('/login')
    }

    const initAuth = async () => {
        try {
            const response = await $axios.post('/auth/refresh')
            token.value = response.data.accessToken
            user.value = response.data.user
            localStorage.setItem('user', JSON.stringify(user.value))
            
            await fetchWishlist()
            await useCartStore().fetchCart()
        } catch (error) {
            token.value = ''
        }
    }

    const updateProfile = async (profileData) => {
        try {
            const response = await $axios.put('/auth/profile', profileData)
            user.value = { ...user.value, ...response.data }
            localStorage.setItem('user', JSON.stringify(user.value))
            toast.success("Profil adatok mentve! 💾")
        } catch (error) {
            toast.error("Hiba a mentéskor!")
        }
    }

    const changePassword = async (passwords) => {
        try {
            await $axios.put('/auth/password', passwords)
            toast.success("Jelszó megváltoztatva! 🔒")
            return true
        } catch (error) {
            toast.error(error.response?.data?.message || "Hiba történt!")
            return false
        }
    }
    // Wishlist
    
    const fetchWishlist = async () => {
        if (!token.value) return
        try {
            const response = await $axios.get('/wishlist')
            wishlist.value = response.data
        } catch (error) {
            console.error("Hiba a kívánságlista betöltésekor:", error)
        }
    }

    const toggleWishlist = async (productId, productsRef) => {
        if (!token.value) {
            toast.warning("Jelentkezz be!")
            return
        }
        try {
            const response = await $axios.post('/wishlist/toggle', { productId })
            if (response.data.added) {
                toast.success("Hozzáadva a kedvencekhez ❤️")
                await fetchWishlist() 
            } else {
                wishlist.value = wishlist.value.filter(p => p._id !== productId && p.id !== productId)
                toast.info("Eltávolítva a kedvencekből 💔")
            }
        } catch (error) {
            toast.error("Hiba történt!")
        }
    }

    const forgotPassword = async (email) => {
        try {
            await $axios.post('/auth/forgot-password', { email })
            toast.success("Email elküldve! 📧")
        } catch (error) {
            toast.error(error.response?.data?.message || "Hiba történt!")
        }
    }

    const resetPassword = async (token, newPassword) => {
        try {
            await $axios.post(`/auth/reset-password/${token}`, { password: newPassword })
            toast.success("Jelszó sikeresen módosítva! 🔒")
            router.push('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || "Hiba vagy lejárt token!")
        }
    }

    return { user, token, wishlist, login, register, logout, initAuth, updateProfile, changePassword, fetchWishlist, toggleWishlist, forgotPassword, resetPassword, loginWithGoogle, loginWithFacebook }
})