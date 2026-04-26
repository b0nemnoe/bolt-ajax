<template>
  <div class="container mt-4">
    <h1 class="mb-4">{{ $t('admin.orders_title') }}</h1>

    <div v-if="orderStore.adminOrders.length === 0" class="alert alert-info">
      {{ $t('admin.no_orders') }}
    </div>

    <div v-else class="table-responsive shadow-sm rounded">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>{{ $t('admin.date') }}</th>
            <th>{{ $t('admin.buyer') }}</th>
            <th>{{ $t('admin.total') }}</th>
            <th>{{ $t('admin.products') }}</th>
            <th>{{ $t('admin.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderStore.adminOrders" :key="order._id">
            <td>{{ new Date(order.date).toLocaleString('hu-HU') }}</td>
            
            <td>
                <div class="fw-bold">{{ order.user?.email || $t('admin.unknown') }}</div>
                <small class="text-muted">ID: {{ order._id.slice(-6) }}...</small>
            </td>

            <td class="fw-bold text-success">{{ order.totalPrice }} Ft</td>

            <td>
              <ul class="list-unstyled mb-0 small">
                <li v-for="item in order.items" :key="item.productId">
                  {{ item.quantity }}x {{ item.name }}
                </li>
              </ul>
            </td>

            <td>
              <select 
                class="form-select form-select-sm" 
                :class="getStatusColor(order.status)"
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/order.js'

const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchAdminOrders()
})

const getStatusColor = (status) => {
  switch(status) {
    case 'Kiszállítva': return 'border-info text-info fw-bold bg-light';
    case 'Teljesítve': return 'border-success text-success fw-bold bg-light';
    case 'Törölve': return 'border-danger text-danger fw-bold bg-light';
    default: return 'border-warning text-warning fw-bold bg-light';
  }
}
</script>