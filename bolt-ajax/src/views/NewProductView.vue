<template>
    <div class="new-product-container">
        <div class="d-flex justify-content-center mb-5">
            <h1 class="fw-bold page-title mb-0">✨ {{ $t('admin.new_product_title') }}</h1>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card premium-card">
                    <div class="card-body p-4 p-md-5">
                        <form @submit.prevent="onSubmit">
                            
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <label class="form-label text-muted fw-semibold">{{ $t('admin.name') }}</label>
                                    <input class="form-control premium-input" type="text" v-model="name" required :placeholder="$t('admin.name_placeholder')">
                                </div>
                                <div class="col-md-6 mb-4">
                                    <label class="form-label text-muted fw-semibold">{{ $t('admin.category') }}</label>
                                    <select class="form-select premium-input" v-model="category" required>
                                        <option value="" disabled selected>{{ $t('admin.category_placeholder') }}</option>
                                        <option value="Étel">{{ $t('admin.cat_food') }}</option>
                                        <option value="Ital">{{ $t('admin.cat_drink') }}</option>
                                        <option value="Édesség">{{ $t('admin.cat_sweet') }}</option>
                                        <option value="Vegyi áru">{{ $t('admin.cat_chemical') }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4 mb-4">
                                    <label class="form-label text-muted fw-semibold">{{ $t('admin.price') }}</label>
                                    <input class="form-control premium-input" type="number" v-model="price" required :placeholder="$t('admin.price_placeholder')" max="999999">
                                </div>
                                <div class="col-md-4 mb-4">
                                    <label class="form-label text-muted fw-semibold">{{ $t('admin.unit') }}</label>
                                    <input class="form-control premium-input" type="text" v-model="unit" required :placeholder="$t('admin.unit_placeholder')">
                                </div>
                                <div class="col-md-4 mb-4">
                                    <label class="form-label text-muted fw-semibold">{{ $t('admin.stock') }}</label>
                                    <input class="form-control premium-input" type="number" v-model="store" required>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label text-muted fw-semibold">{{ $t('admin.desc') }}</label>
                                <textarea class="form-control premium-input" v-model="desc" rows="3"></textarea>
                            </div>

                            <div class="mb-5">
                                <label class="form-label text-muted fw-semibold">{{ $t('admin.image') }}</label>
                                <input class="form-control premium-input file-input" type="file" @change="onFileChange" accept="image/*">
                            </div>

                            <button class="btn btn-teal w-100 fw-bold py-3 fs-5" type="submit">{{ $t('admin.save') }}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
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

<style scoped>
.page-title {
  color: #1e293b;
  letter-spacing: -0.5px;
}
.premium-card {
  border: none;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}
.premium-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 15px;
  transition: all 0.2s;
  background-color: #f8fafc;
}
.premium-input:focus {
  background-color: #ffffff;
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  outline: none;
}
.file-input {
  padding: 8px 12px;
}
.file-input::file-selector-button {
  background-color: #f1f5f9;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  margin-right: 15px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.file-input::file-selector-button:hover {
  background-color: #e2e8f0;
}
.btn-teal {
  background-color: #0d9488;
  color: white;
  border: none;
  border-radius: 12px;
  transition: all 0.2s ease;
}
.btn-teal:hover {
  background-color: #0f766e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}
</style>