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

      <div v-show="isLogin">
        <div class="d-flex align-items-center my-3">
          <hr class="flex-grow-1">
          <span class="mx-2 text-muted small">{{ $t('login.or') }}</span>
          <hr class="flex-grow-1">
        </div>

        <div class="d-grid gap-2 mb-4">
          <div>
            <GoogleLogin :callback="handleGoogleCallback" />
          </div>
          <button type="button" class="btn text-white fw-bold d-flex align-items-center justify-content-center" style="background-color: #1877F2;" @click="handleFacebookLogin">
            <v-icon name="bi-facebook" scale="1.2" class="me-2"/>
            {{ $t('login.login_facebook') }}
          </button>
        </div>
      </div>

      <div class="text-center mt-3">
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? $t('login.no_account') : $t('login.has_account') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const handleGoogleCallback = (response) => {
  if (response.credential) {
    userStore.loginWithGoogle(response.credential)
  }
}

onMounted(() => {
  // Betöltjük a Facebook SDK-t aszinkron módon, ha még nincs betöltve
  if (!window.FB) {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : import.meta.env.VITE_FACEBOOK_APP_ID || 'MOCK_APP_ID',
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
    };
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if (fjs && fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       } else {
         d.head.appendChild(js);
       }
     }(document, 'script', 'facebook-jssdk'));
  }
})

const handleFacebookLogin = () => {
  if (!window.FB) {
    console.error("A Facebook SDK még nem töltött be.");
    return;
  }
  window.FB.login((response) => {
    if (response.authResponse) {
      userStore.loginWithFacebook(response.authResponse.accessToken)
    } else {
      console.log("A felhasználó megszakította a Facebook bejelentkezést.");
    }
  }, {scope: 'public_profile,email'});
}
</script>