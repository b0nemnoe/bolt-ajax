<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-6 card p-4 shadow">
      <h2 class="text-center mb-4">{{ isLogin ? 'Bejelentkezés' : 'Regisztráció' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Email cím</label>
          <input type="email" class="form-control" v-model="email" required>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Jelszó</label>
          <input type="password" class="form-control" v-model="password" required>
        </div>

        <button class="btn btn-primary w-100 mb-3">
          {{ isLogin ? 'Belépés' : 'Regisztráció' }}
        </button>
      </form>

      <div class="text-center">
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? 'Nincs még fiókod? Regisztrálj!' : 'Már van fiókod? Jelentkezz be!' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBotStore } from '@/stores/bot'

const botStore = useBotStore()
const isLogin = ref(true) // Váltókapcsoló: Login vagy Register mód
const email = ref('')
const password = ref('')

const handleSubmit = () => {
  if (isLogin.value) {
    botStore.login(email.value, password.value)
  } else {
    botStore.register(email.value, password.value)
  }
}
</script>