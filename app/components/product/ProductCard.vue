<template>
  <v-card class="product-card h-100" hover>
    <!-- Product Image -->
    <div class="position-relative">
      <v-img
        :src="productImage"
        aspect-ratio="1"
        cover
        class="product-image cursor-pointer"
        @click="navigateToDetail"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </template>
      </v-img>

      <!-- Discount Badge -->
      <v-chip
        v-if="discountPercent > 0"
        color="error"
        size="small"
        class="discount-badge"
      >
        -{{ discountPercent }}%
      </v-chip>

      <!-- Wishlist Button -->
      <v-btn
        icon
        size="small"
        variant="flat"
        color="white"
        class="wishlist-btn"
        @click.stop="toggleWishlist"
      >
        <v-icon :color="isWishlisted ? 'error' : 'grey'">
          {{ isWishlisted ? "mdi-heart" : "mdi-heart-outline" }}
        </v-icon>
      </v-btn>
    </div>

    <!-- Product Info -->
    <v-card-text class="pa-4">
      <p class="text-caption text-grey mb-1">
        {{ product?.category?.name || "Category" }}
      </p>
      <h3
        class="text-subtitle-1 font-weight-bold mb-2 product-title cursor-pointer text-decoration-underline-hover"
        @click="navigateToDetail"
      >
        {{ product?.name }}
      </h3>

      <!-- Pricing -->
      <div class="d-flex align-center ga-2 mb-3">
        <span class="text-h6 font-weight-bold text-primary">
          ₹{{ displayPrice.toLocaleString() }}
        </span>
        <span
          v-if="originalPrice > displayPrice"
          class="text-body-2 text-grey text-decoration-line-through"
        >
          ₹{{ originalPrice.toLocaleString() }}
        </span>
      </div>

      <!-- Add to Cart -->
      <v-btn
        block
        color="primary"
        :loading="addingToCart"
        @click="handleAddToCart"
      >
        <v-icon start>mdi-cart-plus</v-icon>
        Add to Cart
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useWishlistStore } from "~/stores/wishlist";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

interface Product {
  id: number;
  name: string;
  imagepath1?: string;
  category?: { name: string };
  product_prices?: Array<{
    price: number;
    offer_price?: number;
    distributor_price?: number;
    distributor_offer_price?: number;
    pack?: string;
  }>;
}

const props = defineProps<{
  product: Product;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const router = useRouter();

const addingToCart = ref(false);
const isWishlisted = computed(() => {
  return props.product?.id ? wishlistStore.wishlistIds.has(props.product.id) : false;
});

// Get runtime config for image URL
const config = useRuntimeConfig();

// Computed
const productImage = computed(() => {
  const imagePath = props.product?.imagepath1;
  if (!imagePath) {
    return "https://via.placeholder.com/300x300?text=No+Image";
  }
  if (imagePath.startsWith("http")) return imagePath;

  // Use configured mediaBase
  const mediaBase = config.public.mediaBase as string;
  return `${mediaBase}${imagePath}`;
});

const priceInfo = computed(() => {
  const prices = props.product?.product_prices;
  if (!prices || prices.length === 0) {
    return { price: 0, offerPrice: 0 };
  }

  const priceObj = prices[0];
  if (!priceObj) {
    return { price: 0, offerPrice: 0 };
  }

  // Distributor pricing
  if (authStore.isDistributor) {
    return {
      price: priceObj.distributor_price || priceObj.price,
      offerPrice: priceObj.distributor_offer_price || priceObj.offer_price || 0,
    };
  }

  // Regular user pricing
  return {
    price: priceObj.price || 0,
    offerPrice: priceObj.offer_price || 0,
  };
});

const displayPrice = computed(() => {
  const { price, offerPrice } = priceInfo.value;
  return offerPrice > 0 && offerPrice < price ? offerPrice : price;
});

const originalPrice = computed(() => priceInfo.value.price);

const discountPercent = computed(() => {
  const { price, offerPrice } = priceInfo.value;
  if (price > 0 && offerPrice > 0 && offerPrice < price) {
    return Math.round(((price - offerPrice) / price) * 100);
  }
  return 0;
});

// Methods
const handleAddToCart = async () => {
  if (!props.product) return;
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }

  addingToCart.value = true;
  const priceObj = props.product.product_prices?.[0];
  const pack = priceObj?.product_pack_id?.toString() || priceObj?.pack || "default";

  await cartStore.addToCart(props.product.id, pack, 1, displayPrice.value);
  addingToCart.value = false;
};

const toggleWishlist = async () => {
  if (!props.product) return;
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }
  await wishlistStore.toggleWishlist(props.product.id);
};

const navigateToDetail = () => {
  if (props.product?.id) {
    router.push(`/products/${props.product.id}`);
  }
};
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  border-bottom: 1px solid #f0f0f0;
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
}
</style>
