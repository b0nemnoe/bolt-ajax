import { defineStore } from "pinia"
import { ref, watch, computed } from "vue"
import $axios from "@/utils/axios"
import { useToast } from "vue-toastification"
import { useProductStore } from "./product"
import { useUserStore } from "./user"
import router from '@/router'

export const useCartStore = defineStore("cart", () => {
    const cart = ref({})
    const toast = useToast()
    const coupon = ref(null)
    
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
        try { cart.value = JSON.parse(savedCart) } catch (e) { cart.value = {} }
    }
 
    const addToCart = (id) => {
        const productStore = useProductStore()
        const product = productStore.products.find(p => p._id == id)
        
        const currentP = productStore.currentProduct
        const targetProduct = product || (currentP && currentP._id == id ? currentP : null)

        if (!targetProduct) { toast.error("Hiba: Termék nem található"); return }
        
        const currentQty = cart.value[id] || 0
        if (currentQty >= targetProduct.store) {
            toast.error("Nincs több készleten ebből a termékből! 📦")
            return
        }

        if (!cart.value) cart.value = {}
        cart.value[id] = currentQty + 1;
        
        toast.success("Kosárhoz adva! 🛒")
    }

    const modifyQuantity = (id, op) => {
        const productStore = useProductStore()
        const product = productStore.products.find(p => p._id == id)
        
        const currentP = productStore.currentProduct
        const targetProduct = product || (currentP && currentP._id == id ? currentP : null)
        
        if (!targetProduct) return

        if (op === "+") {
            const currentQty = cart.value[id] || 0
            if (currentQty < targetProduct.store) {
                cart.value[id]++
                toast.success("Mennyiség növelve")
            } else {
                toast.error("Nincs több készleten!")
            }
        } else {
            if (cart.value[id] === 1) {
                deleteProductFromCart(id)
            } else {
                cart.value[id]--
                toast.warning("Mennyiség csökkentve")
            }
        }
    }

    const deleteProductFromCart = (id) => {
        delete cart.value[id]
        toast.error("Termék törölve a kosárból!")
    }

    const emptyCart = async () => {
        cart.value = {}
        toast.error("Kosár kiürítve")
        const userStore = useUserStore()
        if (userStore.token) {
            clearTimeout(syncTimeout)
            try {
                await $axios.put('/auth/cart', { cart: {} })
            } catch (e) {
                console.error("Hiba az üres kosár mentésekor")
            }
        }
    }

    const originalTotal = computed(() => {
        const productStore = useProductStore()
        let total = 0
        for (const i in cart.value) {
            const p = productStore.products.find(prod => prod._id == i)
            if (p) total += cart.value[i] * p.price
        }
        return total
    })

    const discountAmount = computed(() => {
        if (!coupon.value) return 0
        return Math.round(originalTotal.value * (coupon.value.discountPercent / 100))
    })

    const finalTotal = computed(() => {
        return originalTotal.value - discountAmount.value
    })

    const checkout = async (shippingAddress) => {
        if (!shippingAddress || shippingAddress.trim() === '') {
            toast.error("Kérjük, add meg a szállítási címet!")
            return
        }
        
        const userStore = useUserStore()
        if (!userStore.token) {
            toast.warning("Jelentkezz be a rendeléshez!")
            return
        }

        const productStore = useProductStore()
        const orderItems = []
        for (const id in cart.value) {
            const product = productStore.products.find(p => p._id == id)
            if (product) {
                orderItems.push({
                    productId: id,
                    name: product.name,
                    quantity: cart.value[id],
                    price: product.price
                })
            }
        }

        if (orderItems.length === 0) return

        try {
            await $axios.post('/orders', {
                items: orderItems,
                couponCode: coupon.value ? coupon.value.code : null,
                shippingAddress: shippingAddress.trim()
            })
            toast.success("Rendelés sikeresen leadva! 🚀")
            cart.value = {}
            coupon.value = {}
            localStorage.removeItem('cart')
            await productStore.loadAll()
            router.push('/')
        } catch (error) {
            toast.error("Hiba a rendelés során")
        }
    }

    let syncTimeout = null
    const syncCart = () => {
        const userStore = useUserStore()
        if (userStore.token) {
            clearTimeout(syncTimeout)
            syncTimeout = setTimeout(async () => {
                try {
                    await $axios.put('/auth/cart', { cart: cart.value })
                } catch (err) {
                    console.error("Hiba a kosár szinkronizálásakor")
                }
            }, 500)
        }
    }

    const fetchCart = async () => {
        const userStore = useUserStore()
        if (userStore.token) {
            try {
                const response = await $axios.get('/auth/cart')
                const dbCart = response.data || {}
                
                for (const key in dbCart) {
                    if (cart.value[key]) {
                        cart.value[key] = Math.max(cart.value[key], dbCart[key])
                    } else {
                        cart.value[key] = dbCart[key]
                    }
                }
                syncCart() 
            } catch (err) {
                console.error("Hiba a kosár lekérésekor")
            }
        }
    }

    watch(cart, (newCart) => {
        localStorage.setItem("cart", JSON.stringify(newCart))
        syncCart()
    }, { deep: true })

    const applyCoupon = async (code) => {
        try {
            const response = await $axios.post('/coupons/validate', { code })
            coupon.value = response.data
            toast.success(`Sikeres kupon beváltás! -${response.data.discountPercent}%`)
        } catch (error) {
            toast.error(error.response?.data?.message || "Érvénytelen kupon!")
            coupon.value = null
        }
    }

    const removeCoupon = () => {
        coupon.value = null
        toast.info("Kupon eltávolítva")
    }

    return { cart, coupon, 
        addToCart, modifyQuantity, deleteProductFromCart, emptyCart, 
        originalTotal, discountAmount, finalTotal, checkout, 
        applyCoupon, removeCoupon, fetchCart, syncCart }
})