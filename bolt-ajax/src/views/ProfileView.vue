<template>
  <div class="container mt-4">
    <h1 class="mb-4">Rendeléseim</h1>
    
    <div v-if="botStore.myOrders.length === 0" class="alert alert-info">
      Még nem adtál le rendelést. <RouterLink to="/">Irány vásárolni!</RouterLink>
    </div>

    <div v-else class="accordion" id="ordersAccordion">
      <div v-for="order in botStore.myOrders" :key="order._id" class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#order-' + order._id">
            <span class="me-3 fw-bold">{{ formatDate(order.date) }}</span>
            <span class="badge bg-success">{{ order.totalPrice }} Ft</span>
          </button>
        </h2>
        <div :id="'order-' + order._id" class="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
          <div class="accordion-body">
            <ul class="list-group">
              <li v-for="item in order.items" :key="item.productId" class="list-group-item d-flex justify-content-between align-items-center">
                {{ item.name }}
                <span class="badge bg-primary rounded-pill">{{ item.quantity }} db</span>
              </li>
            </ul>
            <div class="mt-2 text-end fw-bold">
              Összesen: {{ order.totalPrice }} Ft
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBotStore } from '@/stores/bot'
import { RouterLink } from 'vue-router'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const botStore = useBotStore()

onMounted(() => {
  botStore.fetchOrders()
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('hu-HU')
}
</script>