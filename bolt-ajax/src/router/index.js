import { createRouter, createWebHistory } from 'vue-router'
import BoltView from '../views/BoltView.vue'
import LoginView from '../views/LoginView.vue' 
import NewProductView from '../views/NewProductView.vue'
import CartView from '../views/CartView.vue'
import DeleteProductView from '../views/DeleteProductView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'bolt', component: BoltView },
    { path: '/cart', name: 'cart', component: CartView},
    { path: '/delete', name: 'delete', component: DeleteProductView, meta: { requiresAuth: true, requiresAdmin: true }},
    { path: '/new', name: 'new', component: NewProductView, meta: { requiresAuth: true, requiresAdmin: true }},
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true }},
    { path: '/admin-orders', name: 'admin-orders', component: AdminOrdersView,meta: { requiresAuth: true, requiresAdmin: true }},
  ],
})

// Útvonalőr (Navigation Guard)
router.beforeEach((to, from, next) => {
  // Adatok kinyerése a localStorage-ból
  const token = localStorage.getItem('token')
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null

  // 1. Ellenőrzés: Ha az oldalhoz be kell lépni (requiresAuth), de nincs token
  if (to.meta.requiresAuth && !token) {
    return next('/login') // Irány a bejelentkezés
  }

  // 2. Ellenőrzés: Ha az oldal admin jogot kér (requiresAdmin), de a user nem admin
  if (to.meta.requiresAdmin && (!user || !user.isAdmin)) {
    // Nincs joga itt lenni -> visszaküldjük a főoldalra
    return next('/') 
  }

  // Ha minden rendben, engedjük tovább
  next()
})

export default router