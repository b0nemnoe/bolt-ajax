<template>
  <div class="profile-view-container">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <h1 class="fw-bold page-title mb-0">📦 {{ $t('profile.my_orders') }}</h1>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card premium-card">
          <div class="card-body p-4 p-md-5">
            
            <div v-if="orderStore.myOrders.length === 0" class="text-center py-5">
              <v-icon name="bi-bag-check-fill" scale="4" fill="#cbd5e1" class="mb-3" />
              <h4 class="text-muted fw-semibold">{{ $t('profile.no_orders') }}</h4>
              <p class="text-muted">Még nem adtál le rendelést. Nézz szét a termékeink között!</p>
              <RouterLink to="/" class="btn btn-teal mt-3 px-4 py-2 fw-bold">Vásárlás folytatása</RouterLink>
            </div>

            <div v-else class="accordion premium-accordion" id="ordersAccordion">
              <div v-for="order in orderStore.myOrders" :key="order._id" class="accordion-item border-0 mb-3 rounded-4 overflow-hidden shadow-sm">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed bg-white fw-semibold px-4 py-3 border-0" type="button" data-bs-toggle="collapse" :data-bs-target="'#order-' + order._id">
                    <div class="d-flex w-100 justify-content-between me-3 align-items-center">
                        <span class="text-slate-800">{{ formatDate(order.date) }}</span>
                        <span>
                            <span class="badge status-badge me-2" :class="order.status === 'Teljesítve' ? 'bg-teal-light text-teal' : 'bg-slate-100 text-slate-600'">{{ order.status }}</span>
                            <span class="badge price-badge">{{ order.totalPrice }} Ft</span>
                        </span>
                    </div>
                  </button>
                </h2>
                <div :id="'order-' + order._id" class="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
                  <div class="accordion-body bg-slate-50 px-4 py-4 border-top">
                    <ul class="list-group list-group-flush border-0">
                      <li v-for="item in order.items" :key="item.productId" class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 border-bottom-dashed">
                        <span class="fw-medium text-slate-700">{{ item.name }}</span>
                        <span class="badge bg-slate-200 text-slate-700 rounded-pill px-3 py-2">{{ item.quantity }} {{ $t('profile.pieces') }}</span>
                      </li>
                    </ul>
                    <div v-if="order.shippingAddress" class="mt-3 p-3 bg-white rounded-3 shadow-sm border border-light">
                      <div class="small text-muted mb-1 text-uppercase fw-bold" style="letter-spacing: 0.5px;">Szállítási cím</div>
                      <div class="text-slate-800 fw-medium">📍 {{ order.shippingAddress }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { useOrderStore } from '@/stores/order.js'

import { useUserStore } from '@/stores/user.js'

const orderStore = useOrderStore()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.token) {
    orderStore.fetchOrders()
  }
})

import { watch } from 'vue'
watch(() => userStore.token, (newToken) => {
  if (newToken) {
    orderStore.fetchOrders()
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.page-title {
  color: #1e293b;
  letter-spacing: -0.5px;
}
.premium-card {
  border: none;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}
.premium-accordion .accordion-item {
  background-color: white;
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9 !important;
}
.premium-accordion .accordion-button {
  border-radius: 16px !important;
  color: #334155;
  box-shadow: none !important;
}
.premium-accordion .accordion-button:not(.collapsed) {
  background-color: #f8fafc;
  color: #0d9488;
}
.bg-slate-50 { background-color: #f8fafc; }
.text-slate-800 { color: #1e293b; }
.text-slate-700 { color: #334155; }
.bg-slate-100 { background-color: #f1f5f9; }
.text-slate-600 { color: #475569; }
.bg-slate-200 { background-color: #e2e8f0; }

.bg-teal-light { background-color: #ccfbf1; }
.text-teal { color: #0d9488; }

.status-badge {
  padding: 8px 12px;
  font-weight: 500;
  border-radius: 8px;
}
.price-badge {
  background-color: #0d9488;
  color: white;
  padding: 8px 12px;
  font-weight: 600;
  border-radius: 8px;
}
.border-bottom-dashed {
  border-bottom: 1px dashed #cbd5e1 !important;
}
.border-bottom-dashed:last-child {
  border-bottom: none !important;
}
.btn-teal {
  background-color: #0d9488;
  color: white;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}
.btn-teal:hover {
  background-color: #0f766e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}
</style>