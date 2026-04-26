<template>
    <div class="container mt-4">
        <h1 class="mb-4">{{ $t('admin.delete_product_title') }}</h1>
        
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>{{ $t('admin.col_name') }}</th>
                        <th>{{ $t('admin.col_price') }}</th>
                        <th>{{ $t('admin.col_unit') }}</th>
                        <th>{{ $t('admin.col_desc') }}</th>
                        <th>{{ $t('admin.col_stock') }}</th>
                        <th class="text-center">{{ $t('admin.col_actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in productStore.products" :key="product.id">
                        
                        <template v-if="editingId === product.id">
                            <td>
                                <input type="text" class="form-control mb-2" v-model="editData.name" :placeholder="$t('admin.col_name')">
                                
                                <select class="form-select" v-model="editData.category">
                                    <option value="" disabled selected>{{ $t('admin.category_placeholder') }}</option>
                                    <option value="Étel">{{ $t('admin.cat_food') }}</option>
                                    <option value="Ital">{{ $t('admin.cat_drink') }}</option>
                                    <option value="Édesség">{{ $t('admin.cat_sweet') }}</option>
                                    <option value="Vegyi áru">{{ $t('admin.cat_chemical') }}</option>
                                </select>
                            </td>
                            
                            <td><input type="number" class="form-control" v-model="editData.price"></td>
                            <td><input type="text" class="form-control" v-model="editData.unit" style="width: 80px;"></td>
                            <td><input type="text" class="form-control" v-model="editData.desc"></td>
                            <td><input type="number" class="form-control" v-model.number="editData.store" style="width: 80px;"></td>
                            
                            <td class="text-center">
                                <button class="btn btn-success btn-sm me-2" @click="saveEdit(product.id)">
                                    {{ $t('admin.save_edit') }}
                                </button>
                                <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                                    {{ $t('admin.cancel_edit') }}
                                </button>
                            </td>
                        </template>

                        <template v-else>
                            <td>
                                <div class="fw-bold">{{ product.name }}</div>
                                <span class="badge bg-info text-dark">{{ product.category || $t('admin.no_category') }}</span>
                            </td>
                            <td>{{ product.price }}</td>
                            <td>{{ product.unit }}</td>
                            <td>{{ product.desc }}</td>
                            <td>
                                <span :class="{'text-danger fw-bold': product.store === 0, 'text-success': product.store > 0}">
                                    {{ product.store }} {{ $t('admin.pieces') }}
                                </span>
                            </td>
                            <td class="text-center">
                                <button class="btn btn-primary btn-sm me-2" @click="startEdit(product)">
                                    ✏️
                                </button>
                                <button class="btn btn-danger btn-sm" @click="productStore.deleteProductFromDb(product.id)">
                                    🗑️
                                </button>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div v-if="productStore.products.length === 0" class="alert alert-warning text-center">
            {{ $t('admin.no_products') }}
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useProductStore } from '@/stores/product.js'
    
    const productStore = useProductStore()
    
    const editingId = ref(null)
    const editData = ref({})

    const startEdit = (product) => {
        editingId.value = product.id
        editData.value = { ...product, category: product.category || '' } 
    }

    const saveEdit = () => {
        productStore.updateProduct(editData.value)
        editingId.value = null 
    }

    const cancelEdit = () => {
        editingId.value = null
        editData.value = {}
    }
</script>

<style scoped>
.table input {
    min-width: 100px;
}
</style>