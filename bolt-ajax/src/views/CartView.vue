<script setup>
import { useBotStore } from '@/stores/bot.js'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const botStore = useBotStore()

const getProduct = (id) => {
  if (!botStore.products || botStore.products.length === 0) return null
  return botStore.products.find(p => p.id == id || p._id == id)
}

const validCartItems = computed(() => {
  if (!botStore.cart) return []
  
  const items = []
  for (const [id, quantity] of Object.entries(botStore.cart)) {
    const product = getProduct(id)
    if (product) {
      items.push({ id, quantity, product })
    }
  }
  return items
})
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4 text-center">🛒 Kosár tartalma</h1>

    <div v-if="validCartItems.length === 0" class="text-center py-5">
      <div class="mb-3" style="font-size: 4rem;">🛍️</div>
      <h3 class="text-muted">A kosarad jelenleg üres.</h3>
      <RouterLink to="/" class="btn btn-primary mt-3 px-4 py-2">Irány vásárolni!</RouterLink>
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-10">
        <div class="table-responsive shadow-sm rounded border">
          <table class="table table-hover align-middle mb-0 bg-white">
            <thead class="table-light">
              <tr>
                <th style="width: 40%">Termék</th>
                <th style="width: 15%">Egységár</th>
                <th class="text-center" style="width: 20%">Mennyiség</th>
                <th class="text-end" style="width: 15%">Összesen</th>
                <th style="width: 10%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in validCartItems" :key="item.id">
                <td>
                  <div class="fw-bold">{{ item.product.name }}</div>
                  <small class="text-muted">{{ item.product.desc }}</small>
                </td>
                <td>{{ item.product.price }} Ft</td>
                <td class="text-center">
                  <div class="btn-group shadow-sm" role="group">
                    <button @click="botStore.modifyQuantity(item.id, '-')" class="btn btn-outline-secondary btn-sm">-</button>
                    <span class="btn btn-light btn-sm disabled text-dark fw-bold px-3 border-top border-bottom">{{ item.quantity }}</span>
                    <button @click="botStore.modifyQuantity(item.id, '+')" class="btn btn-outline-secondary btn-sm">+</button>
                  </div>
                </td>
                <td class="text-end fw-bold text-primary">{{ item.quantity * item.product.price }} Ft</td>
                <td class="text-end">
                  <button @click="botStore.deleteProductFromCart(item.id)" class="btn btn-outline-danger btn-sm border-0">🗑️</button>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light border-top">
              <tr>
                <td colspan="3" class="text-end fw-bold fs-5 pt-3">Végösszeg:</td>
                <td class="text-end fw-bold fs-4 text-success pt-3">{{ botStore.countTotal() }} Ft</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 mb-5">
          <button @click="botStore.emptyCart()" class="btn btn-outline-danger">🗑️ Kosár ürítése</button>
          <div v-if="botStore.token">
             <button @click="botStore.checkout()" class="btn btn-success btn-lg shadow fw-bold px-4">Rendelés elküldése 🚀</button>
          </div>
          <div v-else>
            <RouterLink to="/login" class="btn btn-warning shadow fw-bold">🔑 Jelentkezz be!</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>