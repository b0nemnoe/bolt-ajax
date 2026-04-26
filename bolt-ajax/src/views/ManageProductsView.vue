<template>
  <div class="manage-products-container">
      <div class="d-flex justify-content-between align-items-center mb-5">
          <h1 class="fw-bold page-title mb-0">⚙️ {{ $t('admin.delete_product_title') }}</h1>
      </div>
      
      <div class="card premium-card">
          <div class="card-body p-0">
              <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0 premium-table">
                      <thead class="bg-slate-50 text-slate-600">
                          <tr>
                              <th class="ps-4 py-3 border-bottom-0">{{ $t('admin.col_name') }}</th>
                              <th class="py-3 border-bottom-0">{{ $t('admin.col_price') }}</th>
                              <th class="py-3 border-bottom-0">{{ $t('admin.col_unit') }}</th>
                              <th class="py-3 border-bottom-0">{{ $t('admin.col_desc') }}</th>
                              <th class="py-3 border-bottom-0">{{ $t('admin.col_stock') }}</th>
                              <th class="text-center pe-4 py-3 border-bottom-0">{{ $t('admin.col_actions') }}</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="product in productStore.products" :key="product.id" class="border-bottom">
                              
                              <template v-if="editingId === product.id">
                                  <td class="ps-4 py-3">
                                      <input type="text" class="form-control premium-input mb-2" v-model="editData.name" :placeholder="$t('admin.col_name')">
                                      <select class="form-select premium-input" v-model="editData.category">
                                          <option value="" disabled selected>{{ $t('admin.category_placeholder') }}</option>
                                          <option value="Étel">{{ $t('admin.cat_food') }}</option>
                                          <option value="Ital">{{ $t('admin.cat_drink') }}</option>
                                          <option value="Édesség">{{ $t('admin.cat_sweet') }}</option>
                                          <option value="Vegyi áru">{{ $t('admin.cat_chemical') }}</option>
                                      </select>
                                  </td>
                                  
                                  <td class="py-3"><input type="number" class="form-control premium-input" v-model="editData.price" style="width: 100px;"></td>
                                  <td class="py-3"><input type="text" class="form-control premium-input" v-model="editData.unit" style="width: 80px;"></td>
                                  <td class="py-3"><textarea class="form-control premium-input" v-model="editData.desc" rows="2" style="min-width: 150px;"></textarea></td>
                                  <td class="py-3"><input type="number" class="form-control premium-input" v-model.number="editData.store" style="width: 80px;"></td>
                                  
                                  <td class="text-center pe-4 py-3">
                                      <div class="d-flex flex-column gap-2 align-items-center">
                                          <button class="btn btn-teal btn-sm w-100 fw-bold" @click="saveEdit(product.id)">
                                              {{ $t('admin.save_edit') }}
                                          </button>
                                          <button class="btn btn-light btn-sm w-100 fw-bold text-slate-600 border" @click="cancelEdit">
                                              {{ $t('admin.cancel_edit') }}
                                          </button>
                                      </div>
                                  </td>
                              </template>

                              <template v-else>
                                  <td class="ps-4 py-4">
                                      <div class="fw-bold text-slate-800">{{ product.name }}</div>
                                      <span class="badge bg-slate-100 text-slate-600 mt-1">{{ product.category || $t('admin.no_category') }}</span>
                                  </td>
                                  <td class="py-4 fw-semibold text-slate-700">{{ product.price }} Ft</td>
                                  <td class="py-4 text-slate-600">{{ product.unit }}</td>
                                  <td class="py-4 text-muted small" style="max-width: 200px;">
                                      <div class="text-truncate">{{ product.desc }}</div>
                                  </td>
                                  <td class="py-4">
                                      <span class="badge px-2 py-1" :class="product.store > 0 ? 'bg-teal-light text-teal' : 'bg-red-light text-red'">
                                          {{ product.store }} {{ $t('admin.pieces') }}
                                      </span>
                                  </td>
                                  <td class="text-center pe-4 py-4">
                                      <div class="d-flex justify-content-center gap-2">
                                          <button class="btn btn-light btn-icon text-teal border" @click="startEdit(product)" title="Szerkesztés">
                                              ✏️
                                          </button>
                                          <button class="btn btn-light btn-icon text-danger border" @click="productStore.deleteProductFromDb(product.id)" title="Törlés">
                                              🗑️
                                          </button>
                                      </div>
                                  </td>
                              </template>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      
      <div v-if="productStore.products.length === 0" class="text-center py-5 mt-4">
          <v-icon name="bi-box-seam" scale="4" fill="#cbd5e1" class="mb-3" />
          <h4 class="text-slate-600 fw-semibold">{{ $t('admin.no_products') }}</h4>
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
.page-title {
color: #1e293b;
letter-spacing: -0.5px;
}
.premium-card {
border: none;
border-radius: 16px;
background: white;
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
overflow: hidden;
}
.premium-table {
--bs-table-bg: transparent;
--bs-table-hover-bg: #f8fafc;
}
.premium-table thead th {
font-weight: 600;
text-transform: uppercase;
font-size: 0.8rem;
letter-spacing: 0.5px;
}
.bg-slate-50 { background-color: #f8fafc; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }
.text-slate-800 { color: #1e293b; }
.bg-slate-100 { background-color: #f1f5f9; }

.bg-teal-light { background-color: #ccfbf1; }
.text-teal { color: #0d9488; }
.bg-red-light { background-color: #fee2e2; }
.text-red { color: #ef4444; }

.btn-icon {
width: 36px;
height: 36px;
padding: 0;
display: flex;
align-items: center;
justify-content: center;
border-radius: 8px;
transition: all 0.2s;
}
.btn-icon:hover {
transform: translateY(-2px);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.btn-teal {
background-color: #0d9488;
color: white;
border: none;
border-radius: 8px;
transition: all 0.2s ease;
}
.btn-teal:hover {
background-color: #0f766e;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}
.premium-input {
border: 1px solid #e2e8f0;
border-radius: 8px;
padding: 8px 12px;
transition: all 0.2s;
background-color: #f8fafc;
font-size: 0.9rem;
}
.premium-input:focus {
background-color: #ffffff;
border-color: #0d9488;
box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
outline: none;
}
</style>