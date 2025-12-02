<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBotStore } from '@/stores/bot.js'
import { BACKEND_URL } from '@/stores/bot.js'

const isInWishlist = (id) => {
    return botStore.wishlist && botStore.wishlist.some(p => (p._id == id || p.id == id))
}

const route = useRoute()
const botStore = useBotStore()

onMounted(() => {
  const productId = route.params.id
  botStore.fetchProductById(productId)
})

const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/600x400?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}
</script>

<template>
  <div class="container mt-5">
    
    <!-- TÖLTÉS -->
    <div v-if="botStore.isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Termék betöltése...</p>
    </div>

    <!-- TERMÉK MEGJELENÍTÉSE -->
    <div v-else-if="botStore.currentProduct" class="row g-5">
      
      <!-- Bal oldal: Kép -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 overflow-hidden">
          <img 
            :src="getImageUrl(botStore.currentProduct.image)" 
            class="img-fluid w-100" 
            style="object-fit: cover; max-height: 500px;"
            alt="Termék kép"
          >
        </div>
      </div>

      <!-- Jobb oldal: Adatok -->
      <div class="col-md-6 d-flex flex-column justify-content-center">
        <h1 class="display-5 fw-bold mb-3">{{ botStore.currentProduct.name }}</h1>
        
        <p class="lead text-muted mb-4">
          {{ botStore.currentProduct.desc }}
        </p>
        
        <h2 class="text-primary fw-bold mb-4">
          {{ botStore.currentProduct.price }} Ft 
          <span class="text-muted fs-5 fw-normal">/ {{ botStore.currentProduct.unit }}</span>
        </h2>

        <div class="d-flex align-items-center mb-4">
            <span class="badge p-2 fs-6" :class="botStore.currentProduct.store > 0 ? 'bg-success' : 'bg-danger'">
                {{ botStore.currentProduct.store > 0 ? 'Raktáron' : 'Elfogyott' }}
            </span>
            <span v-if="botStore.currentProduct.store > 0" class="ms-3 text-muted">
                ({{ botStore.currentProduct.store }} db elérhető)
            </span>
        </div>

        <div class="d-grid gap-2">
          
          <div class="d-flex gap-2">
            <button 
              :disabled="botStore.currentProduct.store === 0" 
              @click="botStore.addToCart(botStore.currentProduct.id)" 
              class="btn btn-primary btn-lg flex-grow-1"
            >
              Kosárba teszem 🛒
            </button>

            <button 
              @click="botStore.toggleWishlist(botStore.currentProduct.id)" 
              class="btn btn-outline-danger btn-lg"
              title="Kedvencekhez adás"
            >
               <v-icon 
                  :name="isInWishlist(botStore.currentProduct.id) ? 'bi-heart-fill' : 'bi-heart'" 
                  scale="1.5"
              />
            </button>
          </div>
          
          <RouterLink to="/" class="btn btn-outline-secondary">
            ← Vissza a termékekhez
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>