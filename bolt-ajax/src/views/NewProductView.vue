<template>
    <div class="container mt-4">
        <h1 class="text-center mb-4">{{ $t('admin.new_product_title') }}</h1>
        <form class="w-50 mx-auto card p-4 shadow" @submit.prevent="onSubmit">
            
            <div class="mb-3">
                <label class="form-label">{{ $t('admin.name') }}</label>
                <input class="form-control" type="text" v-model="name" required :placeholder="$t('admin.name_placeholder')">
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.category') }}</label>
                <select class="form-select" v-model="category" required>
                    <option value="" disabled selected>{{ $t('admin.category_placeholder') }}</option>
                    <option value="Étel">{{ $t('admin.cat_food') }}</option>
                    <option value="Ital">{{ $t('admin.cat_drink') }}</option>
                    <option value="Édesség">{{ $t('admin.cat_sweet') }}</option>
                    <option value="Vegyi áru">{{ $t('admin.cat_chemical') }}</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.price') }}</label>
                <input class="form-control" type="number" v-model="price" required :placeholder="$t('admin.price_placeholder')" max="999999">
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.unit') }}</label>
                <input class="form-control" type="text" v-model="unit" required :placeholder="$t('admin.unit_placeholder')">
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.desc') }}</label>
                <textarea class="form-control" v-model="desc" rows="2"></textarea>
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.stock') }}</label>
                <input class="form-control" type="number" v-model="store" required>
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('admin.image') }}</label>
                <input class="form-control" type="file" @change="onFileChange" accept="image/*">
            </div>

            <button class="btn btn-success w-100" type="submit">{{ $t('admin.save') }}</button>
        </form>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useProductStore } from '@/stores/product.js'
    
    const productStore = useProductStore()
    
    const name = ref('')
    const category = ref('')
    const price = ref('')
    const unit = ref('')
    const desc = ref('')
    const store = ref('')
    const selectedFile = ref(null)

    const onFileChange = (e) => {
        selectedFile.value = e.target.files[0]
    }

    const onSubmit = () => {
        const formData = new FormData()
        formData.append('name', name.value)
        formData.append('category', category.value)
        formData.append('price', price.value)
        formData.append('unit', unit.value)
        formData.append('desc', desc.value)
        formData.append('store', store.value)
        
        if (selectedFile.value) {
            formData.append('image', selectedFile.value) 
        }
        
        productStore.saveProduct(formData)
    }
</script>