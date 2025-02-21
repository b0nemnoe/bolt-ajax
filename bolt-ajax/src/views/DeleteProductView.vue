<template>
    <h1>Termék törlése</h1>
    <form class="w-50 mx-auto" @submit.prevent="deleteProduct">
        <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" id="deleteByName" v-model="deleteByName">
            <label class="form-check-label" for="deleteByName">Törlés név alapján</label>
        </div>
        <input v-if="deleteByName" class="form-control mb-2" type="text" v-model="productName" placeholder="Termék neve">
        <input v-else class="form-control mb-2" type="number" v-model="productId" placeholder="A törölni kívánt termék ID-je..." min="1">
        <button class="btn btn-danger" type="submit">Törlés</button>
    </form>
</template>

<script setup>
    import { ref } from 'vue'
    import { useBotStore } from '@/stores/bot'
    const bolt = useBotStore()
    const productId = ref('')
    const productName = ref('')
    const deleteByName = ref(false)

    const deleteProduct = () => {
        if (deleteByName.value) {
            const product = bolt.products.find(p => p.name === productName.value)
            if (product) {
                bolt.deleteProductFromDb(product.id)
            } else {
                bolt.toast.error("A termék nem található!")
            }
        } else {
            bolt.deleteProductFromDb(productId.value)
        }
    }
</script>