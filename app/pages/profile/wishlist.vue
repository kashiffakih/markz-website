<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold mb-0">My Wishlist</h2>
      <v-btn
        v-if="wishlistItems.filter(i => i.product).length > 0"
        color="secondary"
        prepend-icon="mdi-cart-plus"
        :loading="addingAllToCart"
        @click="addAllToCart"
      >
        Add All to Cart
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="wishlistItems.filter(i => i.product).length === 0"
      class="pa-8 text-center"
      flat
    >
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-heart-broken
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">Your wishlist is empty</h3>
      <p class="text-grey mb-4">Save items you love for later</p>
      <v-btn color="primary" to="/products">Explore Products</v-btn>
    </v-card>

    <!-- Wishlist Grid -->
    <v-row v-else>
      <v-col
        v-for="item in wishlistItems.filter(i => i.product)"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
      >
        <ProductCard :product="item.product" />
        <v-btn
          variant="text"
          color="error"
          block
          class="mt-2"
          prepend-icon="mdi-delete"
          @click="removeFromWishlist(item.product_id || item.product?.id)"
        >
          Remove
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { ref, onMounted, inject } from "vue";

const loading = ref(true);
const addingAllToCart = ref(false);
const wishlistItems = ref<any[]>([]);
const cartStore = useCartStore();
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

const fetchWishlist = async () => {
  const authStore = useAuthStore();
  if (!authStore.user) return;

  loading.value = true;
  const api = useApi();

  try {
    // Mobile app: GET /wishlists?userId=...&productId= (empty for list)
    const response: any = await api.get("/wishlists", {
      userId: authStore.user.id,
      productId: "",
    });

    const payload = response.data || response;

    if (payload && Array.isArray(payload)) {
      wishlistItems.value = payload;
    } else if (response.success && response.data) {
      wishlistItems.value = response.data;
    }
  } catch (e) {
    console.error(e);
  }

  loading.value = false;
};

const removeFromWishlist = async (productId: number) => {
  const authStore = useAuthStore();
  if (!authStore.user || !productId) return;

  const api = useApi();

  // Mobile app: GET /wishlists?userId=...&productId=... (Toggles/Removes)
  const response: any = await api.get("/wishlists", {
    userId: authStore.user.id,
    productId: productId,
  });

  const payload = response.data || response;

  if (response.success || (payload && Array.isArray(payload))) {
    showSnackbar("Updated wishlist", "success");
    if (payload && Array.isArray(payload)) {
      wishlistItems.value = payload;
    } else if (response.data && Array.isArray(response.data)) {
      wishlistItems.value = response.data;
    } else {
      await fetchWishlist(); // Fallback
    }
  }
};

const addAllToCart = async () => {
  const authStore = useAuthStore();
  if (!authStore.user) return;

  addingAllToCart.value = true;
  const api = useApi();

  try {
    // Mobile app: GET /wishlist_to_all_add_to_cart?userId=$userId&type=true&role=$activeRole
    const response: any = await api.get("/wishlist_to_all_add_to_cart", {
      userId: authStore.user.id,
      type: "true",
      role: authStore.activeRole,
    });

    if (response.success) {
      showSnackbar("All items added to cart!", "success");
      // Refresh the cart store so that the navbar cart count updates instantly!
      await cartStore.fetchCart();
    } else {
      showSnackbar(response.message || "Failed to add items to cart", "error");
    }
  } catch (e) {
    console.error("Wishlist to cart error:", e);
    showSnackbar("Failed to add items to cart", "error");
  } finally {
    addingAllToCart.value = false;
  }
};

onMounted(() => {
  fetchWishlist();
});
</script>
