<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-5 card p-4 shadow">
      <h3 class="text-center mb-4">Elfelejtett jelszó 🔑</h3>
      <p class="text-muted text-center mb-4">Add meg az e-mail címed, és küldünk egy linket a visszaállításhoz.</p>
      
      <form @submit.prevent="sendEmail">
        <div class="mb-3">
          <label class="form-label">Email cím</label>
          <input type="email" class="form-control" v-model="email" required placeholder="pelda@email.com">
        </div>
        <button class="btn btn-primary w-100">Link küldése 📨</button>
      </form>
      
      <div class="text-center mt-3">
        <router-link to="/login">Vissza a belépéshez</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()
const email = ref('')

const sendEmail = () => {
    userStore.forgotPassword(email.value)
}
</script>