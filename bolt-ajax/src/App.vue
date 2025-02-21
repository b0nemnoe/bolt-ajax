<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useBotStore } from '@/stores/bot.js'

const botStore = useBotStore()

onMounted(() => {
  botStore.loadAll()
})

// 🔹 Kosárban lévő összes termék kiszámítása
const cartItemCount = computed(() => {
  return Object.values(botStore.cart).reduce((acc, qty) => acc + qty, 0)
})
</script>

<template>
  <div class="container">
    <nav class="text-center">
      <RouterLink class="btn btn-outline-info m-2" to="/">Termékek</RouterLink>
      <RouterLink class="btn btn-outline-warning m-2" to="/new">Új termék</RouterLink>
      <RouterLink class="btn btn-outline-danger m-2" to="/delete">Termék törlése</RouterLink>
      <RouterLink class="btn btn-outline-success m-2" to="/cart">
        Kosár <span v-if="cartItemCount > 0">({{ cartItemCount }})</span>
      </RouterLink>

    </nav>
    <RouterView />
  </div>
</template>
