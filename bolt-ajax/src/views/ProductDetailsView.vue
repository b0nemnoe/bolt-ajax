<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink } from 'vue-router'
import { BACKEND_URL } from '@/utils/axios.js'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useUserStore } from '@/stores/user.js'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const newRating = ref(5)
const newComment = ref('')
const editingReviewId = ref(null)
const { t } = useI18n()

const loadProduct = (id) => {
  productStore.fetchProductById(id)
}

onMounted(() => {
  loadProduct(route.params.id)
})

watch(() => route.params.id, (newId) => {
  loadProduct(newId)
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const getImageUrl = (imageName) => {
  if (!imageName) return 'https://placehold.co/600x400?text=Nincs+kép'
  if (imageName.startsWith('http')) return imageName
  return `${BACKEND_URL}/uploads/${imageName}`
}

const isInWishlist = (id) => {
    return userStore.wishlist.some(p => (p._id == id || p.id == id))
}

//  REVIEW LOGIC

const startEdit = (review) => {
  editingReviewId.value = review._id
  newRating.value = review.rating
  newComment.value = review.comment
  const formElement = document.getElementById('review-form')
  if(formElement) formElement.scrollIntoView({ behavior: 'smooth' })
}

const cancelEdit = () => {
  editingReviewId.value = null
  newRating.value = 5
  newComment.value = ''
}

const submitReview = async () => {
  const productId = productStore.currentProduct.id || productStore.currentProduct._id
  
  if (editingReviewId.value) {
    await productStore.updateReview(editingReviewId.value, {
      rating: newRating.value,
      comment: newComment.value
    })
    cancelEdit()
  } else {
    await productStore.addReview({
      productId: productId,
      rating: newRating.value,
      comment: newComment.value
    })
    newComment.value = ''
    newRating.value = 5
  }
}

const confirmDelete = (reviewId) => {
  if (confirm(t('productDetails.confirm_delete'))) {
    productStore.deleteReview(reviewId)
    if (editingReviewId.value === reviewId) cancelEdit()
  }
}

const relatedProducts = computed(() => {
  if (!productStore.currentProduct || !productStore.products.length) return []
  
  return productStore.products
    .filter(p => 
      p.category === productStore.currentProduct.category && 
      p.id !== productStore.currentProduct.id
    )
    .slice(0, 4)
})

</script>

<template>
  <div class="container mt-5"> 
    <div v-if="productStore.isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">{{ $t('productDetails.loading') }}</p>
    </div>

    <div v-else-if="productStore.currentProduct" class="row g-5">
      
      <div class="col-md-6">
        <div class="card shadow-sm border-0 overflow-hidden">
          <img 
            :src="getImageUrl(productStore.currentProduct.image)" 
            class="img-fluid w-100" 
            style="object-fit: cover; max-height: 500px;"
            alt="Termék kép"
          >
        </div>
      </div>

      <div class="col-md-6 d-flex flex-column justify-content-center">
        <h1 class="display-5 fw-bold mb-3">{{ productStore.currentProduct.name }}</h1>
        
        <p class="lead text-muted mb-4">
          {{ productStore.currentProduct.desc }}
        </p>
        
        <h2 class="text-primary fw-bold mb-4">
          {{ productStore.currentProduct.price }} Ft 
          <span class="text-muted fs-5 fw-normal">/ {{ productStore.currentProduct.unit }}</span>
        </h2>

        <div class="d-flex align-items-center mb-4">
            <span class="badge p-2 fs-6" :class="productStore.currentProduct.store > 0 ? 'bg-success' : 'bg-danger'">
                {{ productStore.currentProduct.store > 0 ? $t('productDetails.in_stock') : $t('productDetails.out_of_stock') }}
            </span>
            <span v-if="productStore.currentProduct.store > 0" class="ms-3 text-muted">
                ({{ productStore.currentProduct.store }} {{ $t('productDetails.available') }})
            </span>
        </div>

        <div class="d-grid gap-2">
          <div class="d-flex gap-2">
            <button 
              :disabled="productStore.currentProduct.store === 0" 
              @click="cartStore.addToCart(productStore.currentProduct.id)" 
              class="btn btn-primary btn-lg flex-grow-1"
            >
              {{ $t('productDetails.add_to_cart') }}
            </button>

            <button 
              @click="userStore.toggleWishlist(productStore.currentProduct.id)" 
              class="btn btn-outline-danger btn-lg"
              :title="$t('productDetails.add_to_wishlist')"
            >
               <v-icon 
                  :name="isInWishlist(productStore.currentProduct.id) ? 'bi-heart-fill' : 'bi-heart'" 
                  scale="1.5"
              />
            </button>
          </div>
          
          <RouterLink to="/" class="btn btn-outline-secondary">
            {{ $t('productDetails.back_to_products') }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="relatedProducts.length > 0" class="mt-5">
      <h3 class="mb-4">{{ $t('productDetails.related_products') }}</h3>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div class="col" v-for="rp in relatedProducts" :key="rp.id || rp._id">
          <div class="card h-100 shadow-sm border-0 product-card">
            <RouterLink :to="{ name: 'product-details', params: { id: rp.id || rp._id } }" class="text-decoration-none text-dark">
                <img :src="getImageUrl(rp.image)" class="card-img-top" style="height: 150px; object-fit: cover;">
                <div class="card-body">
                  <h6 class="card-title text-truncate">{{ rp.name }}</h6>
                  <p class="card-text text-primary fw-bold">{{ rp.price }} Ft</p>
                </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-5">

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h3 class="mb-4">{{ $t('productDetails.reviews') }} ({{ productStore.reviews.length }})</h3>

        <div v-if="userStore.token" id="review-form" class="card mb-4 shadow-sm" :class="{'border-primary': editingReviewId}">
          <div class="card-body">
            
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">
                    {{ editingReviewId ? $t('productDetails.edit_review') : $t('productDetails.write_review') }}
                </h5>
                <button v-if="editingReviewId" @click="cancelEdit" class="btn btn-sm btn-secondary">
                    {{ $t('productDetails.cancel') }}
                </button>
            </div>

            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label class="form-label me-2">{{ $t('productDetails.rating') }}</label>
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
                <textarea v-model="newComment" class="form-control" rows="3" :placeholder="$t('productDetails.review_placeholder')" required></textarea>
              </div>

              <button type="submit" class="btn" :class="editingReviewId ? 'btn-success' : 'btn-primary'">
                  {{ editingReviewId ? $t('productDetails.save') : $t('productDetails.send') }}
              </button>
            </form>
          </div>
        </div>
        
        <div v-else class="alert alert-secondary text-center">
          <router-link to="/login">{{ $t('productDetails.login') }}</router-link> {{ $t('productDetails.login_to_review') }}
        </div>

        <div v-if="productStore.reviews.length === 0" class="text-muted text-center my-4">
          {{ $t('productDetails.no_reviews') }}
        </div>

        <div v-else class="list-group list-group-flush">
          <div v-for="review in productStore.reviews" :key="review._id" class="list-group-item p-4 border rounded mb-3 bg-light">
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
                  <strong>{{ review.user?.email?.split('@')[0] || $t('productDetails.unknown_user') }}</strong> 
                  &bull; {{ new Date(review.date).toLocaleDateString() }}
                </small>
              </div>

              <div v-if="userStore.user && (userStore.user.id === review.user?._id || userStore.user.id === review.user || userStore.user.isAdmin)">
                
                <button 
                    v-if="userStore.user.id === review.user?._id || userStore.user.id === review.user"
                    @click="startEdit(review)" 
                    class="btn btn-sm btn-outline-primary border-0 me-1"
                    :title="$t('productDetails.edit')"
                >
                    <v-icon name="bi-pencil" />
                </button>

                <button 
                    @click="confirmDelete(review._id)" 
                    class="btn btn-sm btn-outline-danger border-0"
                    :title="$t('productDetails.delete')"
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