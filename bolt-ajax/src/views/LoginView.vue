<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-6 card p-4 shadow">
      <h2 class="text-center mb-4">{{ isLogin ? $t('login.title_login') : $t('login.title_register') }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">{{ $t('login.email') }}</label>
          <input type="email" class="form-control" v-model="email" required>
        </div>
        
        <div class="mb-3">
          <label class="form-label">{{ $t('login.password') }}</label>
          <input type="password" class="form-control" v-model="password" required>
        </div>

        <button class="btn btn-primary w-100 mb-3">
          {{ isLogin ? $t('login.btn_login') : $t('login.btn_register') }}
        </button>
        <div class="mb-3 text-end" v-if="isLogin">
            <router-link to="/forgot-password" class="small text-decoration-none">{{ $t('login.forgot_pass') }}</router-link>
        </div>
      </form>

      <div class="text-center">
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? $t('login.no_account') : $t('login.has_account') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()
const isLogin = ref(true)
const email = ref('')
const password = ref('')

const handleSubmit = () => {
  if (isLogin.value) {
    userStore.login(email.value, password.value)
  } else {
    userStore.register(email.value, password.value)
  }
}
</script>