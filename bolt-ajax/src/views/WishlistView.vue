<template>
  <div class="container mt-4">
    <h1 class="text-center mb-4">❤️ Kedvenceim</h1>

    <div v-if="userStore.wishlist.length === 0" class="text-center py-5">
      <h3>A kívánságlistád üres.</h3>
      <RouterLink to="/" class="btn btn-primary mt-3">Böngészés</RouterLink>
    </div>

    <div v-else class="row gap-4 justify-content-center">
      <div v-for="p in userStore.wishlist" :key="p._id || p.id" class="card col-12 col-md-4 col-lg-3 p-0 shadow-sm">
        <RouterLink :to="{ name: 'product-details', params: { id: p._id || p.id } }">
            <img :src="getImageUrl(p.image)" class="card-img-top" style="height: 200px; object-fit: cover;">
        </RouterLink>
        <div class="card-body">
          <h5 class="card-title">{{ p.name }}</h5>
          <p class="text-primary fw-bold">{{ p.price }} Ft</p>
          <button @click="userStore.toggleWishlist(p._id || p.id)" class="btn btn-outline-danger w-100">
            Eltávolítás 💔
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user.js'
import { BACKEND_URL } from '@/utils/axios.js'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()

const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/300x200?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}
</script>