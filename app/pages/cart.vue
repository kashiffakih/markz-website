<template>
  <v-container class="py-8">
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold text-secondary font-serif">
        Shopping Cart
      </h1>
      <div
        style="
          width: 45px;
          height: 1.5px;
          background-color: var(--accent);
          margin-top: 6px;
        "
      ></div>
    </div>

    <!-- Empty Cart -->
    <v-card v-if="cartStore.isEmpty && !loading" class="pa-12 text-center" flat>
      <v-icon size="100" color="grey-lighten-2" class="mb-6">
        mdi-cart-outline
      </v-icon>
      <h2 class="text-h5 text-grey-darken-1 mb-2">Your cart is empty</h2>
      <p class="text-grey mb-6">Add some products to get started</p>
      <v-btn color="primary" size="large" to="/products">
        Browse Products
      </v-btn>
    </v-card>

    <!-- Cart Content -->
    <v-row v-else>
      <!-- Cart Items -->
      <v-col cols="12" md="8">
        <!-- Select All / Item Selection Card -->
        <v-card
          class="mb-4 pa-4 d-flex align-center justify-space-between"
          rounded="lg"
          variant="outlined"
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01) !important;
          "
        >
          <div class="d-flex align-center">
            <v-checkbox-btn
              :model-value="
                cartStore.selectedIds.length === cartStore.items.length
              "
              @update:model-value="cartStore.toggleSelectAll($event)"
              color="accent"
              class="mr-2"
            />
            <span class="font-weight-bold text-subtitle-1">
              Select All ({{ cartStore.selectedIds.length }}/{{
                cartStore.items.length
              }}
              items)
            </span>
          </div>
        </v-card>

        <v-card
          class="mb-4 editorial-hover-card"
          flat
          v-for="item in cartStore.items"
          :key="item.id"
        >
          <v-card-text class="pa-4">
            <v-row align="center">
              <!-- Selection Checkbox -->
              <v-col cols="2" md="1" class="d-flex align-center justify-center">
                <v-checkbox-btn
                  :model-value="cartStore.selectedIds.includes(item.id)"
                  @update:model-value="cartStore.toggleSelection(item.id)"
                  color="primary"
                />
              </v-col>

              <!-- Product Image -->
              <v-col cols="3" md="2">
                <v-img
                  :src="resolvedImageUrl(item.productImage)"
                  aspect-ratio="1"
                  rounded="lg"
                  cover
                />
              </v-col>

              <!-- Product Info -->
              <v-col cols="7" md="4">
                <h3 class="text-subtitle-1 font-weight-bold mb-1">
                  {{ item.productName }}
                </h3>
                <p class="text-caption text-grey mb-2">Pack: {{ item.pack }}</p>
                <div class="d-md-none mb-2">
                  <p
                    class="text-subtitle-1 font-weight-bold text-secondary mb-0"
                  >
                    ₹{{ (item.price * item.quantity).toLocaleString() }}
                  </p>
                  <p class="text-caption text-grey mb-0">
                    ₹{{ item.price.toLocaleString() }} each
                  </p>
                </div>
              </v-col>

              <!-- Quantity Controls -->
              <v-col cols="6" md="3">
                <div class="d-flex align-center justify-center bg-grey-lighten-4 rounded-pill px-2 py-1" style="width: max-content; margin: 0 auto;">
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="grey-darken-2"
                    :disabled="!!loadingActions[item.id]"
                    :loading="loadingActions[item.id] === 'decrement'"
                    @click="updateQuantity(item.id, false, item)"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <span class="mx-4 text-subtitle-1 font-weight-bold">{{ item.quantity }}</span>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="grey-darken-2"
                    :disabled="!!loadingActions[item.id]"
                    :loading="loadingActions[item.id] === 'increment'"
                    @click="updateQuantity(item.id, true, item)"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </v-col>

              <!-- Price & Actions -->
              <v-col cols="6" md="2" class="text-right d-flex flex-column align-end justify-center">
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  color="error"
                  size="small"
                  class="mb-2"
                  :disabled="!!loadingActions[item.id]"
                  :loading="loadingActions[item.id] === 'delete'"
                  @click="removeItem(item.id)"
                  title="Remove Item"
                ></v-btn>
                <div class="d-none d-md-block">
                  <p class="text-h6 font-weight-bold text-secondary mb-0" style="line-height: 1;">
                    ₹{{ (item.price * item.quantity).toLocaleString() }}
                  </p>
                  <p class="text-caption text-grey mt-1 mb-0">
                    ₹{{ item.price.toLocaleString() }} each
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Order Summary -->
      <v-col cols="12" md="4">
        <v-card class="pa-6" rounded="lg">
          <h3 class="text-h6 font-weight-bold mb-4">Order Summary</h3>

          <!-- free delivery nudge -->
          <v-alert
            v-if="policy && awayFromFree(cartStore.selectedTotalAmount) > 0"
            type="info"
            variant="tonal"
            density="compact"
            icon="mdi-truck-fast-outline"
            class="mb-4"
          >
            ₹{{ awayFromFree(cartStore.selectedTotalAmount).toLocaleString("en-IN") }} aur add karo,
            <b>delivery free</b> ho jayegi
            <v-progress-linear
              :model-value="Math.min(100, (cartStore.selectedTotalAmount / Number(policy.free_delivery_above)) * 100)"
              color="success" height="6" rounded class="mt-2"
            />
          </v-alert>
          <v-alert
            v-else-if="policy && cartStore.selectedTotalAmount > 0"
            type="success"
            variant="tonal"
            density="compact"
            icon="mdi-check-circle-outline"
            class="mb-4"
          >
            Badhai ho! Is order par <b>delivery free</b> hai.
          </v-alert>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey"
              >Subtotal ({{ cartStore.selectedItemCount }} items)</span
            >
            <span class="font-weight-bold"
              >₹{{ cartStore.selectedTotalAmount.toLocaleString() }}</span
            >
          </div>

          <!-- Wholesaler Discount -->
          <div
            class="d-flex justify-space-between mb-2 text-success"
            v-if="wholesalerDiscount > 0"
          >
            <span>
              <v-icon size="small" color="success">mdi-star-circle</v-icon>
              Wholesaler Discount
            </span>
            <span class="font-weight-bold"
              >- ₹{{ wholesalerDiscount.toLocaleString() }}</span
            >
          </div>

          <!-- Coupon Discount -->
          <div
            class="d-flex justify-space-between mb-2 text-success"
            v-if="couponDiscount > 0"
          >
            <span>
              <v-icon size="small" color="success"
                >mdi-ticket-percent-outline</v-icon
              >
              Coupon Discount
            </span>
            <span class="font-weight-bold"
              >- ₹{{ couponDiscount.toLocaleString() }}</span
            >
          </div>

          <!-- Reward Points Toggle -->
          <div
            class="d-flex align-center justify-space-between mb-4 mt-2"
            v-if="authStore.activeRole !== 'Distributor'"
          >
            <div class="d-flex align-center ga-2">
              <v-icon color="success">mdi-wallet-giftcard</v-icon>
              <span class="text-body-2">Use Reward Points</span>
              <span class="text-caption text-grey" v-if="walletBalance > 0">
                (Available: {{ walletBalance }} pts)
              </span>
            </div>
            <v-switch
              v-model="useWalletPoints"
              color="success"
              hide-details
              inset
              density="compact"
              :disabled="
                walletBalance <= 0 || cartStore.selectedItemCount === 0
              "
            ></v-switch>
          </div>

          <!-- Rewards Discount Row -->
          <div
            class="d-flex justify-space-between mb-2 text-success"
            v-if="appliedWalletPoints > 0"
          >
            <span>
              <v-icon size="small" color="success"
                >mdi-wallet-membership</v-icon
              >
              Rewards Applied
            </span>
            <span class="font-weight-bold"
              >- ₹{{
                appliedWalletPoints.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}</span
            >
          </div>

          <!-- Additional Company Fees -->
          <div
            class="d-flex justify-space-between mb-2"
            v-if="companyFees.platformFee > 0"
          >
            <span class="text-grey">Platform Fee</span>
            <span>₹{{ companyFees.platformFee.toFixed(2) }}</span>
          </div>

          <div
            class="d-flex justify-space-between mb-2"
            v-if="companyFees.packagingCharges > 0"
          >
            <span class="text-grey">Packaging Charges</span>
            <span>₹{{ companyFees.packagingCharges.toFixed(2) }}</span>
          </div>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">Delivery Charges</span>
            <span
              :class="
                companyFees.deliveryCharges === 0
                  ? 'text-success font-weight-bold'
                  : ''
              "
            >
              {{
                companyFees.deliveryCharges === 0
                  ? "Free"
                  : "₹" + companyFees.deliveryCharges.toFixed(2)
              }}
            </span>
          </div>

          <!-- Dynamic inclusive GST breakdown display -->
          <template v-if="gstCalculations.gstAmount > 0">
            <v-divider class="my-2" />
            <div
              class="d-flex justify-space-between mb-1 text-caption text-grey"
              v-if="gstCalculations.cgst > 0"
            >
              <span>CGST (2.5%)</span>
              <span>₹{{ gstCalculations.cgst.toFixed(2) }}</span>
            </div>
            <div
              class="d-flex justify-space-between mb-1 text-caption text-grey"
              v-if="gstCalculations.sgst > 0"
            >
              <span>SGST (2.5%)</span>
              <span>₹{{ gstCalculations.sgst.toFixed(2) }}</span>
            </div>
            <div
              class="d-flex justify-space-between mb-1 text-caption text-grey"
              v-if="gstCalculations.igst > 0"
            >
              <span>IGST (5%)</span>
              <span>₹{{ gstCalculations.igst.toFixed(2) }}</span>
            </div>
            <div
              class="d-flex justify-space-between mb-1 text-caption text-grey-darken-1 font-weight-bold"
            >
              <span>GST Included</span>
              <span>₹{{ gstCalculations.gstAmount.toFixed(2) }}</span>
            </div>
          </template>

          <v-divider class="my-4" />

          <!-- Promocode Section -->
          <div class="d-flex mb-4 ga-2">
            <v-text-field
              v-model="couponCode"
              label="Have a promo code?"
              variant="outlined"
              density="compact"
              hide-details
              :disabled="couponDiscount > 0"
            ></v-text-field>
            <v-btn
              color="primary"
              height="40"
              :loading="applyingCoupon"
              @click="couponDiscount > 0 ? removeCoupon() : applyCoupon()"
            >
              {{ couponDiscount > 0 ? "Remove" : "Apply" }}
            </v-btn>
          </div>

          <div class="text-right mb-4 mt-n2">
            <v-btn
              variant="text"
              color="primary"
              density="compact"
              size="small"
              prepend-icon="mdi-tag-outline"
              class="text-none font-weight-bold"
              @click="openCouponsDialog"
              :disabled="couponDiscount > 0"
            >
              View Available Offers
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between mb-4">
            <span class="text-h6 font-weight-bold">Total Payable</span>
            <span class="text-h6 font-weight-bold text-secondary">
              ₹{{
                totalPayable.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </div>

          <!-- Minimum Order Warning (Distributor MOV with Madani exemption) -->
          <v-alert
            v-if="!isMovMet"
            type="warning"
            density="compact"
            class="mb-4"
          >
            {{ movMessage }}
          </v-alert>

          <v-btn
            color="secondary"
            size="large"
            block
            class="luxury-action-btn font-weight-bold"
            :disabled="!isMovMet || cartStore.selectedIds.length === 0"
            @click="proceedToCheckout"
          >
            Proceed to Checkout
          </v-btn>

          <v-btn
            variant="text"
            color="secondary"
            block
            class="mt-2 text-caption font-weight-bold"
            style="letter-spacing: 0.08em; text-transform: uppercase"
            to="/products"
          >
            Continue Shopping
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Available Coupons Dialog -->
    <v-dialog v-model="showCouponsDialog" max-width="500" scrollable>
      <v-card rounded="xl" class="overflow-hidden">
        <v-card-title
          class="d-flex justify-space-between align-center px-6 py-4 bg-grey-lighten-4"
        >
          <span class="text-h6 font-weight-bold text-secondary">
            <v-icon start color="primary" class="mr-1"
              >mdi-ticket-percent-outline</v-icon
            >
            Available Offers
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="compact"
            @click="showCouponsDialog = false"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
          class="pa-4 bg-background"
          style="max-height: 400px; background-color: #fffdf5 !important"
        >
          <div
            v-if="loadingCoupons"
            class="d-flex justify-center align-center py-12"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>

          <div
            v-else-if="coupons.length === 0"
            class="text-center py-8 text-grey"
          >
            <v-icon size="48" color="grey-lighten-2" class="mb-3"
              >mdi-tag-off-outline</v-icon
            >
            <div class="text-subtitle-1 font-weight-bold">
              No active coupons available
            </div>
            <div class="text-caption">
              Please check back later for exciting offers!
            </div>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="coupon in coupons"
              :key="coupon.id"
              rounded="lg"
              variant="flat"
              class="border-thin pa-4 position-relative overflow-hidden bg-white"
              style="border-left: 5px solid #eed056 !important"
            >
              <div class="d-flex justify-space-between align-center mb-2">
                <div>
                  <v-chip
                    color="secondary"
                    label
                    size="small"
                    class="font-weight-bold tracking-wider mb-2"
                  >
                    {{ coupon.name }}
                  </v-chip>
                  <h4
                    class="text-subtitle-1 font-weight-bold text-grey-darken-4"
                  >
                    {{
                      coupon.type === "Percentage"
                        ? `${coupon.value}% OFF`
                        : `₹${coupon.value} OFF`
                    }}
                  </h4>
                </div>
                <v-btn
                  color="primary"
                  size="small"
                  rounded="pill"
                  class="font-weight-bold px-4"
                  @click="selectCoupon(coupon.name)"
                >
                  Apply
                </v-btn>
              </div>

              <div class="text-body-2 text-grey-darken-1 mb-2">
                Min. Order:
                <span class="font-weight-bold text-grey-darken-4"
                  >₹{{
                    parseFloat(
                      coupon.min_order_value || coupon.minOrderValue || "0",
                    ).toLocaleString()
                  }}</span
                >
              </div>

              <v-divider class="my-2 border-dashed"></v-divider>

              <div class="d-flex align-center text-caption text-grey">
                <v-icon size="x-small" start>mdi-clock-outline</v-icon>
                Expires: {{ coupon.end_date || coupon.endDate || "N/A" }}
              </div>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";

const authStore = useAuthStore();
const { policy, load: loadPolicy, deliveryFor, awayFromFree } = usePolicy();
onMounted(loadPolicy);
const cartStore = useCartStore();
const router = useRouter();
const config = useRuntimeConfig();

import { useWalletStore } from "~/stores/wallet";

const walletStore = useWalletStore();
const useWalletPoints = ref(false);

const loading = ref(false);
const couponCode = ref("");
const applyingCoupon = ref(false);
const couponDiscount = ref(0);
const appliedCouponId = ref("");

const showCouponsDialog = ref(false);
const coupons = ref<any[]>([]);
const loadingCoupons = ref(false);

// Wholesaler and Address structures
const wholesalerDiscountsMap = ref<Record<number, number>>({});
const addresses = ref<any[]>([]);
const defaultAddress = ref<any>(null);

const walletBalance = computed(() => {
  return walletStore.balance;
});

const appliedWalletPoints = computed(() => {
  if (!useWalletPoints.value || authStore.activeRole === "Distributor")
    return 0;
  const cartTotal = cartStore.selectedTotalAmount;
  // Calculate using mobile's exact method: pre-tax item total = cartTotal / 105 * 100
  const itemTotal = (cartTotal / 105) * 100;
  const calculatedPoints = Math.round(itemTotal * 0.25);
  const availablePoints = walletStore.balance;
  return Math.min(calculatedPoints, availablePoints);
});

// Get additional company charges
const companyFees = computed(() => {
  const company = authStore.user?.companies?.[0];
  const parseAmount = (val: any) => parseFloat((val || 0).toString());
  return {
    // platform-wide rule (free above a cart value, small fee below); old seller value only if policy is not loaded
    deliveryCharges: deliveryFor(cartStore.selectedTotalAmount, parseAmount(company?.deliveryCharges || 0)),
    packagingCharges: parseAmount(company?.packagingCharges || 0),
    platformFee: parseAmount(company?.platformFee || 0),
  };
});

// Dynamic Wholesaler Discount
const wholesalerDiscount = computed(() => {
  if (authStore.activeRole !== "Distributor") return 0;
  let totalDiscount = 0;
  cartStore.selectedItems.forEach((item: any) => {
    let discountPercent = wholesalerDiscountsMap.value[item.productId];
    if (
      !discountPercent &&
      item.originalItem?.product?.favWholesalerDiscount > 0
    ) {
      discountPercent = item.originalItem.product.favWholesalerDiscount;
    }
    if (discountPercent && discountPercent > 0) {
      const discountAmount = (item.price * discountPercent) / 100;
      totalDiscount += discountAmount * item.quantity;
    }
  });
  return totalDiscount;
});

// Dynamic MOV warning check (Madani exemption support)
const isMovMet = computed(() => {
  if (authStore.activeRole !== "Distributor") return true;

  if (cartStore.selectedItems.length === 0) return true;

  // Check if items are exclusively "Madani"
  const allMadani = cartStore.selectedItems.every((item) =>
    item.productName.toLowerCase().includes("madani"),
  );
  if (allMadani) return true;

  const minVal = parseFloat(
    authStore.user?.companies?.[0]?.min_order_value_distributor || "10000",
  );
  return cartStore.selectedTotalAmount >= minVal;
});

const movMessage = computed(() => {
  if (isMovMet.value) return "";
  const minVal =
    authStore.user?.companies?.[0]?.min_order_value_distributor || "10,000";
  return `Minimum order value for distributors is ₹${parseFloat(minVal).toLocaleString()} (unless purchasing exclusively Madani products).`;
});

// Total Payable calculation
const totalPayable = computed(() => {
  const fees = companyFees.value;
  const subtotal = cartStore.selectedTotalAmount;

  const total =
    subtotal +
    fees.platformFee +
    fees.packagingCharges +
    fees.deliveryCharges -
    couponDiscount.value -
    wholesalerDiscount.value -
    appliedWalletPoints.value;
  return Math.max(0, total);
});

// GST calculations split dynamically by Maharashtra vs IGST
const gstCalculations = computed(() => {
  const total = totalPayable.value;
  const gstAmount = total > 0 ? (total * 5) / 105 : 0;

  const isMaharashtra = defaultAddress.value?.state
    ?.toLowerCase()
    .includes("maharashtra");

  if (isMaharashtra) {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      gstAmount,
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      gstAmount,
    };
  }
});

// Helper to resolve relative image path using mediaBase
const resolvedImageUrl = (path: string | undefined) => {
  if (!path) return "https://via.placeholder.com/100?text=No+Image";
  if (path.startsWith("http")) return path;
  const mediaBase = config.public.mediaBase as string;
  return `${mediaBase}${path}`;
};

// Inject snackbar
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

// Methods
const loadingActions = ref<
  Record<number, "increment" | "decrement" | "delete" | null>
>({});

const updateQuantity = async (itemId: number, isAdd: boolean, item: any) => {
  if (loadingActions.value[itemId]) return;

  const action = isAdd ? "increment" : "decrement";
  loadingActions.value[itemId] = action;
  try {
    await cartStore.modifyCart(
      item.productId,
      item.packId || item.pack,
      isAdd,
      item.price,
      item.flavor,
      item.kindOfFlower,
    );
  } finally {
    loadingActions.value[itemId] = null;
  }
};

const removeItem = async (itemId: number) => {
  if (loadingActions.value[itemId]) return;

  loadingActions.value[itemId] = "delete";
  try {
    await cartStore.removeItem(itemId);
    showSnackbar("Item removed from cart", "success");
  } finally {
    loadingActions.value[itemId] = null;
  }
};

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return;

  applyingCoupon.value = true;
  const api = useApi();

  try {
    const response: any = await api.get("/company_coupons");
    let isValid = false;

    if (response.success && response.data) {
      const coupon = response.data.find(
        (c: any) =>
          c.name?.toLowerCase() === couponCode.value.trim().toLowerCase(),
      );

      if (coupon) {
        const cartTotal = cartStore.selectedTotalAmount;
        let couponVal = 0;

        if (coupon.type === "Percentage") {
          couponVal = cartTotal * (parseFloat(coupon.value) / 100);
        } else {
          couponVal = parseFloat(coupon.value);
        }

        couponDiscount.value = Math.min(couponVal, cartTotal);
        appliedCouponId.value = coupon.id?.toString();
        showSnackbar(
          `Coupon applied! Savings: ₹${couponDiscount.value.toFixed(2)}`,
          "success",
        );
        isValid = true;
      }
    }

    if (!isValid) {
      showSnackbar("Invalid or expired coupon code.", "error");
      couponCode.value = "";
    }
  } catch (e: any) {
    console.error("Coupon error:", e);
    showSnackbar("Error validating coupon.", "error");
  } finally {
    applyingCoupon.value = false;
  }
};

const removeCoupon = () => {
  couponDiscount.value = 0;
  appliedCouponId.value = "";
  couponCode.value = "";
  showSnackbar("Coupon removed.", "info");
};

const fetchCoupons = async () => {
  loadingCoupons.value = true;
  try {
    const api = useApi();
    const response = await api.get("/company_coupons");
    if (response.success && response.data) {
      const currentDate = new Date();
      coupons.value = response.data.filter((coupon: any) => {
        let isActive = true;
        if (coupon.start_date) {
          const parts = coupon.start_date.split("-");
          const start = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
          if (currentDate < start) isActive = false;
        }
        if (coupon.end_date) {
          const parts = coupon.end_date.split("-");
          const end = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
          end.setHours(23, 59, 59, 999);
          if (currentDate > end) isActive = false;
        }
        return isActive;
      });
    }
  } catch (e) {
    console.error("Error fetching coupons:", e);
  } finally {
    loadingCoupons.value = false;
  }
};

const openCouponsDialog = async () => {
  showCouponsDialog.value = true;
  await fetchCoupons();
};

const selectCoupon = (code: string) => {
  couponCode.value = code;
  showCouponsDialog.value = false;
  applyCoupon();
};

const proceedToCheckout = () => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("navigated_from_cart", "true");
  }
  router.push({
    path: "/checkout",
    query: {
      coupon: couponCode.value,
      use_points: useWalletPoints.value ? "true" : "false",
    },
  });
};

// Fetch cart on mount
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }

  loading.value = true;
  await cartStore.fetchCart();

  // Fetch Wholesaler discounts if Distributor
  if (authStore.activeRole === "Distributor") {
    try {
      const api = useApi();
      const res: any = await api.get(`/users/${authStore.user.id}/discounts`);
      if (res.success && res.data) {
        const map: Record<number, number> = {};
        res.data.forEach((d: any) => {
          map[d.product_id] = parseFloat(d.discount);
        });
        wholesalerDiscountsMap.value = map;
      }
    } catch (e) {
      console.error("Failed to fetch wholesaler discounts", e);
    }
  }

  // Fetch addresses to find default address for tax calculation
  try {
    const api = useApi();
    const res = await api.get("/user_addresses", {
      userId: authStore.user?.id,
    });
    if (res.success && res.data) {
      addresses.value = res.data;
      defaultAddress.value =
        res.data.find((a: any) => a.is_default) || res.data[0] || null;
    }
  } catch (e) {
    console.error("Failed to fetch addresses", e);
  }

  // Fetch wallets if not Distributor
  if (authStore.activeRole !== "Distributor") {
    try {
      await walletStore.fetchWallets();
    } catch (e) {
      console.error("Failed to fetch wallets", e);
    }
  }

  loading.value = false;
});
</script>

<style scoped>
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

.luxury-action-btn:hover:not(:disabled) {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  box-shadow: var(--coral-glow) !important;
  color: #ffffff !important;
}

.editorial-hover-card {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  background-color: #ffffff !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01) !important;
  border-radius: 12px !important;
}

.editorial-hover-card:hover {
  border-color: var(--accent) !important;
  box-shadow: 0 12px 30px rgba(229, 94, 94, 0.08) !important;
  transform: translateY(-2px);
}

.text-primary {
  color: var(--accent) !important;
}
</style>
