<template>
    <div class="container mt-4">
        <h1 class="text-center mb-4">Új termék rögzítése</h1>
        <form class="w-50 mx-auto card p-4 shadow" @submit.prevent="onSubmit">
            
            <div class="mb-3">
                <label class="form-label">Termék neve</label>
                <input class="form-control" type="text" v-model="name" required placeholder="Pl. Tej">
            </div>

            <div class="mb-3">
                <label class="form-label">Ár (Ft)</label>
                <input class="form-control" type="number" v-model="price" required placeholder="Pl. 350">
            </div>

            <div class="mb-3">
                <label class="form-label">Egység</label>
                <input class="form-control" type="text" v-model="unit" required placeholder="Pl. liter">
            </div>

            <div class="mb-3">
                <label class="form-label">Leírás</label>
                <textarea class="form-control" v-model="desc" rows="2"></textarea>
            </div>

            <div class="mb-3">
                <label class="form-label">Raktárkészlet</label>
                <input class="form-control" type="number" v-model="store" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Termék képe</label>
                <input class="form-control" type="file" @change="onFileChange" accept="image/*">
            </div>

            <button class="btn btn-success w-100" type="submit">Mentés</button>
        </form>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useBotStore } from '@/stores/bot';
    
    const bolt = useBotStore()
    
    // Külön ref-eket használunk, hogy könnyebb legyen a FormData építés
    const name = ref('')
    const price = ref('')
    const unit = ref('')
    const desc = ref('')
    const store = ref('')
    const selectedFile = ref(null)

    // Amikor a felhasználó kiválaszt egy fájlt
    const onFileChange = (e) => {
        selectedFile.value = e.target.files[0]
    }

    const onSubmit = () => {
        // FormData építése: ez kell a fájlfeltöltéshez
        const formData = new FormData()
        formData.append('name', name.value)
        formData.append('price', price.value)
        formData.append('unit', unit.value)
        formData.append('desc', desc.value)
        formData.append('store', store.value)
        
        if (selectedFile.value) {
            formData.append('image', selectedFile.value) // Itt csatoljuk a képet
        }

        // Elküldjük a store-nak a FormData-t
        bolt.saveProduct(formData)
    }
</script>