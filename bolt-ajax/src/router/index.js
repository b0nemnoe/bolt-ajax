import { createRouter, createWebHistory } from 'vue-router'
import BoltView from '../views/BoltView.vue'

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
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/new',
      name: 'new',
      component: () => import('../views/NewProductView.vue')
    },
    {
      path: '/delete',
      name: 'delete',
      component: () => import('../views/DeleteProductView.vue')
    }
  ],
})

export default router
