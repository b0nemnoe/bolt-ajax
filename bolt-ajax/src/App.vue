<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useBotStore } from '@/stores/bot.js'

const botStore = useBotStore()

onMounted(() => {
  botStore.loadAll()
})

const cartItemCount = computed(() => {
  return Object.values(botStore.cart).reduce((acc, qty) => acc + qty, 0)
})
</script>

<template>
  <div class="container">
    <nav class="text-center my-4">
      <RouterLink class="btn btn-outline-info m-2" to="/">Termékek</RouterLink>
      
      <template v-if="botStore.user && botStore.user.isAdmin">
        <RouterLink class="btn btn-outline-warning m-2" to="/new">Új termék</RouterLink>
        <RouterLink class="btn btn-outline-secondary m-2" to="/delete">Termékek kezelése</RouterLink>
      </template>

      <RouterLink class="btn btn-outline-success m-2" to="/cart">
        Kosár <span v-if="cartItemCount > 0">({{ cartItemCount }})</span>
      </RouterLink>

      <button v-if="botStore.token" @click="botStore.logout" class="btn btn-dark m-2">Kijelentkezés</button>
      <RouterLink v-else class="btn btn-primary m-2" to="/login">Bejelentkezés</RouterLink>
      <template v-if="botStore.token">
        <RouterLink class="btn btn-outline-primary m-2" to="/profile">Profil</RouterLink>
        </template>
      
      <template v-if="botStore.user && botStore.user.isAdmin">
        <RouterLink class="btn btn-outline-dark m-2" to="/admin-orders">📦 Rendelések</RouterLink> <RouterLink class="btn btn-outline-warning m-2" to="/new">Új termék</RouterLink>
        <RouterLink class="btn btn-outline-danger m-2" to="/delete">Termék törlése</RouterLink>
      </template>
      
    </nav>
    <RouterView />
  </div>
</template>