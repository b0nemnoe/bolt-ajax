<script setup>
import { useBotStore } from '@/stores/bot.js'
import { BACKEND_URL } from '@/stores/bot.js'

const botStore = useBotStore()

const getImageUrl = (imageName) => {
  if (!imageName) {
    return 'https://placehold.co/300x200?text=Nincs+kép'
  }
  if (imageName.startsWith('http')) {
    return imageName
  }

  // Ha maradtak a régi megoldás szerint képek, akkor küldje vissza azokat
  return `${BACKEND_URL}/uploads/${imageName}`
}
</script>

<template>
  <h1>Termékek</h1>
  <div class="row gap-5 justify-content-center">
    <div v-for="p in botStore.products" :key="p.id" class="card col-12 col-md-4 col-lg-3 p-0 overflow-hidden shadow-sm">
      
      <img 
        :src="getImageUrl(p.image)" 
        class="card-img-top" 
        style="height: 200px; object-fit: cover;"
        alt="Termék kép"
      >
      
      <div class="card-body">
        <h5 class="card-title">{{ p.name }}</h5>
        <p class="card-text text-muted">{{ p.desc }}</p>
        <p class="card-text fw-bold fs-5">{{ p.price }} Ft / {{ p.unit }}</p>
        <p class="card-text small">Raktáron: {{ p.store }} db</p>
      </div>
      
      <div class="card-footer text-center bg-white border-top-0 mb-2">
        <button :disabled="p.store == 0" @click="botStore.addToCart(p.id)" class="btn btn-outline-primary w-75">
          Kosárba &#128722;
        </button>
      </div>
    </div>
  </div>
</template>
