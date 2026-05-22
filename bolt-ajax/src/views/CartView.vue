<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useProductStore } from '@/stores/product.js'
import { useUserStore } from '@/stores/user.js'

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

const couponCode = ref('')
const shippingAddress = ref(userStore.user?.address || '')

const getProduct = (id) => {
  if (!productStore.products || productStore.products.length === 0) return null
  return productStore.products.find(p => p._id == id)
}

const validCartItems = computed(() => {
  if (!cartStore.cart) return []
  
  const items = []
  for (const [id, quantity] of Object.entries(cartStore.cart)) {
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
    <h1 class="mb-4 text-center">{{ $t('cart.title') }}</h1>

    <div v-if="validCartItems.length === 0" class="text-center py-5">
      <div class="mb-3" style="font-size: 4rem;">🛍️</div>
      <h3 class="text-muted">{{ $t('cart.empty') }}</h3>
      <RouterLink to="/" class="btn btn-primary mt-3 px-4 py-2">{{ $t('cart.go_shop') }}</RouterLink>
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-10">
        
        <div class="table-responsive shadow-sm rounded border">
          <table class="table table-hover align-middle mb-0 bg-white">
            <thead class="table-light">
              <tr>
                <th style="width: 40%">{{ $t('cart.product') }}</th>
                <th style="width: 15%">{{ $t('cart.unit_price') }}</th>
                <th class="text-center" style="width: 20%">{{ $t('cart.quantity') }}</th>
                <th class="text-end" style="width: 15%">{{ $t('cart.total') }}</th>
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
                    <button @click="cartStore.modifyQuantity(item.id, '-')" class="btn btn-outline-secondary btn-sm">-</button>
                    <span class="btn btn-light btn-sm disabled text-dark fw-bold px-3 border-top border-bottom">{{ item.quantity }}</span>
                    <button @click="cartStore.modifyQuantity(item.id, '+')" class="btn btn-outline-secondary btn-sm">+</button>
                  </div>
                </td>
                <td class="text-end fw-bold text-primary">{{ item.quantity * item.product.price }} Ft</td>
                <td class="text-end">
                  <button @click="cartStore.deleteProductFromCart(item.id)" class="btn btn-outline-danger btn-sm border-0">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row mt-4">
            
            <div class="col-md-6">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <h5 class="card-title">{{ $t('cart.coupon_title') }}</h5>
                        
                        <div v-if="!cartStore.coupon" class="input-group mt-3">
                            <input type="text" class="form-control" v-model="couponCode" :placeholder="$t('cart.coupon_placeholder')">
                            <button @click="cartStore.applyCoupon(couponCode)" class="btn btn-outline-primary">{{ $t('cart.redeem') }}</button>
                        </div>

                        <div v-else class="alert alert-success mt-2 d-flex justify-content-between align-items-center mb-0">
                            <span>
                                <strong>{{ cartStore.coupon.code }}</strong> 
                                (-{{ cartStore.coupon.discountPercent }}%) {{ $t('cart.activated') }}
                            </span>
                            <button @click="cartStore.removeCoupon" class="btn btn-sm ">❌</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mt-3 mt-md-0">
                <div class="card shadow-sm border-0 bg-light h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>{{ $t('cart.subtotal') }}</span>
                            <span>{{ cartStore.originalTotal }} Ft</span>
                        </div>
                        <div v-if="cartStore.coupon" class="d-flex justify-content-between mb-2 text-success">
                            <span>{{ $t('cart.discount') }}</span>
                            <span>-{{ cartStore.discountAmount }} Ft</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fs-4 fw-bold">
                            <span>{{ $t('cart.final_total') }}</span>
                            <span class="text-primary">{{ cartStore.finalTotal }} Ft</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div v-if="userStore.token" class="card shadow-sm border-0 bg-light mt-4 mb-2">
          <div class="card-body">
            <h5 class="card-title mb-3">Szállítási cím</h5>
            <div class="mb-3">
              <label class="form-label text-muted small">Ide fogjuk szállítani a rendelésed (Irányítószám, Város, Utca, Házszám)</label>
              <textarea v-model="shippingAddress" class="form-control" rows="2" placeholder="Add meg a pontos szállítási címet..."></textarea>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 mb-5">
          <button @click="cartStore.emptyCart()" class="btn btn-outline-danger">{{ $t('cart.empty_cart_btn') }}</button>
          
          <div v-if="userStore.token">
             <button @click="cartStore.checkout(shippingAddress)" class="btn btn-success btn-lg shadow fw-bold px-4">{{ $t('cart.checkout_btn') }}</button>
          </div>
          <div v-else>
            <RouterLink to="/login" class="btn btn-warning shadow fw-bold">{{ $t('cart.login_to_order') }}</RouterLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>