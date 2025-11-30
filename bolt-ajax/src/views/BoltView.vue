<script setup>
import { useBotStore } from '@/stores/bot.js'
import { BACKEND_URL } from '@/stores/bot.js'

const botStore = useBotStore()

// Segédfüggvény a kép URL eldöntéséhez
const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/300x200?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}
</script>

<template>
  <h1 class="mb-4 text-center">Termékek</h1>

  <div class="card p-3 mb-4 shadow-sm bg-light">
    <div class="row g-3 align-items-center">
      
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text">🔍</span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Keresés név vagy leírás alapján..." 
            v-model="botStore.searchQuery"
          >
        </div>
      </div>

      <div class="col-md-3">
        <select class="form-select" v-model="botStore.sortOrder">
          <option value="default">Rendezés: Alapértelmezett</option>
          <option value="asc">Ár: Növekvő (Olcsóbb elöl)</option>
          <option value="desc">Ár: Csökkenő (Drágább elöl)</option>
        </select>
      </div>

      <div class="col-md-3 text-center text-md-start">
        <div class="form-check form-switch d-inline-block">
          <input class="form-check-input" type="checkbox" id="stockFilter" v-model="botStore.onlyInStock">
          <label class="form-check-label ms-2" for="stockFilter">Csak ami raktáron van</label>
        </div>
      </div>

    </div>
  </div>

  <div class="row gap-4 justify-content-center">
    
    <div v-if="botStore.filteredProducts.length === 0" class="alert alert-warning text-center w-75">
      Nincs a keresési feltételeknek megfelelő termék. 😢
    </div>

    <div v-for="p in botStore.filteredProducts" :key="p.id" class="card col-12 col-md-4 col-lg-3 p-0 overflow-hidden shadow-sm product-card">
      
      <img 
        :src="getImageUrl(p.image)" 
        class="card-img-top" 
        style="height: 200px; object-fit: cover;"
        alt="Termék kép"
      >
      
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ p.name }}</h5>
        <p class="card-text text-muted small flex-grow-1">{{ p.desc }}</p>
        
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="fw-bold fs-5 text-primary">{{ p.price }} Ft</span>
          <span class="badge" :class="p.store > 0 ? 'bg-success' : 'bg-danger'">
            {{ p.store > 0 ? `${p.store} ${p.unit}` : 'Elfogyott' }}
          </span>
        </div>
      </div>
      
      <div class="card-footer bg-white border-top-0 pb-3 text-center">
        <button 
          :disabled="p.store === 0" 
          @click="botStore.addToCart(p.id)" 
          class="btn btn-outline-primary w-100"
        >
          <span v-if="p.store > 0">Kosárba &#128722;</span>
          <span v-else>Nem rendelhető 🚫</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
}
</style>