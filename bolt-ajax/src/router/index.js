import { createRouter, createWebHistory } from 'vue-router'
import BoltView from '../views/BoltView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import NewProductView from '../views/NewProductView.vue'
import DeleteProductView from '../views/DeleteProductView.vue'
import CartView from '../views/CartView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'
import ProductDetailsView from '../views/ProductDetailsView.vue'
import WishlistView from '../views/WishlistView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'bolt',
      component: BoltView,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },
    {
      path: '/new',
      name: 'new',
      component: NewProductView,
      meta: { requiresAuth: true, requiresAdmin: true } 
    },
    {
      path: '/delete',
      name: 'delete',
      component: DeleteProductView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin-orders',
      name: 'admin-orders',
      component: AdminOrdersView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/product/:id',
      name: 'product-details',
      component: ProductDetailsView
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: WishlistView,
      meta: { requiresAuth: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: ResetPasswordView
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null

  if (to.meta.requiresAuth && !token) {
    return next('/login') 
  }

  if (to.meta.requiresAdmin && (!user || !user.isAdmin)) {
    return next('/') 
  }

  next()
})

export default router