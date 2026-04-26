<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useUserStore } from '@/stores/user.js'

const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

onMounted(() => {
  productStore.loadAll()
})

const cartItemCount = computed(() => {
  if (!cartStore.cart) return 0
  return Object.values(cartStore.cart).reduce((acc, qty) => acc + qty, 0)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark custom-navbar sticky-top shadow-sm mb-4">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold fst-italic" to="/">
        🛍️ SuperShop
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainMenu">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">{{ $t('nav.products') }}</RouterLink>
          </li>
          <li><RouterLink class="nav-link" to="/admin-orders" active-class="active">{{ $t('nav.manage_orders') }}</RouterLink></li>
        </ul>

        <ul class="navbar-nav ms-auto align-items-center">
          
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
              <li><RouterLink class="dropdown-item text-warning" to="/delete">{{ $t('nav.edit_product') }}</RouterLink></li>
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
            <RouterLink class="btn btn-light btn-sm fw-bold text-primary" to="/login">{{ $t('nav.login') }}</RouterLink>
          </li>

          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              👤 {{ userStore.user?.email ? userStore.user.email.split('@')[0] : $t('nav.my_account') }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end fade-down">
              <li><RouterLink class="dropdown-item" to="/profile">{{ $t('nav.my_orders') }}</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><RouterLink @click="userStore.logout" class="dropdown-item text-danger">{{ $t('nav.logout') }}</RouterLink></li>
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

<style scoped>
.custom-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.navbar-brand {
  font-size: 1.5rem;
  letter-spacing: 1px;
}
.nav-link {
  font-weight: 500;
  transition: all 0.3s;
}
.nav-link:hover, .nav-link.active {
  color: #fff !important;
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.admin-badge {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 5px 15px !important;
}
.fade-down {
  animation: fadeInDown 0.3s ease;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.main-content {
  min-height: 80vh;
}
</style>