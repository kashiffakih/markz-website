<template>
  <v-container class="py-8">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Error State -->
    <div v-else-if="!product" class="text-center py-12">
      <h2 class="text-h4 text-grey">Product not found</h2>
      <v-btn to="/products" color="primary" class="mt-4"
        >Back to Products</v-btn
      >
    </div>

    <!-- Product Details -->
    <div v-else>
      <v-breadcrumbs :items="breadcrumbs" class="px-0 mb-4" />

      <v-row>
        <!-- Left: Images -->
        <v-col cols="12" md="6">
          <v-carousel
            v-model="selectedImageIndex"
            :hide-delimiters="activeCarouselImages.length <= 1"
            :show-arrows="activeCarouselImages.length > 1 ? 'hover' : false"
            hide-delimiter-background
            height="500"
            class="border rounded-lg overflow-hidden mb-4 bg-grey-lighten-4"
          >
            <v-carousel-item
              v-for="(img, idx) in activeCarouselImages"
              :key="idx"
              :src="img.url"
              cover
              aspect-ratio="1"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </template>
            </v-carousel-item>
          </v-carousel>

          <!-- Thumbnails -->
          <v-slide-group show-arrows v-if="thumbnails.length > 1" class="my-4">
            <v-slide-group-item v-for="(img, i) in thumbnails" :key="i">
              <v-card
                :class="[
                  'ma-2 border-2 rounded-lg cursor-pointer transition-all',
                  selectedUnit === img.unitName ? 'border-primary elevation-3' : 'border-grey-lighten-2',
                ]"
                height="80"
                width="80"
                @click="selectImage(img)"
              >
                <v-img
                  :src="img.url"
                  cover
                  height="100%"
                  class="bg-grey-lighten-4"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary" size="20" />
                    </div>
                  </template>
                </v-img>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>

        <!-- Right: Details -->
        <v-col cols="12" md="6">
          <div class="pl-md-8">
            <div class="text-caption text-primary font-weight-bold mb-2">
              {{ product.category?.name || "Category" }}
            </div>

            <h1 class="text-h4 font-weight-bold mb-2">{{ product.name }}</h1>

            <!-- Rating Placeholder -->
            <div class="d-flex align-center mb-4">
              <v-rating
                :model-value="4.5"
                readonly
                half-increments
                density="compact"
                size="small"
                color="warning"
              />
              <span class="text-body-2 text-grey ms-2"
                >({{ product.total_reviews || 0 }} reviews)</span
              >
            </div>

            <!-- Price -->
            <div class="d-flex align-center mb-4" v-if="selectedPack">
              <div class="d-flex align-center">
                <span class="text-h4 font-weight-bold text-secondary"
                  >₹{{ displayPrice }}</span
                >
                <span
                  v-if="originalPrice > displayPrice"
                  class="text-h6 text-grey text-decoration-line-through ms-3"
                  style="font-size: 1.15rem !important;"
                >
                  ₹{{ originalPrice }}
                </span>
                <v-chip
                  v-if="discountPercent > 0"
                  color="primary"
                  size="small"
                  class="ms-3 font-weight-bold"
                >
                  {{ discountPercent }}% OFF
                </v-chip>
              </div>
            </div>

            <!-- Points Display -->
            <div
              v-if="currentPoints > 0"
              class="d-flex align-center mb-6 text-primary font-weight-bold"
            >
              <v-icon icon="mdi-star-four-points" size="small" class="mr-2" />
              Earn {{ currentPoints }} points for this product
            </div>

            <v-divider class="mb-6" />

            <!-- Variants (Packs) -->
            <div v-if="filteredPacks.length > 0" class="mb-6">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-1 font-weight-bold" style="letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.8rem !important; color: var(--secondary);">Select Pack</div>
                <v-btn
                  v-if="product.size_chart_path"
                  variant="text"
                  density="compact"
                  color="accent"
                  prepend-icon="mdi-ruler"
                  style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;"
                  @click="showSizeChart = true"
                >
                  Size Chart
                </v-btn>
              </div>
              <v-chip-group
                :model-value="selectedPack?.id"
                selected-class="text-accent font-weight-bold"
                column
              >
                <v-chip
                  v-for="pack in filteredPacks"
                  :key="pack.id"
                  filter
                  variant="outlined"
                  size="large"
                  :value="pack.id"
                  @click="selectPack(pack)"
                  class="pack-chip"
                  :class="{
                    'active-pack-chip': selectedPack?.id === pack.id,
                  }"
                >
                  {{ pack.value }}
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Stock Status & Actions -->
            <div class="mb-6">
              <!-- Out of Stock -->
              <div v-if="isOutOfStock || (selectedPack?.qty || 0) <= 0">
                <div
                  class="text-error font-weight-bold mb-3 d-flex align-center"
                >
                  <v-icon start icon="mdi-close-circle-outline" />
                  Out of Stock
                </div>
                <div class="d-flex ga-4 align-center">
                  <v-btn
                    color="warning"
                    size="large"
                    prepend-icon="mdi-bell-ring-outline"
                    @click="showNotifyMe = true"
                    class="flex-grow-1 font-weight-bold rounded-lg"
                    height="54"
                    elevation="2"
                  >
                    Notify Me
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    icon
                    @click="toggleWishlist"
                    height="54"
                    width="54"
                    class="rounded-lg border-2"
                  >
                    <v-icon :color="isWishlisted ? 'error' : 'inherit'">
                      {{ isWishlisted ? "mdi-heart" : "mdi-heart-outline" }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    icon
                    @click="shareProduct"
                    height="54"
                    width="54"
                    class="rounded-lg border-2"
                  >
                    <v-icon>mdi-share-variant-outline</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Available -->
              <div v-else>
                <div
                  class="text-success font-weight-bold mb-3 d-flex align-center"
                >
                  <v-icon start icon="mdi-check-circle-outline" />
                  Available in stock ({{ selectedPack?.qty || 0 }})
                </div>

                <div class="d-flex ga-4 align-center mt-2">
                  <!-- Action (Either Quantity or Add) -->
                  <div v-if="currentCartItem" class="d-flex align-center justify-space-between product-quantity-controls px-2 flex-grow-1">
                    <v-btn icon variant="text" :loading="loadingCartAction" @click="decrementQty" class="product-qty-btn" height="42" width="42">
                       <v-icon size="24">mdi-minus</v-icon>
                    </v-btn>
                    <span class="font-weight-bold text-h6 text-secondary" style="min-width: 48px; text-align: center;">{{ currentCartItem.quantity }}</span>
                    <v-btn icon variant="text" :loading="loadingCartAction" @click="incrementQty" :disabled="currentCartItem.quantity >= (selectedPack?.qty || 0)" class="product-qty-btn" height="42" width="42">
                       <v-icon size="24">mdi-plus</v-icon>
                    </v-btn>
                  </div>

                  <v-btn
                    v-else
                    color="secondary"
                    size="large"
                    class="flex-grow-1 font-weight-bold luxury-action-btn"
                    prepend-icon="mdi-cart-plus"
                    @click="initialAddToCart"
                    :loading="loadingCartAction"
                    height="54"
                    flat
                  >
                    Add to Cart
                  </v-btn>

                  <!-- Secondary Actions -->
                  <v-btn
                    variant="outlined"
                    color="secondary"
                    size="large"
                    icon
                    @click="toggleWishlist"
                    height="54"
                    width="54"
                    class="wishlist-btn-round"
                  >
                    <v-icon :color="isWishlisted ? 'error' : 'inherit'">
                      {{ isWishlisted ? "mdi-heart" : "mdi-heart-outline" }}
                    </v-icon>
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    color="secondary"
                    size="large"
                    icon
                    @click="shareProduct"
                    height="54"
                    width="54"
                    class="share-btn-round"
                  >
                    <v-icon>mdi-share-variant-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Detailed Description Component -->
            <ProductDescription :product="product" />
            
            <!-- Product Reviews -->
            <ProductReviews :product-id="product.id" :pack-id="selectedPack?.id || ''" />
          </div>
        </v-col>
      </v-row>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-12">
        <h2 class="text-h5 font-weight-bold mb-6">Add More Items</h2>
        <v-slide-group show-arrows>
          <v-slide-group-item v-for="item in relatedProducts" :key="item.id">
            <div class="ma-2" style="width: 250px">
              <ProductCard :product="item" />
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>

      <!-- Size Chart Dialog -->
      <v-dialog v-model="showSizeChart" max-width="600">
        <v-card>
          <v-toolbar density="compact" color="white">
            <v-toolbar-title>Size Chart</v-toolbar-title>
            <v-spacer />
            <v-btn icon="mdi-close" @click="showSizeChart = false" />
          </v-toolbar>
          <v-img :src="sizeChartUrl" cover />
        </v-card>
      </v-dialog>

      <!-- Notify Me Dialog -->
      <v-dialog v-model="showNotifyMe" max-width="400">
        <v-card>
          <v-card-title class="font-weight-bold"
            >Notify me when available</v-card-title
          >
          <v-card-text>
            <p class="mb-2">How many quantity required?</p>
            <v-text-field
              v-model.number="notifyQty"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              min="1"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showNotifyMe = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="handleNotifyMe"
              :loading="notifying"
              >Submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "~/stores/product";
import { useCartStore } from "~/stores/cart";
import { useAuthStore } from "~/stores/auth";
import { useWishlistStore } from "~/stores/wishlist";
import { ref, computed, onMounted, watch, inject } from "vue";
import ProductDescription from "~/components/product/ProductDescription.vue";
import ProductCard from "~/components/product/ProductCard.vue";
import ProductReviews from "~/components/product/ProductReviews.vue";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const config = useRuntimeConfig();
const showSnackbar = inject<any>("showSnackbar");

const loading = ref(true);
const product = ref<any>(null);
const selectedImageIndex = ref(0);
const showSizeChart = ref(false);
const showNotifyMe = ref(false);
const selectedUnit = ref("");
const selectedPack = ref<any>(null); // New ref for selected pack
const qty = ref(1); // New ref for quantity

// Parsed absolute image urls and metadata
interface ProductImageItem {
  url: string;
  unitName: string;
  raw: any;
}

const allImagesRaw = computed<ProductImageItem[]>(() => {
  if (!product.value) return [];
  const list: ProductImageItem[] = [];
  const mediaBase = config.public.mediaBase as string;
  const getUrl = (path?: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${mediaBase}${path}`;
  };

  if (product.value.product_images && product.value.product_images.length > 0) {
    product.value.product_images.forEach((pi: any) => {
      const uName = pi.unit?.name || "";
      if (pi.imagepath) list.push({ url: getUrl(pi.imagepath), unitName: uName, raw: pi });
      if (pi.imagepath2) list.push({ url: getUrl(pi.imagepath2), unitName: uName, raw: pi });
      if (pi.imagepath3) list.push({ url: getUrl(pi.imagepath3), unitName: uName, raw: pi });
      if (pi.imagepath4) list.push({ url: getUrl(pi.imagepath4), unitName: uName, raw: pi });
    });
  } else {
    const uName = product.value.product_packs?.[0]?.unit?.name || "";
    if (product.value.imagepath1) list.push({ url: getUrl(product.value.imagepath1), unitName: uName, raw: null });
    if (product.value.imagepath2) list.push({ url: getUrl(product.value.imagepath2), unitName: uName, raw: null });
    if (product.value.imagepath3) list.push({ url: getUrl(product.value.imagepath3), unitName: uName, raw: null });
    if (product.value.imagepath4) list.push({ url: getUrl(product.value.imagepath4), unitName: uName, raw: null });
  }
  return list;
});

// Thumbnails for unique units / colours
const thumbnails = computed<ProductImageItem[]>(() => {
  const seenUnits = new Set<string>();
  const list: ProductImageItem[] = [];
  allImagesRaw.value.forEach((img) => {
    if (img.unitName && !seenUnits.has(img.unitName)) {
      seenUnits.add(img.unitName);
      list.push(img);
    }
  });
  if (list.length === 0) {
    return allImagesRaw.value;
  }
  return list;
});

// Active display images filtered by selected unit/colour
const activeCarouselImages = computed<ProductImageItem[]>(() => {
  if (allImagesRaw.value.length === 0) return [];
  if (selectedUnit.value) {
    const filtered = allImagesRaw.value.filter(
      (img) => img.unitName === selectedUnit.value
    );
    if (filtered.length > 0) return filtered;
  }
  return allImagesRaw.value;
});

const filteredPacks = computed(() => {
  if (!product.value?.product_packs) return [];
  if (!selectedUnit.value) return product.value.product_packs;
  return product.value.product_packs.filter(
    (pack: any) => pack.unit?.name === selectedUnit.value,
  );
});

// Initialization logic
const initializeProductState = () => {
  if (thumbnails.value.length > 0) {
    const firstThumb = thumbnails.value[0];
    selectedUnit.value = firstThumb.unitName || "";
  } else if (product.value?.product_packs?.length > 0) {
    // Fallback to first pack's unit
    selectedUnit.value = product.value.product_packs[0].unit?.name || "";
  }
};

// Watch selectedUnit to synchronously select the first pack of the newly chosen color/flavour
watch(selectedUnit, (newUnit) => {
  if (product.value?.product_packs) {
    const packsForUnit = product.value.product_packs.filter(
      (pack: any) => pack.unit?.name === newUnit
    );
    if (packsForUnit.length > 0) {
      selectPack(packsForUnit[0]);
    }
  }
});

// Watch for product data load
watch(
  () => product.value,
  (newVal) => {
    if (newVal) {
      initializeProductState();
    }
  },
  { immediate: true },
);

const selectImage = (image: ProductImageItem) => {
  selectedImageIndex.value = 0; // Reset main carousel slide
  if (image.unitName) {
    selectedUnit.value = image.unitName;
  }
};

const selectPack = (pack: any) => {
  selectedPack.value = pack;
  qty.value = 1;
};

// Price Logic (Correctly uses product_prices linked to active selectedPack)
const priceInfo = computed(() => {
  if (!product.value || !selectedPack.value) return { price: 0, offerPrice: 0 };

  let selectedPackId = selectedPack.value.id;
  let priceObj = null;

  if (product.value.product_prices) {
    priceObj = product.value.product_prices.find(
      (p: any) => p.product_pack_id === selectedPackId,
    );
  }

  if (!priceObj && product.value.product_prices?.length > 0) {
    priceObj = product.value.product_prices[0];
  }

  if (!priceObj) return { price: 0, offerPrice: 0 };

  const isDistributor = authStore.activeRole === "Distributor";
  let price = parseFloat(priceObj.price || "0");
  let offerPrice = parseFloat(priceObj.offer_price || "0");

  if (isDistributor) {
    const dPrice = parseFloat(priceObj.distributor_price || "0");
    const dOffer = parseFloat(priceObj.distributor_offer_price || "0");
    if (dPrice > 0) price = dPrice;
    if (dOffer > 0) offerPrice = dOffer;
  }

  return { price, offerPrice };
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

const isWishlisted = computed(() => {
  if (!product.value) return false;
  return wishlistStore.wishlistIds.has(product.value.id);
});

const breadcrumbs = computed(() => [
  { title: "Home", disabled: false, to: "/" },
  { title: "Products", disabled: false, to: "/products" },
  { title: product.value?.name || "Details", disabled: true, to: "" },
]);

// Current Points & Stock
const currentPoints = computed(() => {
  return selectedPack.value ? selectedPack.value.points : 0;
});

const isOutOfStock = computed(() => {
  return (selectedPack.value?.qty || 0) <= 0;
});

const sizeChartUrl = computed(() => {
  const mediaBase = config.public.mediaBase as string;
  return product.value?.size_chart_path
    ? `${mediaBase}${product.value.size_chart_path}`
    : "";
});

// Related Products
const relatedProducts = computed(() => productStore.categoryWiseProducts || []);

// Initialization
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }
  
  const id = route.params.id;
  if (id) {
    product.value = await productStore.fetchProduct(id as string);
    // Fetch related products if category exists
    if (product.value && product.value.category_id) {
      await productStore.fetchCategoryWiseProducts(
        product.value.category_id,
        product.value.id,
      );
    }
  }
  loading.value = false;
});

// Cart Logic
const currentPackId = computed(() => {
  return selectedPack.value ? selectedPack.value.id.toString() : "default";
});

const currentCartItem = computed(() => {
  if (!product.value) return null;
  return cartStore.items.find(
    (item: any) =>
      item.productId === product.value.id && item.packId == currentPackId.value,
  );
});

const loadingCartAction = ref(false);

const initialAddToCart = async () => {
  await modifyCart(true);
};

const incrementQty = async () => {
  await modifyCart(true);
};

const decrementQty = async () => {
  if (!currentCartItem.value) return;
  await modifyCart(false);
};

const modifyCart = async (isAdd: boolean) => {
  if (!authStore.isLoggedIn) {
    navigateToLogin();
    return;
  }

  // Stock check
  const stock = selectedPack.value?.qty || 0;
  if (stock <= 0) {
    showSnackbar("Item out of stock!");
    return;
  }

  if (isAdd && currentCartItem.value && currentCartItem.value.quantity >= stock) {
    showSnackbar(`Only ${stock} items available in stock!`);
    return;
  }

  loadingCartAction.value = true;
  const color = selectedUnit.value || '';
  const size = selectedPack.value?.value || '';
  await cartStore.modifyCart(product.value.id, currentPackId.value, isAdd, displayPrice.value, color, size);
  loadingCartAction.value = false;
};

const toggleWishlist = async () => {
  if (!authStore.isLoggedIn) {
    navigateToLogin();
    return;
  }
  await wishlistStore.toggleWishlist(product.value.id);
};

const navigateToLogin = () => {
  router.push("/login?redirect=" + route.fullPath);
};

// Notify Me Logic
const notifyQty = ref(1);
const notifying = ref(false);

const handleNotifyMe = async () => {
  if (!authStore.isLoggedIn) {
    showNotifyMe.value = false;
    navigateToLogin();
    return;
  }

  // Validate Qty
  if (notifyQty.value <= 0) {
    showSnackbar("Please enter a valid quantity.");
    return;
  }

  notifying.value = true;
  const packId = selectedPack.value ? selectedPack.value.id : 0; // 0 or fallback if no packs

  const success = await productStore.storeNotification({
    product_id: product.value.id,
    product_pack_id: packId,
    qty: notifyQty.value,
  });

  notifying.value = false;
  showNotifyMe.value = false;

  if (success) {
    showSnackbar("We will notify you when this item is back in stock!");
  } else {
    showSnackbar("Failed to set notification. Please try again.");
  }
};

// Social share action
const shareProduct = async () => {
  const shareData = {
    title: product.value?.name || "Aadab Product",
    text: product.value?.description || `Check out ${product.value?.name || 'this product'} on Aadab!`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showSnackbar("Product link copied to clipboard!");
    }
  } catch (error) {
    console.error("Error sharing product:", error);
    if ((error as any).name !== "AbortError") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showSnackbar("Product link copied to clipboard!");
      } catch (e) {
        console.error("Failed to copy link:", e);
      }
    }
  }
};
</script>

<style scoped>
.v-slide-group__content {
  justify-content: center;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.transition-all:hover {
  transform: scale(1.04);
}
.border-2 {
  border-width: 1.5px !important;
}

/* Luxury Variants Styles */
.pack-chip {
  border-radius: 6px !important;
  border: 1px solid var(--border-color) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  font-family: 'Urbanist', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.02em;
  background-color: #ffffff;
}

.active-pack-chip {
  border-color: var(--accent) !important;
  background-color: rgba(229, 94, 94, 0.06) !important;
  color: var(--accent) !important;
  box-shadow: 0 4px 12px rgba(229, 94, 94, 0.1) !important;
}

/* Action Button Styles */
.luxury-action-btn {
  background: #000000 !important;
  color: #ffffff !important;
  border-radius: 9999px !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  font-size: 0.825rem !important;
  font-weight: 750 !important;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.luxury-action-btn:hover {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  box-shadow: var(--coral-glow) !important;
}

.wishlist-btn-round,
.share-btn-round {
  border-radius: 50% !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.wishlist-btn-round:hover,
.share-btn-round:hover {
  border-color: var(--accent) !important;
  background: #ffffff !important;
  color: var(--accent) !important;
  transform: scale(1.06);
}

.product-quantity-controls {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  height: 54px;
}

.product-qty-btn {
  color: var(--secondary) !important;
}
</style>
