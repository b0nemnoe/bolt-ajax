<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBotStore } from '@/stores/bot.js'
import { BACKEND_URL } from '@/stores/bot.js'

const isInWishlist = (id) => {
    return botStore.wishlist && botStore.wishlist.some(p => (p._id == id || p.id == id))
}

const route = useRoute()
const botStore = useBotStore()

const newRating = ref(5)
const newComment = ref('')
const editingReviewId = ref(null)

onMounted(() => {
  const productId = route.params.id
  botStore.fetchProductById(productId)
})

const startEdit = (review) => {
  editingReviewId.value = review._id
  newRating.value = review.rating
  newComment.value = review.comment
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingReviewId.value = null
  newRating.value = 5
  newComment.value = ''
}

const submitReview = async () => {
  if (editingReviewId.value) {
    await botStore.updateReview(editingReviewId.value, {
      rating: newRating.value,
      comment: newComment.value
    })
    cancelEdit()
  } else {
    await botStore.addReview({
      productId: botStore.currentProduct.id || botStore.currentProduct._id,
      rating: newRating.value,
      comment: newComment.value
    })
    newComment.value = ''
    newRating.value = 5
  }
}

const confirmDelete = (reviewId) => {
  if (confirm("Biztosan törölni szeretnéd ezt az értékelést? 🗑️")) {
    botStore.deleteReview(reviewId)
    if (editingReviewId.value === reviewId) cancelEdit()
  }
}

const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/600x400?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}
</script>

<template>
  <div class="container mt-5">
    
    <div v-if="botStore.isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Termék betöltése...</p>
    </div>

    <div v-else-if="botStore.currentProduct" class="row g-5">
      
      <div class="col-md-6">
        <div class="card shadow-sm border-0 overflow-hidden">
          <img 
            :src="getImageUrl(botStore.currentProduct.image)" 
            class="img-fluid w-100" 
            style="object-fit: cover; max-height: 500px;"
            alt="Termék kép"
          >
        </div>
      </div>


      <div class="col-md-6 d-flex flex-column justify-content-center">
        <h1 class="display-5 fw-bold mb-3">{{ botStore.currentProduct.name }}</h1>
        
        <p class="lead text-muted mb-4">
          {{ botStore.currentProduct.desc }}
        </p>
        
        <h2 class="text-primary fw-bold mb-4">
          {{ botStore.currentProduct.price }} Ft 
          <span class="text-muted fs-5 fw-normal">/ {{ botStore.currentProduct.unit }}</span>
        </h2>

        <div class="d-flex align-items-center mb-4">
            <span class="badge p-2 fs-6" :class="botStore.currentProduct.store > 0 ? 'bg-success' : 'bg-danger'">
                {{ botStore.currentProduct.store > 0 ? 'Raktáron' : 'Elfogyott' }}
            </span>
            <span v-if="botStore.currentProduct.store > 0" class="ms-3 text-muted">
                ({{ botStore.currentProduct.store }} db elérhető)
            </span>
        </div>

        <div class="d-grid gap-2">
          
          <div class="d-flex gap-2">
            <button 
              :disabled="botStore.currentProduct.store === 0" 
              @click="botStore.addToCart(botStore.currentProduct.id)" 
              class="btn btn-primary btn-lg flex-grow-1"
            >
              Kosárba teszem 🛒
            </button>

            <button 
              @click="botStore.toggleWishlist(botStore.currentProduct.id)" 
              class="btn btn-outline-danger btn-lg"
              title="Kedvencekhez adás"
            >
               <v-icon 
                  :name="isInWishlist(botStore.currentProduct.id) ? 'bi-heart-fill' : 'bi-heart'" 
                  scale="1.5"
              />
            </button>
          </div>
          
          <RouterLink to="/" class="btn btn-outline-secondary">
            ← Vissza a termékekhez
          </RouterLink>
        </div>
      </div>
    </div>

    <hr class="my-5">

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h3 class="mb-4">Értékelések ({{ botStore.reviews.length }})</h3>

        <div v-if="botStore.token" class="card mb-4 shadow-sm">
          <div class="card-body">
            
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">
                    {{ editingReviewId ? 'Vélemény szerkesztése ✏️' : 'Írj véleményt! ✍️' }}
                </h5>
                <button v-if="editingReviewId" @click="cancelEdit" class="btn btn-sm btn-secondary">
                    Mégse
                </button>
            </div>

            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label class="form-label me-2">Értékelés:</label>
                <div class="d-inline-block">
                  <span v-for="star in 5" :key="star" @click="newRating = star" style="cursor: pointer;">
                    <v-icon 
                      :name="star <= newRating ? 'bi-star-fill' : 'bi-star'" 
                      fill="gold" 
                      scale="1.2"
                    />
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <textarea v-model="newComment" class="form-control" rows="3" placeholder="Mi a véleményed a termékről?" required></textarea>
              </div>

              <button type="submit" class="btn" :class="editingReviewId ? 'btn-success' : 'btn-primary'">
                  {{ editingReviewId ? 'Mentés 💾' : 'Küldés 📨' }}
              </button>
            </form>
          </div>
        </div>
        <div v-else class="alert alert-secondary text-center">
          <router-link to="/login">Jelentkezz be</router-link>, hogy értékelést írhass!
        </div>

        <div v-if="botStore.reviews.length === 0" class="text-muted text-center my-4">
          Még nem érkezett értékelés. Legyél te az első!
        </div>

        <div v-else class="list-group list-group-flush">
          <div v-for="review in botStore.reviews" :key="review._id" class="list-group-item p-4 border rounded mb-3 bg-light">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="mb-2">
                  <span v-for="n in 5" :key="n">
                    <v-icon 
                      :name="n <= review.rating ? 'bi-star-fill' : 'bi-star'" 
                      fill="gold" 
                      scale="1" 
                    />
                  </span>
                </div>
                <small class="text-muted">
                  <strong>{{ review.user?.email?.split('@')[0] || 'Ismeretlen' }}</strong> 
                  &bull; {{ new Date(review.date).toLocaleDateString() }}
                </small>
              </div>

              <div v-if="botStore.user && (botStore.user.id === review.user?._id || botStore.user.id === review.user || botStore.user.isAdmin)">
                
                <button 
                    v-if="botStore.user.id === review.user?._id || botStore.user.id === review.user"
                    @click="startEdit(review)" 
                    class="btn btn-sm btn-outline-primary border-0 me-1"
                    title="Szerkesztés"
                >
                    <v-icon name="bi-pencil" />
                </button>

                <button 
                    @click="confirmDelete(review._id)" 
                    class="btn btn-sm btn-outline-danger border-0"
                    title="Törlés"
                >
                    <v-icon name="bi-trash" />
                </button>
              </div>
            </div>
            
            <p class="mt-2 mb-0">{{ review.comment }}</p>
          </div>
        </div>

      </div>
    </div>


  </div>
</template>