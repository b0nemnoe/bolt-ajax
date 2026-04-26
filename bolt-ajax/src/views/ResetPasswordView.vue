<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-5 card p-4 shadow">
      <h3 class="text-center mb-4">{{ $t('password.reset_title') }}</h3>
      
      <form @submit.prevent="reset">
        <div class="mb-3">
          <label class="form-label">{{ $t('password.new_password') }}</label>
          <input type="password" class="form-control" v-model="password" required minlength="6">
        </div>
        <button class="btn btn-success w-100">{{ $t('password.save_password') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

const route = useRoute()
const userStore = useUserStore()
const password = ref('')

const reset = () => {
    userStore.resetPassword(route.params.token, password.value)
}
</script>