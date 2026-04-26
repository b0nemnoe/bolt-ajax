<script setup>
import { watch, onMounted } from 'vue'
import { BACKEND_URL } from '@/utils/axios.js'

import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useUserStore } from '@/stores/user.js'

const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/300x200?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}

const isInWishlist = (id) => {
    return userStore.wishlist.some(p => (p._id == id || p.id == id))
}

onMounted(() => {
    productStore.loadCategories()
})

let timeout
watch(
  () => [productStore.searchQuery, productStore.selectedCategory, productStore.sortOrder, productStore.onlyInStock],
  () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      productStore.loadAll(1)
    }, 300)
  }
)

</script>

<template>
  <div class="bolt-view-container"> 
    <h1 class="mb-5 text-center fw-bold page-title">{{ $t('bolt.title') }}</h1>

    <div class="search-bar-container p-4 mb-5">
      <div class="row g-3 align-items-center">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">🔍</span>
            <input type="text" class="form-control" :placeholder="$t('bolt.search_placeholder')" v-model="productStore.searchQuery">
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="productStore.selectedCategory">
              <option value="all">{{ $t('bolt.filter_all') }}</option>
              <option v-for="cat in productStore.categories" :key="cat" :value="cat">
                  {{ cat }}
              </option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="productStore.sortOrder">
            <option value="default">{{ $t('bolt.sort_default') }}</option>
            <option value="asc">{{ $t('bolt.sort_asc') }}</option>
            <option value="desc">{{ $t('bolt.sort_desc') }}</option>
          </select>
        </div>
        <div class="col-md-3 text-center text-md-start">
          <div class="form-check form-switch d-inline-block">
            <input class="form-check-input" type="checkbox" id="stockFilter" v-model="productStore.onlyInStock">
            <label class="form-check-label ms-2" for="stockFilter">{{ $t('bolt.in_stock') }}</label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="productStore.isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">{{ $t('bolt.loading') }}</span>
      </div>
      <p class="mt-2 text-muted">{{ $t('bolt.loading') }}</p>
    </div>

    <div v-else class="row gap-4 justify-content-center">
      
      <div v-if="productStore.filteredProducts.length === 0" class="alert alert-warning text-center w-75">
        {{ $t('bolt.no_results') }}
      </div>

      <div v-for="p in productStore.filteredProducts" :key="p.id" class="card col-12 col-md-4 col-lg-3 p-0 product-card">
        <RouterLink :to="{ name: 'product-details', params: { id: p.id } }" class="img-wrapper">
        <img 
          :src="getImageUrl(p.image)" 
          class="card-img-top product-img" 
          alt="Termék kép"
        >
      </RouterLink>
        <div class="card-body d-flex flex-column px-4 pt-4">
          
          <h5 class="card-title product-title">{{ p.name }}</h5>
          
          <p class="card-text text-muted small flex-grow-1 product-desc">{{ p.desc }}</p>
          <div class="d-flex justify-content-between align-items-center mt-4">
            <span class="fw-bold fs-4 text-teal">{{ p.price }} Ft</span>
            <span class="badge" :class="p.store > 0 ? 'stock-badge-success' : 'stock-badge-danger'">
              {{ p.store > 0 ? `${p.store} ${p.unit}` : $t('bolt.out_of_stock') }}
            </span>
          </div>
        </div>
        
        <div class="card-footer bg-white border-top-0 pb-4 px-4">
  <div class="d-flex gap-2">
    
    <button 
      :disabled="p.store === 0" 
      @click="cartStore.addToCart(p.id)" 
      class="btn btn-teal flex-grow-1 fw-bold"
    >
      <span v-if="p.store > 0">🛒 {{ $t('bolt.add_to_cart') }}</span>
      <span v-else>{{ $t('bolt.not_orderable') }}</span>
    </button>
    
    <button 
      @click="userStore.toggleWishlist(p.id)" 
      class="btn btn-outline-danger"
      title="Hozzáadás a kedvencekhez"
    >
      <v-icon 
        :name="isInWishlist(p.id) ? 'bi-heart-fill' : 'bi-heart'" 
        scale="1.0"
      />
    </button>

  </div>
</div>
      </div>
    </div>
    
    <div v-if="productStore.totalPages > 1 && !productStore.isLoading" class="d-flex justify-content-center mt-5 mb-4">
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: productStore.currentPage === 1 }">
            <button class="page-link" @click="productStore.loadAll(productStore.currentPage - 1)">Előző</button>
          </li>
          
          <li v-for="page in productStore.totalPages" :key="page" class="page-item" :class="{ active: productStore.currentPage === page }">
            <button class="page-link" @click="productStore.loadAll(page)">{{ page }}</button>
          </li>
          
          <li class="page-item" :class="{ disabled: productStore.currentPage === productStore.totalPages }">
            <button class="page-link" @click="productStore.loadAll(productStore.currentPage + 1)">Következő</button>
          </li>
        </ul>
      </nav>
    </div>

  </div>
</template>

<style scoped>
.page-title {
  color: #1e293b;
  letter-spacing: -0.5px;
}
.search-bar-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}
.product-card { 
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
}
.product-card:hover { 
  transform: translateY(-8px); 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.img-wrapper {
  overflow: hidden;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: block;
}
.product-img {
  height: 240px;
  object-fit: cover;
  transition: transform 0.5s ease;
  cursor: pointer;
}
.product-card:hover .product-img {
  transform: scale(1.05);
}
.product-title {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}
.product-desc {
  color: #64748b !important;
  line-height: 1.5;
}
.text-teal {
  color: #0d9488;
}
.btn-teal {
  background-color: #0d9488;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  transition: all 0.2s ease;
}
.btn-teal:hover:not(:disabled) {
  background-color: #0f766e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}
.btn-teal:disabled {
  background-color: #e2e8f0;
  color: #94a3b8;
}
.stock-badge-success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 5px 10px;
  font-weight: 500;
  font-size: 0.8rem;
}
.stock-badge-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 5px 10px;
  font-weight: 500;
  font-size: 0.8rem;
}
</style>