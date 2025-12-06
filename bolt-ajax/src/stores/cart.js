import { defineStore } from "pinia"
import { ref, watch } from "vue"
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
        const product = productStore.products.find(p => p.id == id || p._id == id)
        
        const currentP = productStore.currentProduct
        const targetProduct = product || (currentP && (currentP.id == id || currentP._id == id) ? currentP : null)

        if (!targetProduct) { toast.error("Hiba: Termék nem található"); return }
        if (targetProduct.store === 0) { toast.error("Nincs készleten"); return }

        if (!cart.value) cart.value = {}
        cart.value[id] = cart.value[id] ? cart.value[id] + 1 : 1;
        
        targetProduct.store-- 
        
        toast.success("Kosárhoz adva")
    }

    const modifyQuantity = (id, op) => {
        const productStore = useProductStore()
        const product = productStore.products.find(p => p.id == id || p._id == id)
        if (!product) return

        if (op === "+") {
            if (product.store > 0) {
                cart.value[id]++
                product.store--
                toast.success("Mennyiség növelve")
            } else {
                toast.error("Nincs több készleten!")
            }
        } else {
            if (cart.value[id] === 1) {
                deleteProductFromCart(id)
            } else {
                cart.value[id]--
                product.store++
                toast.warning("Mennyiség csökkentve")
            }
        }
    }

    const deleteProductFromCart = (id) => {
        const productStore = useProductStore()
        const product = productStore.products.find(p => p.id == id || p._id == id)
        if (product && cart.value[id]) { 
            product.store += cart.value[id]
        }
        delete cart.value[id]
        toast.error("Termék törölve a kosárból!")
    }

    const emptyCart = () => {
        const productStore = useProductStore()
        for (const key in cart.value) {
            const p = productStore.products.find(prod => prod.id == key || prod._id == key)
            if(p) p.store += cart.value[key]
        }
        cart.value = {}
        toast.error("Kosár kiürítve")
    }

    const originalTotal = () => {
        const productStore = useProductStore()
        let total = 0
        for (const i in cart.value) {
            const p = productStore.products.find(prod => prod.id == i || prod._id == i)
            if (p) total += cart.value[i] * p.price
        }
        return total
    }

    const discountAmount = () => {
        if (!coupon.value) return 0
        return Math.round(originalTotal() * (coupon.value.discountPercent / 100))
    }

    const finalTotal = () => {
        return originalTotal() - discountAmount()
    }

    const checkout = async () => {
        const userStore = useUserStore()
        const productStore = useProductStore()

        if (!userStore.token) {
            toast.error("A rendeléshez be kell jelentkezned!")
            router.push('/login')
            return
        }

        const orderItems = []
        for (const id in cart.value) {
            const product = productStore.products.find(p => p.id == id || p._id == id)
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
                totalPrice: finalTotal()
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

    watch(cart, (newCart) => {
        localStorage.setItem("cart", JSON.stringify(newCart))
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
        applyCoupon, removeCoupon }
})