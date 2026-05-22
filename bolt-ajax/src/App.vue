<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useUserStore } from '@/stores/user.js'

const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

onMounted(async () => {
  await userStore.initAuth()
  productStore.loadAll()
})

const cartItemCount = computed(() => {
  if (!cartStore.cart) return 0
  return Object.values(cartStore.cart).reduce((acc, qty) => acc + qty, 0)
})

const closeNavbar = (e) => {
  if (e.target.classList.contains('dropdown-toggle') || e.target.closest('.dropdown-toggle')) {
    return
  }

  const menu = document.getElementById('mainMenu')
  if (menu && menu.classList.contains('show')) {
    const toggler = document.querySelector('.navbar-toggler')
    if (toggler) toggler.click()
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light custom-navbar sticky-top mb-4">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold fst-italic" to="/">
        🛍️ SuperShop
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainMenu">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" @click="closeNavbar($event)">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">{{ $t('nav.products') }}</RouterLink>
          </li>
          <li v-if="userStore.user && userStore.user.isAdmin">
            <RouterLink class="nav-link" to="/admin-orders" active-class="active">{{ $t('nav.manage_orders') }}</RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto align-items-center" @click="closeNavbar($event)">
          
          <li class="nav-item dropdown me-3">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              🌍 {{ $i18n.locale.toUpperCase() }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end fade-down">
              <li><button @click="$i18n.locale = 'hu'" class="dropdown-item">🇭🇺 Magyar (HU)</button></li>
              <li><button @click="$i18n.locale = 'en'" class="dropdown-item">🇬🇧 English (EN)</button></li>
            </ul>
          </li>

          <li class="nav-item dropdown me-3" v-if="userStore.user && userStore.user.isAdmin">
            <a class="nav-link dropdown-toggle admin-badge" href="#" role="button" data-bs-toggle="dropdown">
              {{ $t('nav.admin') }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end fade-down">
              
              <li><RouterLink class="dropdown-item" to="/new">{{ $t('nav.new_product') }}</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><RouterLink class="dropdown-item text-warning" to="/manage-products">{{ $t('nav.edit_product') }}</RouterLink></li>
            </ul>
          </li>

          <li class="nav-item me-3">
            <RouterLink class="nav-link position-relative" to="/cart" active-class="active">
              {{ $t('nav.cart') }}
              <span v-if="cartItemCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ cartItemCount }}
              </span>
            </RouterLink>
          </li>

          <li class="nav-item me-3">
            <RouterLink class="nav-link" to="/wishlist" active-class="active">
              {{ $t('nav.wishlist') }}
            </RouterLink>
          </li>

          <li class="nav-item" v-if="!userStore.token">
            <RouterLink class="nav-link btn-login fw-bold ms-lg-3" to="/login">{{ $t('nav.login') }}</RouterLink>
          </li>

          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              👤 {{ userStore.user?.email ? userStore.user.email.split('@')[0] : $t('nav.my_account') }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end fade-down">
              <li><RouterLink class="dropdown-item" to="/profile">📦 {{ $t('profile.my_orders') }}</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/settings">⚙️ Beállítások</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><a href="#" @click.prevent="userStore.logout" class="dropdown-item text-danger">🚪 {{ $t('nav.logout') }}</a></li>
            </ul>
          </li>

        </ul>
      </div>
    </div>
  </nav>

  <div class="container main-content">
    <RouterView />
  </div>
</template>

<style>
body {
  font-family: 'Outfit', sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
}
</style>

<style scoped>
.custom-navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 15px 0;
}
.navbar-brand {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  color: #0d9488 !important; /* Teal 600 */
}
.nav-link {
  font-weight: 500;
  color: #475569 !important; /* Slate 600 */
  transition: all 0.3s ease;
}
.nav-link:hover, .nav-link.active {
  color: #0d9488 !important;
}
.admin-badge {
  background-color: #f1f5f9;
  border-radius: 20px;
  padding: 5px 15px !important;
  color: #0f172a !important;
}
.btn-login {
  background-color: #0d9488;
  color: white !important;
  border-radius: 8px;
  padding: 8px 20px !important;
  transition: all 0.2s ease;
}
.btn-login:hover {
  background-color: #0f766e;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);
}
.fade-down {
  animation: fadeInDown 0.3s ease;
  border: none;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.main-content {
  min-height: 80vh;
}
</style>