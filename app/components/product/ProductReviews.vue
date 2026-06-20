<template>
  <div class="product-reviews mt-8">
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">Customer Reviews</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="text-center py-8 bg-grey-lighten-4 rounded-lg">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-comment-outline</v-icon>
      <div class="text-h6 text-grey-darken-1 mb-2">No reviews yet</div>
      <div class="text-body-2 text-grey">Be the first to review this product!</div>
    </div>

    <!-- Reviews List -->
    <div v-else class="reviews-list">
      <v-card 
        v-for="review in reviews" 
        :key="review.id" 
        variant="outlined" 
        class="mb-4 pa-4"
      >
        <div class="d-flex justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-avatar color="primary-lighten-4" size="40" class="mr-3">
              <span class="text-primary font-weight-bold">
                {{ review.user?.first_name?.charAt(0)?.toUpperCase() || 'U' }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ review.user?.first_name ? `${review.user.first_name} ${review.user.last_name || ''}`.trim() : 'Anonymous' }}</div>
              <div class="text-caption text-grey">{{ formatDate(review.created_at) }}</div>
            </div>
          </div>
          <v-rating
            :model-value="parseFloat(review.rating)"
            readonly
            density="compact"
            size="small"
            color="warning"
            half-increments
          ></v-rating>
        </div>
        
        <div class="text-body-1 mt-2">{{ review.description }}</div>

        <!-- Review Images -->
        <div v-if="review.review_images && review.review_images.length > 0" class="d-flex gap-2 mt-4 overflow-x-auto">
          <v-card
            v-for="(img, idx) in review.review_images"
            :key="idx"
            class="mr-2 rounded"
            height="80"
            width="80"
            flat
            border
          >
            <v-img :src="getImageUrl(img.image_path)" cover height="100%"></v-img>
          </v-card>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  productId: {
    type: [Number, String],
    required: true
  },
  packId: {
    type: [Number, String],
    required: false,
    default: ''
  }
})

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()
const showSnackbar = inject<any>('showSnackbar')

const loading = ref(true)
const reviews = ref<any[]>([])

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${config.public.mediaBase}${path}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}

const fetchReviews = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('productId', props.productId.toString())
    if (props.packId) {
      formData.append('product_pack_id', props.packId.toString())
    }
    formData.append('isOnlyFetch', '1')

    const api = useApi()
    const response: any = await api.post('/review', formData)

    if (response.success) {
      reviews.value = response.data || []
    }
  } catch (e) {
    console.error('Error fetching reviews:', e)
  } finally {
    loading.value = false
  }
}

// Re-fetch when pack changes if necessary (mobile app passes it)
watch(() => props.packId, () => {
  fetchReviews()
})

onMounted(() => {
  fetchReviews()
})
</script>
