<template>
  <div class="container mt-4">
    <h1 class="mb-4">{{ $t('profile.title') }}</h1>
    
    <div class="row">
      <div class="col-lg-4 mb-4">
        
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white fw-bold">
            {{ $t('profile.personal_data') }}
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div class="mb-3">
                <label class="form-label">{{ $t('profile.name') }}</label>
                <input type="text" class="form-control" v-model="profileData.name" :placeholder="$t('profile.name_placeholder')">
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('profile.address') }}</label>
                <textarea class="form-control" v-model="profileData.address" rows="2" :placeholder="$t('profile.address_placeholder')"></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100">{{ $t('profile.save_data') }}</button>
            </form>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-header bg-warning text-dark fw-bold">
            {{ $t('profile.password_change') }}
          </div>
          <div class="card-body">
            <form @submit.prevent="savePassword">
              <div class="mb-3">
                <label class="form-label">{{ $t('profile.current_password') }}</label>
                <input type="password" class="form-control" v-model="passData.currentPassword" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('profile.new_password') }}</label>
                <input type="password" class="form-control" v-model="passData.newPassword" required>
              </div>
              <button type="submit" class="btn btn-warning w-100">{{ $t('profile.save_password') }}</button>
            </form>
          </div>
        </div>

      </div>

      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white fw-bold">
            {{ $t('profile.my_orders') }}
          </div>
          <div class="card-body">
            
            <div v-if="orderStore.myOrders.length === 0" class="alert alert-info m-0">
              {{ $t('profile.no_orders') }}
            </div>

            <div v-else class="accordion" id="ordersAccordion">
              <div v-for="order in orderStore.myOrders" :key="order._id" class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#order-' + order._id">
                    <div class="d-flex w-100 justify-content-between me-3 align-items-center">
                        <span>{{ formatDate(order.date) }}</span>
                        <span>
                            <span class="badge bg-secondary me-2">{{ order.status }}</span>
                            <span class="badge bg-success">{{ order.totalPrice }} Ft</span>
                        </span>
                    </div>
                  </button>
                </h2>
                <div :id="'order-' + order._id" class="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
                  <div class="accordion-body">
                    <ul class="list-group list-group-flush">
                      <li v-for="item in order.items" :key="item.productId" class="list-group-item d-flex justify-content-between align-items-center">
                        {{ item.name }}
                        <span class="badge bg-primary rounded-pill">{{ item.quantity }} {{ $t('profile.pieces') }}</span>
                      </li>
                    </ul>
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
import { onMounted, ref } from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { useOrderStore } from '@/stores/order.js'
import { useUserStore } from '@/stores/user.js'

const orderStore = useOrderStore()
const userStore = useUserStore()

// Lokális state az űrlapokhoz
const profileData = ref({
    name: userStore.user?.name || '',
    address: userStore.user?.address || ''
})

const passData = ref({
    currentPassword: '',
    newPassword: ''
})

onMounted(() => {
  orderStore.fetchOrders()
  // Ha belépéskor még nem volt meg a név/cím, de most betöltődött, frissítsük a mezőket
  if(userStore.user) {
      profileData.value.name = userStore.user.name || ''
      profileData.value.address = userStore.user.address || ''
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('hu-HU')
}

const saveProfile = () => {
    userStore.updateProfile(profileData.value)
}

const savePassword = async () => {
    const success = await userStore.changePassword(passData.value)
    if (success) {
        passData.value.currentPassword = ''
        passData.value.newPassword = ''
    }
}
</script>