import { defineStore } from "pinia"
import { ref, computed } from "vue"
import $axios from "@/utils/axios"
import { useToast } from "vue-toastification"
import router from '@/router'

export const useProductStore = defineStore("product", () => {
    const products = ref([])
    const currentProduct = ref(null)
    const reviews = ref([])
    const isLoading = ref(false)
    const toast = useToast()

    // Filter

    const searchQuery = ref('')
    const onlyInStock = ref(false)
    const sortOrder = ref('default')
    const selectedCategory = ref('all')

    const categories = computed(() => {
        if (!products.value) return []
        const cats = new Set(products.value.map(p => p.category).filter(c => c))
        return ['all', ...cats]
    })

    const filteredProducts = computed(() => {
        if (!products.value) return []
        let result = products.value.filter(p => {
            const term = searchQuery.value.toLowerCase()
            const matchesSearch = p.name.toLowerCase().includes(term) || (p.desc && p.desc.toLowerCase().includes(term))
            const matchesStock = onlyInStock.value ? p.store > 0 : true
            const matchesCategory = selectedCategory.value === 'all' || p.category === selectedCategory.value
            return matchesSearch && matchesStock && matchesCategory
        })
        if (sortOrder.value === 'asc') return [...result].sort((a, b) => a.price - b.price)
        if (sortOrder.value === 'desc') return [...result].sort((a, b) => b.price - a.price)
        return result
    })

    // Product load
    
    const loadAll = async () => {
        isLoading.value = true;
        try {
            const response = await $axios.get('/products')
            products.value = response.data || []
        } catch (error) {
            toast.error("Nem sikerült betölteni a termékeket!")
        } finally {
            isLoading.value = false;
        }
    }

    const fetchProductById = async (id) => {
        isLoading.value = true
        currentProduct.value = null
        reviews.value = []
        try {
            const response = await $axios.get(`/products/${id}`)
            currentProduct.value = response.data
            await fetchReviews(id)
        } catch (error) {
            toast.error("Nem sikerült betölteni a terméket!")
            router.push('/')
        } finally {
            isLoading.value = false
        }
    }

    // Reviews

    const fetchReviews = async (productId) => {
        try {
            const response = await $axios.get(`/reviews/${productId}`)
            reviews.value = response.data
        } catch (error) {
            console.error("Hiba az értékelések betöltésekor:", error)
        }
    }

    const addReview = async (reviewData) => {
        try {
            const response = await $axios.post('/reviews', reviewData)
            reviews.value.unshift(response.data)
            toast.success("Köszönjük az értékelést! ⭐")
        } catch (error) {
            toast.error(error.response?.data?.message || "Hiba történt!")
        }
    }

    const updateReview = async (id, reviewData) => {
        try {
            const response = await $axios.put(`/reviews/${id}`, reviewData)
            const index = reviews.value.findIndex(r => r._id === id)
            if (index !== -1) reviews.value[index] = response.data
            toast.success("Értékelés frissítve! ✏️")
        } catch (error) {
            toast.error("Hiba a módosításkor!")
        }
    }

    const deleteReview = async (reviewId) => {
        try {
            await $axios.delete(`/reviews/${reviewId}`)
            reviews.value = reviews.value.filter(r => r._id !== reviewId)
            toast.info("Értékelés törölve")
        } catch (error) {
            toast.error("Nem sikerült törölni")
        }
    }

    // Admin Product management

    const saveProduct = (p) => {
        $axios.post('/products', p).then((resp) => {
            products.value.push(resp.data)
            toast.success("Sikeres mentés")
            router.push('/')
        }).catch((err) => toast.error("Hiba: " + err.message));
    };

    const updateProduct = (product) => {
        $axios.put(`/products/${product.id}`, product).then(() => {
            const index = products.value.findIndex(p => p.id === product.id)
            if (index !== -1) products.value[index] = { ...product }
            toast.success("Sikeres módosítás")
        }).catch(() => toast.error("Hiba a módosításkor"))
    }

    const deleteProductFromDb = (id) => {
        $axios.delete(`/products/${id}`).then(() => {
            toast.success("Sikeres törlés")
            products.value = products.value.filter((p) => p.id !== id)
        }).catch(() => toast.error("Hiba a törléskor"))
    }

    return { 
        products, currentProduct, reviews, isLoading, 
        searchQuery, onlyInStock, sortOrder, selectedCategory, 
        categories, filteredProducts, 
        loadAll, fetchProductById, 
        fetchReviews, addReview, updateReview, deleteReview, 
        saveProduct, updateProduct, deleteProductFromDb 
    }
})