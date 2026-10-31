<template>
  <v-card class="product-card h-100" flat style="border-radius: 24px !important; border: none !important; background-color: transparent !important; display: flex; flex-direction: column; box-shadow: none !important;">
    <!-- Product Image -->
    <div class="product-image-container position-relative" style="background-color: transparent; border-radius: 24px !important; border: none !important;">
      <v-img
        :src="productImage"
        aspect-ratio="1"
        class="product-image cursor-pointer"
        style="border-radius: 24px !important;"
        @click="navigateToDetail"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height" style="background-color: #ffffff;">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </template>
      </v-img>

      <!-- Discount Badge -->
      <v-chip
        v-if="discountPercent > 0"
        color="primary"
        size="x-small"
        class="discount-badge font-weight-bold"
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
        <v-icon size="18" :color="isWishlisted ? 'error' : 'grey-darken-1'">
          {{ isWishlisted ? "mdi-heart" : "mdi-heart-outline" }}
        </v-icon>
      </v-btn>
    </div>

    <!-- Product Info -->
    <v-card-text class="pa-4 d-flex flex-column justify-space-between flex-grow-1" style="min-height: 170px;">
      <div>
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption text-grey-darken-1 font-weight-bold" style="letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.625rem !important; opacity: 0.65;">
            MARKZ
          </span>
          <span class="text-caption text-grey" style="font-size: 0.625rem !important; letter-spacing: 0.05em; text-transform: uppercase;">
            {{ product?.category?.name || "Category" }}
          </span>
        </div>
        <h3
          class="text-subtitle-1 font-weight-bold mb-2 product-title cursor-pointer"
          style="font-size: 1.05rem !important; line-height: 1.35; min-height: 44px; color: var(--secondary);"
          @click="navigateToDetail"
        >
          {{ product?.name }}
        </h3>
        
        <!-- Rating -->
        <div class="d-flex align-center mb-2" v-if="(product?.total_reviews || 0) > 0">
          <v-rating
            :model-value="Number(product?.rating) || 0"
            readonly
            half-increments
            density="compact"
            size="x-small"
            color="warning"
          />
          <span class="text-caption text-grey ms-1">({{ product?.total_reviews || 0 }})</span>
        </div>
      </div>

      <div>
        <!-- Pricing -->
        <div class="d-flex align-center ga-2 mb-4">
          <template v-if="priceInfo.hasValidPrice">
            <span class="text-subtitle-1 font-weight-bold text-secondary" style="font-size: 1.15rem !important;">
              ₹{{ displayPrice.toLocaleString() }}
            </span>
            <span
              v-if="originalPrice > displayPrice"
              class="text-caption text-grey text-decoration-line-through"
              style="opacity: 0.7; font-size: 0.85rem !important;"
            >
              ₹{{ originalPrice.toLocaleString() }}
            </span>
          </template>
          <template v-else>
            <span class="text-caption font-weight-bold text-grey-darken-1">
              Price Not Available
            </span>
          </template>
        </div>

        <!-- Quantity Controls or Add to Cart -->
        <template v-if="priceInfo.hasValidPrice">
          <div v-if="quantityInCart > 0" class="d-flex align-center justify-space-between quantity-controls py-1 px-2">
             <v-btn icon size="small" variant="text" :loading="updatingQuantity" @click.stop="decrementQuantity" class="qty-btn">
                <v-icon size="20">mdi-minus</v-icon>
             </v-btn>
             <span class="font-weight-bold text-subtitle-1" style="min-width: 24px; text-align: center;">{{ quantityInCart }}</span>
             <v-btn icon size="small" variant="text" :loading="updatingQuantity" @click.stop="incrementQuantity" class="qty-btn">
                <v-icon size="20">mdi-plus</v-icon>
             </v-btn>
          </div>
          
          <v-btn
            v-else
            block
            variant="flat"
            class="add-to-cart-btn"
            :loading="addingToCart"
            @click.stop="handleAddToCart"
          >
            Add to Cart
          </v-btn>
        </template>
      </div>
    </v-card-text>
    <!-- Variant Selection Dialog -->
    <v-dialog v-model="showVariantDialog" max-width="450">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="d-flex justify-space-between align-center px-4 pt-4 pb-2">
          <span class="text-h6 font-weight-bold text-secondary" style="font-family: 'Cormorant Garamond', serif !important;">Select Options</span>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="showVariantDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
           <!-- Product Summary -->
           <div class="d-flex align-center mb-6 pa-3 rounded-lg" style="background-color: rgba(0,0,0,0.03);">
             <v-avatar size="64" rounded="lg" class="mr-4 border" style="background-color: #fff;">
               <v-img :src="productImage" cover></v-img>
             </v-avatar>
             <div>
               <div class="font-weight-bold text-body-1 text-secondary" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ product.name }}</div>
               <div class="text-primary font-weight-bold mt-1">
                 <template v-if="priceInfo.hasValidPrice">₹{{ displayPrice.toLocaleString() }}</template>
                 <template v-else>Price Not Available</template>
               </div>
             </div>
           </div>

           <!-- Variant Options -->
           <div v-if="availableVariants && availableVariants.length > 0">
             
             <!-- Validation message -->
             <div v-if="validationError" class="text-error text-caption mb-3 d-flex align-center font-weight-bold">
               <v-icon size="small" class="mr-1">mdi-alert-circle-outline</v-icon>
               Please select a size/variant before adding to cart
             </div>

             <!-- Colors (Only show if multiple colors exist) -->
             <div v-if="availableColors.length > 1" class="mb-4">
               <div class="text-caption font-weight-bold text-uppercase text-grey-darken-1 mb-2" style="letter-spacing: 0.05em;">Select Color</div>
               <v-chip-group
                  v-model="selectedColor"
                  selected-class="bg-secondary text-white border-secondary"
                  column
                  mandatory
                  @update:modelValue="selectedPackId = null; validationError = false"
                >
                  <v-chip
                    v-for="color in availableColors"
                    :key="color"
                    :value="color"
                    filter
                    variant="outlined"
                    size="large"
                    class="font-weight-bold px-4"
                    style="border-radius: 8px !important;"
                  >
                    {{ color }}
                  </v-chip>
                </v-chip-group>
             </div>

             <!-- Sizes / Variants -->
             <div v-if="sizesForSelectedColor.length > 0">
               <div class="text-caption font-weight-bold text-uppercase text-grey-darken-1 mb-2" style="letter-spacing: 0.05em;">Select Size <span class="text-error">*</span></div>
               <v-chip-group
                  v-model="selectedPackId"
                  selected-class="bg-primary text-white border-primary"
                  column
                  @update:modelValue="validationError = false"
                >
                  <v-chip
                    v-for="variant in sizesForSelectedColor"
                    :key="variant.id"
                    :value="variant.id"
                    filter
                    variant="outlined"
                    size="large"
                    class="font-weight-bold mb-2 px-4"
                    style="border-radius: 8px !important;"
                  >
                    {{ variant.size }} - <template v-if="variant.price > 0">₹{{ Math.round(variant.price).toLocaleString() }}</template><template v-else>N/A</template>
                  </v-chip>
                </v-chip-group>
             </div>
           </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-0">
          <v-btn
            color="primary"
            variant="flat"
            block
            size="large"
            rounded="pill"
            class="font-weight-bold"
            :loading="addingToCart"
            @click="confirmAddToCart"
          >
            Add to Cart
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useWishlistStore } from "~/stores/wishlist";
import { ref, computed, inject } from "vue";
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
    product_pack_id?: number;
  }>;
  product_packs?: Array<{
    id: number;
    value: string;
    unit?: { name: string };
    qty?: number;
  }>;
}

const props = defineProps<{
  product: Product;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const router = useRouter();

const showSnackbar = inject<(text: string, color?: string) => void>("showSnackbar");

const addingToCart = ref(false);
const updatingQuantity = ref(false);

const showVariantDialog = ref(false);
const selectedColor = ref<string | null>(null);
const selectedPackId = ref<number | string | null>(null);
const validationError = ref(false);

const packIdentifier = computed(() => {
  const priceObj = props.product?.product_prices?.[0];
  return priceObj?.product_pack_id?.toString() || priceObj?.pack || "default";
});

const cartItem = computed(() => {
  if (!props.product) return null;
  return cartStore.items.find((i: any) => 
    i.productId === props.product.id && 
    (i.packId == packIdentifier.value || i.pack == packIdentifier.value)
  );
});

const quantityInCart = computed(() => cartItem.value ? cartItem.value.quantity : 0);
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
    return { price: 0, offerPrice: 0, hasValidPrice: false };
  }

  const priceObj = prices[0];
  if (!priceObj) {
    return { price: 0, offerPrice: 0, hasValidPrice: false };
  }

  const isDistributor = authStore.activeRole === "Distributor";
  let price = 0;
  let offerPrice = 0;

  if (isDistributor) {
    price = parseFloat(priceObj.distributor_price?.toString() || "0");
    offerPrice = parseFloat(priceObj.distributor_offer_price?.toString() || "0");
  } else {
    price = parseFloat(priceObj.price?.toString() || "0");
    offerPrice = parseFloat(priceObj.offer_price?.toString() || "0");
  }

  if (price <= 0) {
    return { price: 0, offerPrice: 0, hasValidPrice: false };
  }

  const validOffer = offerPrice > 0 && offerPrice < price ? offerPrice : 0;
  return {
    price,
    offerPrice: validOffer,
    hasValidPrice: true
  };
});

const displayPrice = computed(() => {
  const { price, offerPrice, hasValidPrice } = priceInfo.value;
  if (!hasValidPrice) return 0;
  return Math.round(offerPrice > 0 && offerPrice < price ? offerPrice : price);
});

const originalPrice = computed(() => Math.round(priceInfo.value.price));

const discountPercent = computed(() => {
  if (!priceInfo.value.hasValidPrice) return 0;
  const { price, offerPrice } = priceInfo.value;
  if (price > 0 && offerPrice > 0 && offerPrice < price) {
    return Math.round(((price - offerPrice) / price) * 100);
  }
  return 0;
});

// Methods
const availableVariants = computed(() => {
  const isDistributor = authStore.activeRole === "Distributor";
  if (props.product?.product_packs && props.product.product_packs.length > 0) {
    return props.product.product_packs.map(p => {
      const priceObj = props.product.product_prices?.find(price => price.product_pack_id == p.id);
      let pPrice = 0;
      if (priceObj) {
        if (isDistributor) {
          const dPrice = parseFloat(priceObj.distributor_price?.toString() || "0");
          const dOffer = parseFloat(priceObj.distributor_offer_price?.toString() || "0");
          pPrice = (dOffer > 0 && dOffer < dPrice) ? dOffer : dPrice;
        } else {
          const uPrice = parseFloat(priceObj.price?.toString() || "0");
          const uOffer = parseFloat(priceObj.offer_price?.toString() || "0");
          pPrice = (uOffer > 0 && uOffer < uPrice) ? uOffer : uPrice;
        }
      }
      return {
        id: p.id,
        color: p.unit?.name || 'Standard',
        size: p.value || 'Standard',
        price: Math.round(pPrice)
      };
    });
  } else if (props.product?.product_prices && props.product.product_prices.length > 0) {
    return props.product.product_prices.map((p, index) => {
      let pPrice = 0;
      if (isDistributor) {
        const dPrice = parseFloat(p.distributor_price?.toString() || "0");
        const dOffer = parseFloat(p.distributor_offer_price?.toString() || "0");
        pPrice = (dOffer > 0 && dOffer < dPrice) ? dOffer : dPrice;
      } else {
        const uPrice = parseFloat(p.price?.toString() || "0");
        const uOffer = parseFloat(p.offer_price?.toString() || "0");
        pPrice = (uOffer > 0 && uOffer < uPrice) ? uOffer : uPrice;
      }
      
      let color = 'Standard';
      let size = p.pack || ('Variant ' + (p.product_pack_id || index + 1));
      
      if (p.pack && p.pack.includes(' - ')) {
        const parts = p.pack.split(' - ');
        color = parts[0].trim();
        size = parts.slice(1).join(' - ').trim();
      }

      return {
        id: p.product_pack_id || p.pack || "default",
        color: color,
        size: size,
        price: Math.round(pPrice)
      };
    });
  }
  return [];
});

const availableColors = computed(() => {
  const colors = new Set<string>();
  availableVariants.value.forEach(v => colors.add(v.color));
  return Array.from(colors);
});

const sizesForSelectedColor = computed(() => {
  if (!selectedColor.value) return [];
  return availableVariants.value.filter(v => v.color === selectedColor.value);
});

const handleAddToCart = async () => {
  if (!props.product || !priceInfo.value.hasValidPrice) return;
  if (!authStore.isLoggedIn) {
    router.push("/login?redirect=" + router.currentRoute.value.fullPath);
    return;
  }

  if (availableVariants.value.length > 1) {
    selectedColor.value = availableColors.value[0] || null;
    selectedPackId.value = null;
    validationError.value = false;
    showVariantDialog.value = true;
  } else {
    addingToCart.value = true;
    await cartStore.addToCart(props.product.id, packIdentifier.value, 1, displayPrice.value);
    addingToCart.value = false;
    if (showSnackbar) showSnackbar("Added to cart", "success");
  }
};

const confirmAddToCart = async () => {
  if (!authStore.isLoggedIn) {
    showVariantDialog.value = false;
    router.push("/login?redirect=" + router.currentRoute.value.fullPath);
    return;
  }
  if (!selectedPackId.value) {
    validationError.value = true;
    return;
  }
  
  addingToCart.value = true;
  
  let priceToAdd = displayPrice.value;
  const packPriceObj = props.product.product_prices?.find(p => p.product_pack_id == selectedPackId.value);
  
  if (packPriceObj) {
    const isDistributor = authStore.activeRole === "Distributor";
    let price = 0;
    let offerPrice = 0;
    if (isDistributor) {
      price = parseFloat(packPriceObj.distributor_price?.toString() || "0");
      offerPrice = parseFloat(packPriceObj.distributor_offer_price?.toString() || "0");
    } else {
      price = parseFloat(packPriceObj.price?.toString() || "0");
      offerPrice = parseFloat(packPriceObj.offer_price?.toString() || "0");
    }

    if (price <= 0) {
      if (showSnackbar) showSnackbar("Price not available for selected option", "error");
      addingToCart.value = false;
      return;
    }

    priceToAdd = (offerPrice > 0 && offerPrice < price) ? offerPrice : price;
  }
  
  const selectedVariant = availableVariants.value.find(v => v.id == selectedPackId.value);
  const color = selectedVariant?.color || selectedColor.value || '';
  const size = selectedVariant?.size || '';

  await cartStore.addToCart(props.product.id, selectedPackId.value.toString(), 1, priceToAdd, color, size);
  addingToCart.value = false;
  showVariantDialog.value = false;
  if (showSnackbar) showSnackbar("Added to cart", "success");
};

const incrementQuantity = async () => {
  if (!authStore.isLoggedIn) {
    router.push("/login?redirect=" + router.currentRoute.value.fullPath);
    return;
  }
  if (!cartItem.value) return;
  updatingQuantity.value = true;
  await cartStore.modifyCart(props.product.id, packIdentifier.value, true, displayPrice.value, cartItem.value.flavor, cartItem.value.kindOfFlower);
  updatingQuantity.value = false;
};

const decrementQuantity = async () => {
  if (!authStore.isLoggedIn) {
    router.push("/login?redirect=" + router.currentRoute.value.fullPath);
    return;
  }
  if (!cartItem.value) return;
  updatingQuantity.value = true;
  await cartStore.modifyCart(props.product.id, packIdentifier.value, false, displayPrice.value, cartItem.value.flavor, cartItem.value.kindOfFlower);
  updatingQuantity.value = false;
};

const toggleWishlist = async () => {
  if (!props.product) return;
  if (!authStore.isLoggedIn) {
    router.push("/login?redirect=" + router.currentRoute.value.fullPath);
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
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.product-card:hover {
  transform: translateY(-8px);
}

.product-image-container {
  position: relative;
  border: none !important;
  border-radius: 24px !important;
  overflow: hidden;
}

.product-image :deep(.v-img__img) {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border-radius: 24px !important;
}

.product-card:hover .product-image :deep(.v-img__img) {
  transform: scale(1.06);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  border-radius: 9999px !important;
  font-size: 0.65rem !important;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(229, 94, 94, 0.15) !important;
  border: none !important;
  background-color: var(--primary) !important;
  color: #ffffff !important;
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  transition: all 0.3s ease !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(26, 26, 26, 0.03) !important;
  width: 32px !important;
  height: 32px !important;
  background-color: #ffffff !important;
}

.wishlist-btn:hover {
  transform: scale(1.08);
}

.product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.product-card:hover .product-title {
  color: var(--primary) !important;
}

.add-to-cart-btn {
  border-radius: 999px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  border: 1px solid #E5E5E5 !important;
  background: #FFFFFF !important;
  color: #222222 !important;
  font-family: 'Urbanist', sans-serif !important;
  font-size: 0.75rem !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.product-card:hover .add-to-cart-btn {
  background: #222222 !important;
  color: #FFFFFF !important;
  border-color: #222222 !important;
  box-shadow: none !important;
}

.quantity-controls {
  border: 1px solid #E5E5E5;
  border-radius: 9999px;
  background: #FFFFFF;
  height: 36px;
  margin-bottom: 2px;
}

.qty-btn {
  color: #222222 !important;
}
.qty-btn:hover {
  background: rgba(0,0,0,0.05);
}
</style>
