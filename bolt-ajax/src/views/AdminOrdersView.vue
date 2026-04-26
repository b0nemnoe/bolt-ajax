<template>
  <div class="admin-orders-container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <h1 class="fw-bold page-title m-0">{{ $t('admin.orders_title') }}</h1>
      <span class="badge bg-teal rounded-pill px-3 py-2">{{ orderStore.adminOrders.length }} {{ $t('admin.orders_count') }}</span>
    </div>

    <div v-if="orderStore.adminOrders.length === 0" class="text-center py-5">
      <div class="mb-3" style="font-size: 4rem;">📦</div>
      <h3 class="text-muted">{{ $t('admin.no_orders') }}</h3>
    </div>

    <div v-else>
      <!-- DESKTOP VIEW (Table) -->
      <div class="d-none d-lg-block shadow-sm rounded-4 overflow-hidden border bg-white">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">{{ $t('admin.date') }}</th>
              <th>{{ $t('admin.buyer') }}</th>
              <th>{{ $t('admin.total') }}</th>
              <th>{{ $t('admin.products') }}</th>
              <th class="pe-4">{{ $t('admin.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orderStore.adminOrders" :key="order._id">
              <td class="ps-4 text-muted small">
                {{ new Date(order.date).toLocaleString('hu-HU') }}
              </td>
              
              <td>
                <div class="fw-bold text-dark">{{ order.user?.email || $t('admin.unknown') }}</div>
                <div class="text-muted extra-small">ID: {{ order._id.slice(-8) }}</div>
              </td>

              <td class="fw-bold text-teal">{{ order.totalPrice.toLocaleString() }} Ft</td>

              <td>
                <div class="product-list-preview">
                  <span v-for="(item, idx) in order.items" :key="item.productId" class="item-pill">
                    {{ item.quantity }}x {{ item.name }}{{ idx < order.items.length - 1 ? ',' : '' }}
                  </span>
                </div>
              </td>

              <td class="pe-4">
                <select 
                  class="form-select form-select-sm status-select shadow-none" 
                  :class="getStatusClass(order.status)"
                  :value="order.status"
                  @change="orderStore.updateOrderStatus(order._id, $event.target.value)"
                >
                  <option value="Feldolgozás alatt">{{ $t('admin.processing') }}</option>
                  <option value="Kiszállítva">{{ $t('admin.shipped') }}</option>
                  <option value="Teljesítve">{{ $t('admin.completed') }}</option>
                  <option value="Törölve">{{ $t('admin.cancelled') }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE VIEW (Cards) -->
      <div class="d-lg-none d-flex flex-column gap-3 px-2 mb-5">
        <div v-for="order in orderStore.adminOrders" :key="order._id" class="order-card p-3 shadow-sm bg-white rounded-4 border">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div class="fw-bold text-dark">{{ order.user?.email || $t('admin.unknown') }}</div>
              <div class="text-muted extra-small">{{ new Date(order.date).toLocaleString('hu-HU') }}</div>
            </div>
            <div class="text-teal fw-bold fs-5">{{ order.totalPrice.toLocaleString() }} Ft</div>
          </div>

          <div class="bg-light rounded-3 p-2 mb-3">
            <div v-for="item in order.items" :key="item.productId" class="small text-muted mb-1">
              • {{ item.quantity }}x {{ item.name }}
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted text-nowrap">Státusz:</span>
            <select 
              class="form-select form-select-sm status-select flex-grow-1" 
              :class="getStatusClass(order.status)"
              :value="order.status"
              @change="orderStore.updateOrderStatus(order._id, $event.target.value)"
            >
              <option value="Feldolgozás alatt">{{ $t('admin.processing') }}</option>
              <option value="Kiszállítva">{{ $t('admin.shipped') }}</option>
              <option value="Teljesítve">{{ $t('admin.completed') }}</option>
              <option value="Törölve">{{ $t('admin.cancelled') }}</option>
            </select>
          </div>
          <div class="mt-2 text-center text-muted extra-small">ID: {{ order._id }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/order.js'

const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchAdminOrders()
})

const getStatusClass = (status) => {
  switch(status) {
    case 'Kiszállítva': return 'status-info';
    case 'Teljesítve': return 'status-success';
    case 'Törölve': return 'status-danger';
    default: return 'status-warning';
  }
}
</script>

<style scoped>
.page-title {
  color: #0f172a;
}
.bg-teal {
  background-color: #0d9488 !important;
  color: white;
}
.text-teal {
  color: #0d9488;
}

/* Table styles */
.table thead th {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  font-weight: 700;
  color: #64748b;
}
.item-pill {
  font-size: 0.85rem;
  color: #475569;
}
.extra-small {
  font-size: 0.7rem;
}

/* Status select styles */
.status-select {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
.status-warning { background-color: #fffbeb; color: #92400e; border-color: #fde68a; }
.status-info { background-color: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
.status-success { background-color: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.status-danger { background-color: #fef2f2; color: #991b1b; border-color: #fecaca; }

/* Mobile Card styles */
.order-card {
  transition: transform 0.2s;
}
.order-card:active {
  transform: scale(0.98);
}
.product-list-preview {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>