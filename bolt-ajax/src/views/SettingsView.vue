<template>
  <div class="settings-view-container">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <h1 class="fw-bold page-title mb-0">⚙️ Beállítások</h1>
    </div>
    
    <div class="row">
      <div class="col-lg-6 mb-4">
        
        <div class="card premium-card h-100">
          <div class="card-body p-4">
            <h4 class="fw-bold mb-4" style="color: #0f172a;">Személyes adatok</h4>
            <form @submit.prevent="saveProfile">
              <div class="mb-4">
                <label class="form-label text-muted fw-semibold">{{ $t('profile.name') }}</label>
                <input type="text" class="form-control premium-input" v-model="profileData.name" :placeholder="$t('profile.name_placeholder')">
              </div>
              <div class="mb-4">
                <label class="form-label text-muted fw-semibold">{{ $t('profile.address') }}</label>
                <textarea class="form-control premium-input" v-model="profileData.address" rows="3" :placeholder="$t('profile.address_placeholder')"></textarea>
              </div>
              <button type="submit" class="btn btn-teal w-100 fw-bold py-2 mt-2">{{ $t('profile.save_data') }}</button>
            </form>
          </div>
        </div>

      </div>

      <div class="col-lg-6 mb-4">
        <div class="card premium-card h-100">
          <div class="card-body p-4">
            <h4 class="fw-bold mb-4" style="color: #0f172a;">{{ $t('profile.password_change') }}</h4>
            <form @submit.prevent="savePassword">
              <div class="mb-4">
                <label class="form-label text-muted fw-semibold">{{ $t('profile.current_password') }}</label>
                <input type="password" class="form-control premium-input" v-model="passData.currentPassword" required>
              </div>
              <div class="mb-4">
                <label class="form-label text-muted fw-semibold">{{ $t('profile.new_password') }}</label>
                <input type="password" class="form-control premium-input" v-model="passData.newPassword" required>
              </div>
              <button type="submit" class="btn btn-dark w-100 fw-bold py-2 mt-2">{{ $t('profile.save_password') }}</button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()

const profileData = ref({
    name: userStore.user?.name || '',
    address: userStore.user?.address || ''
})

const passData = ref({
    currentPassword: '',
    newPassword: ''
})

onMounted(() => {
  if(userStore.user) {
      profileData.value.name = userStore.user.name || ''
      profileData.value.address = userStore.user.address || ''
  }
})

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
.premium-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 15px;
  transition: all 0.2s;
  background-color: #f8fafc;
}
.premium-input:focus {
  background-color: #ffffff;
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  outline: none;
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
.btn-dark {
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}
.btn-dark:hover {
  background-color: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
