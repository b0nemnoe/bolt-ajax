import { defineStore } from "pinia"
import { ref } from "vue"
import $axios from "@/utils/axios"
import { useToast } from "vue-toastification"
import { useUserStore } from "./user"

export const useOrderStore = defineStore("order", () => {
    const myOrders = ref([])
    const adminOrders = ref([])
    const toast = useToast()

    const fetchOrders = async () => {
        const userStore = useUserStore()
        if (!userStore.token) return
        try {
            const response = await $axios.get('/orders')
            myOrders.value = response.data
        } catch (error) {
            console.error(error)
        }
    }

    const fetchAdminOrders = async () => {
        const userStore = useUserStore()
        if (!userStore.token || !userStore.user?.isAdmin) return
        try {
            const response = await $axios.get('/orders/all')
            adminOrders.value = response.data
        } catch (error) {
            toast.error("Hiba az admin rendelések betöltésekor")
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await $axios.patch(`/orders/${orderId}`, { status: newStatus })
            toast.success("Státusz frissítve!")
            const order = adminOrders.value.find(o => o._id === orderId)
            if (order) order.status = newStatus
        } catch (error) {
            toast.error("Hiba a módosításkor")
        }
    }

    return { myOrders, adminOrders, fetchOrders, fetchAdminOrders, updateOrderStatus }
})