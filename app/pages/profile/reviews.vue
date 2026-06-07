<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-6">My Reviews</h2>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="reviews.length === 0"
      class="pa-8 text-center"
      flat
      rounded="xl"
    >
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-comment-quote-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No reviews written</h3>
      <p class="text-grey mb-4">You have not posted any reviews yet.</p>
      <v-btn color="primary" to="/profile/orders" class="rounded-lg font-weight-bold">
        Review from Orders
      </v-btn>
    </v-card>

    <!-- Reviews List -->
    <div v-else class="d-flex flex-column ga-4">
      <v-card
        v-for="review in reviews"
        :key="review.id"
        rounded="xl"
        variant="flat"
        class="border-thin pa-4 bg-white"
        elevation="2"
      >
        <v-row>
          <!-- Product Meta Info -->
          <v-col cols="12" sm="3" class="d-flex flex-column align-center text-center">
            <v-avatar
              rounded="lg"
              size="100"
              class="bg-grey-lighten-4 mb-2 border-thin"
              style="cursor: pointer;"
              @click="goToProduct(review.product)"
            >
              <v-img
                :src="resolvedImageUrl(review.product?.imagepath1 || (review.product?.product_images && review.product.product_images[0]?.image_path))"
                cover
              />
            </v-avatar>
            <div class="font-weight-bold text-subtitle-2 text-truncate w-100 px-1" style="max-width: 160px;">
              {{ review.product?.name || 'Product' }}
            </div>
            <v-chip size="x-small" color="secondary" variant="tonal" class="mt-1" v-if="review.product_pack?.value">
              Pack: {{ review.product_pack.value }}
            </v-chip>
          </v-col>

          <!-- Review Detail Info -->
          <v-col cols="12" sm="9" class="d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex align-center">
                  <v-rating
                    :model-value="parseFloat(review.rating)"
                    readonly
                    density="compact"
                    size="small"
                    color="warning"
                    half-increments
                  ></v-rating>
                  <span class="text-caption text-grey ml-2">{{ formatDate(review.created_at) }}</span>
                </div>

                <!-- Edit Button with dynamic 30 days check -->
                <v-btn
                  size="small"
                  :color="isEditable(review.created_at) ? 'primary' : 'grey-darken-1'"
                  :variant="isEditable(review.created_at) ? 'outlined' : 'text'"
                  prepend-icon="mdi-pencil-outline"
                  class="rounded-lg font-weight-bold text-none"
                  @click="handleEditClick(review)"
                >
                  Edit
                </v-btn>
              </div>

              <div class="text-body-2 bg-grey-lighten-5 pa-3 rounded-lg text-grey-darken-3 position-relative">
                <v-icon color="grey-lighten-2" class="position-absolute" style="top: 4px; left: 4px; font-size: 24px; opacity: 0.5;">mdi-format-quote-open</v-icon>
                <div class="pl-4 pt-1">{{ review.description || 'No description provided.' }}</div>
              </div>

              <!-- Attachments if any -->
              <div v-if="review.review_images && review.review_images.length > 0" class="d-flex ga-2 mt-3 overflow-x-auto">
                <v-avatar
                  v-for="(img, idx) in review.review_images"
                  :key="idx"
                  rounded="lg"
                  size="60"
                  class="bg-grey-lighten-4 border-thin"
                  style="cursor: zoom-in;"
                  @click="zoomImage(img.image_path)"
                >
                  <v-img :src="resolvedImageUrl(img.image_path)" cover />
                </v-avatar>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Zoom Image Dialog -->
    <v-dialog v-model="zoomDialog" max-width="600">
      <v-card rounded="xl" class="pa-2 bg-black text-center position-relative">
        <v-btn
          icon="mdi-close"
          variant="flat"
          color="white"
          density="comfortable"
          class="position-absolute"
          style="top: 10px; right: 10px; z-index: 10;"
          @click="zoomDialog = false"
        ></v-btn>
        <v-img :src="zoomImageUrl" max-height="80vh" contain></v-img>
      </v-card>
    </v-dialog>

    <!-- Expired Warning Dialog -->
    <v-dialog v-model="expiredDialog" max-width="400">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-warning d-flex align-center ga-2 px-0 pt-0">
          <v-icon color="warning">mdi-clock-alert-outline</v-icon>
          Update Not Allowed
        </v-card-title>
        <v-card-text class="pa-0 pt-2 text-body-2 text-grey-darken-2">
          Reviews can only be updated within 30 days of posting. This matches our customer protection policies.
        </v-card-text>
        <v-card-actions class="justify-end px-0 pb-0 pt-4">
          <v-btn
            color="primary"
            variant="flat"
            class="rounded-lg font-weight-bold"
            @click="expiredDialog = false"
          >
            Got It
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Review Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 bg-grey-lighten-4">
          <span class="text-h6 font-weight-bold text-secondary">
            Update Review
          </span>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="editDialog = false"></v-btn>
        </v-card-title>
        
        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <v-avatar
              rounded="lg"
              size="80"
              class="bg-grey-lighten-4 mb-3 border-thin"
            >
              <v-img
                :src="resolvedImageUrl(selectedReview?.product?.imagepath1 || (selectedReview?.product?.product_images && selectedReview.product.product_images[0]?.image_path))"
                cover
              />
            </v-avatar>
            <h4 class="font-weight-bold text-subtitle-1 text-grey-darken-4">
              {{ selectedReview?.product?.name }}
            </h4>
            <v-chip size="x-small" color="secondary" variant="tonal" class="mt-1" v-if="selectedReview?.product_pack?.value">
              Pack: {{ selectedReview.product_pack.value }}
            </v-chip>
          </div>

          <div class="text-center mb-4">
            <div class="text-body-2 font-weight-medium mb-1">Your Rating</div>
            <v-rating
              v-model="editForm.rating"
              color="warning"
              hover
              size="large"
            ></v-rating>
          </div>

          <v-textarea
            v-model="editForm.description"
            label="Your Review Description"
            variant="outlined"
            placeholder="Tell us what you liked or disliked..."
            rows="4"
            auto-grow
            class="mb-4"
          ></v-textarea>

          <!-- Multiple Attachment Input -->
          <div class="mb-4">
            <div class="text-caption font-weight-bold text-grey-darken-1 mb-2">Upload Product Images (Optional)</div>
            <v-file-input
              v-model="uploadedFiles"
              label="Select Images"
              variant="outlined"
              density="compact"
              accept="image/*"
              multiple
              prepend-icon="mdi-camera-outline"
              chips
              show-size
            ></v-file-input>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="rounded-lg font-weight-bold" @click="editDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="updating"
            :disabled="!isFormValid"
            @click="submitUpdate"
            class="rounded-lg font-weight-bold px-6"
          >
            Post Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const config = useRuntimeConfig();
const showSnackbar = inject<any>("showSnackbar");

const loading = ref(true);
const reviews = ref<any[]>([]);

// Edit Dialog states
const editDialog = ref(false);
const expiredDialog = ref(false);
const updating = ref(false);
const selectedReview = ref<any>(null);
const uploadedFiles = ref<File[]>([]);

const editForm = reactive({
  rating: 0,
  description: "",
});

// Zoom Dialog states
const zoomDialog = ref(false);
const zoomImageUrl = ref("");

const isFormValid = computed(() => {
  return editForm.rating > 0 && editForm.description.trim().length > 0;
});

const resolvedImageUrl = (path: string | undefined) => {
  if (!path) return "https://via.placeholder.com/100?text=No+Image";
  if (path.startsWith("http")) return path;
  const mediaBase = config.public.mediaBase as string;
  return `${mediaBase}${path}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isEditable = (dateStr: string) => {
  if (!dateStr) return false;
  const createdDate = new Date(dateStr);
  const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

const handleEditClick = (review: any) => {
  if (!isEditable(review.created_at)) {
    expiredDialog.value = true;
    return;
  }
  selectedReview.value = review;
  editForm.rating = parseFloat(review.rating);
  editForm.description = review.description || "";
  uploadedFiles.value = [];
  editDialog.value = true;
};

const zoomImage = (path: string) => {
  zoomImageUrl.value = resolvedImageUrl(path);
  zoomDialog.value = true;
};

const goToProduct = (product: any) => {
  if (product && product.id) {
    router.push(`/products/${product.id}`);
  }
};

const fetchReviews = async () => {
  loading.value = true;
  try {
    const api = useApi();
    const response: any = await api.post("/review", {
      userId: authStore.user?.id,
      isOnlyFetch: 1,
    });
    const payload = response.data || response;
    if (payload.success) {
      reviews.value = payload.data || [];
    }
  } catch (e) {
    console.error("Error fetching user reviews:", e);
  } finally {
    loading.value = false;
  }
};

const submitUpdate = async () => {
  if (!selectedReview.value) return;

  updating.value = true;
  try {
    const formData = new FormData();
    formData.append("userId", authStore.user!.id.toString());
    formData.append("productId", selectedReview.value.product_id.toString());
    if (selectedReview.value.product_pack_id) {
      formData.append("product_pack_id", selectedReview.value.product_pack_id.toString());
    }
    formData.append("rating", editForm.rating.toString());
    formData.append("description", editForm.description);

    // Append attachments for image updates
    if (uploadedFiles.value && uploadedFiles.value.length > 0) {
      uploadedFiles.value.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const api = useApi();
    const response: any = await api.post("/review", formData);

    const payload = response.data || response;
    if (payload.success) {
      showSnackbar("Review updated successfully!", "success");
      editDialog.value = false;
      await fetchReviews();
    } else {
      showSnackbar(payload.message || "Failed to update review.", "error");
    }
  } catch (e: any) {
    console.error("Error updating review:", e);
    showSnackbar(e.message || "An error occurred during submission.", "error");
  } finally {
    updating.value = false;
  }
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }
  fetchReviews();
});
</script>

<style scoped>
.bg-background {
  background-color: #fffdf5 !important;
}
.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
.border-dashed {
  border-style: dashed !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
</style>
