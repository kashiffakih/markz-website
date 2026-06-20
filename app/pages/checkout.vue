<template>
  <v-container class="py-8">
    <h1 class="page-title-luxury">Checkout</h1>
    <div
      style="
        width: 35px;
        height: 1.5px;
        background-color: var(--accent);
        margin-bottom: 24px;
      "
    ></div>

    <v-row>
      <!-- Left Column: Address & Payment -->
      <v-col cols="12" md="8">
        <!-- 1. Delivery Address -->
        <v-card
          class="mb-6"
          variant="flat"
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
          "
        >
          <v-card-title
            class="d-flex align-center py-4 px-6"
            style="
              border-bottom: 1px solid var(--border-color);
              font-family: &quot;Cormorant Garamond&quot;, serif !important;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--secondary);
            "
          >
            <v-icon start color="accent" class="mr-2">mdi-map-marker</v-icon>
            Delivery Address
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Saved Addresses -->
            <v-radio-group
              v-model="selectedAddressId"
              v-if="addresses.length > 0"
            >
              <v-radio
                v-for="address in addresses"
                :key="address.id"
                :value="address.id"
                color="primary"
              >
                <template v-slot:label>
                  <div class="py-2">
                    <div class="font-weight-bold">
                      {{ address.label || address.address_name }}
                      <v-chip
                        size="x-small"
                        color="primary"
                        v-if="address.is_default"
                        >Default</v-chip
                      >
                    </div>
                    <div class="text-body-2 text-grey-darken-1">
                      {{ address.add_1 || address.address }}
                    </div>
                    <div class="text-body-2 text-grey-darken-1">
                      {{ address.city }}, {{ address.state }} -
                      {{ address.pincode }}
                    </div>
                    <div class="text-body-2 text-grey">
                      {{ address.phone || address.mobile }}
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <div v-else class="text-center py-4 text-grey">
              No saved addresses found
            </div>

            <!-- Add New Address Button -->
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              block
              class="mt-2"
              @click="showAddressDialog = true"
            >
              Add New Address
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- 2. Payment Method -->
        <v-card
          class="mb-6"
          variant="flat"
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
          "
        >
          <v-card-title
            class="d-flex align-center py-4 px-6"
            style="
              border-bottom: 1px solid var(--border-color);
              font-family: &quot;Cormorant Garamond&quot;, serif !important;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--secondary);
            "
          >
            <v-icon start color="accent" class="mr-2">mdi-credit-card</v-icon>
            Payment Method
          </v-card-title>

          <v-card-text class="pa-4">
            <v-radio-group v-model="paymentMethod">
              <v-radio value="COD" color="primary">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-cash</v-icon>
                    <span class="font-weight-bold">Cash on Delivery (COD)</span>
                  </div>
                </template>
              </v-radio>

              <v-radio value="PhonePe" color="primary">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-cellphone-nfc</v-icon>
                    <span class="font-weight-bold">PhonePe / UPI</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- 3. Gift Options -->
        <v-card
          class="mb-6"
          variant="flat"
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
          "
        >
          <v-card-title
            class="d-flex align-center py-4 px-6"
            style="
              border-bottom: 1px solid var(--border-color);
              font-family: &quot;Cormorant Garamond&quot;, serif !important;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--secondary);
            "
          >
            <v-icon start color="accent" class="mr-2">mdi-gift</v-icon>
            Gift Options
          </v-card-title>

          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Send as a Gift
                </div>
                <div class="text-caption text-grey">
                  We'll add a special gift wrap and note to your order
                </div>
              </div>
              <v-switch v-model="isGift" color="primary" inset hide-details />
            </div>
          </v-card-text>
        </v-card>

        <!-- GST Number Optional Field -->
        <v-card
          class="mt-6 mb-6"
          variant="outlined"
          style="
            border-color: var(--border-color);
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          "
        >
          <v-card-title
            class="d-flex align-center py-4 px-6"
            style="
              border-bottom: 1px solid var(--border-color);
              font-family: &quot;Cormorant Garamond&quot;, serif !important;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--secondary);
            "
          >
            <v-icon start color="primary" class="mr-2">mdi-file-document-outline</v-icon>
            GST Information
          </v-card-title>

          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Use GST Number
                </div>
                <div class="text-caption text-grey">
                  Add GST number for business purchases (Optional)
                </div>
              </div>
              <v-switch v-model="addGst" color="primary" inset hide-details />
            </div>

            <!-- GST Input Field -->
            <v-expand-transition>
              <div v-if="addGst" class="mt-4">
                <v-text-field
                  v-model="gstNumberInput"
                  label="Enter GST Number"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  :rules="[
                    v => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) || 'Invalid GST format'
                  ]"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="grey">mdi-percent</v-icon>
                  </template>
                </v-text-field>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Order Summary -->
      <v-col cols="12" md="4">
        <v-card
          class="pa-6"
          variant="flat"
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04) !important;
          "
        >
          <h3
            class="text-h6 font-weight-bold mb-4 font-serif"
            style="font-size: 1.25rem !important"
          >
            Price Details
          </h3>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey"
              >Subtotal ({{ cartStore.selectedItemCount }} items)</span
            >
            <span>₹{{ cartStore.selectedTotalAmount.toLocaleString() }}</span>
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
            v-if="discount > 0"
          >
            <span>
              <v-icon size="small" color="success"
                >mdi-ticket-percent-outline</v-icon
              >
              Coupon Discount
            </span>
            <span class="font-weight-bold"
              >- ₹{{ discount.toLocaleString() }}</span
            >
          </div>

          <!-- Wallet / Rewards Applied -->
          <div
            class="d-flex justify-space-between mb-2 text-success"
            v-if="walletUsed > 0"
          >
            <span>
              <v-icon size="small" color="success"
                >mdi-wallet-membership</v-icon
              >
              Rewards Applied
            </span>
            <span class="font-weight-bold"
              >- ₹{{ walletUsed.toLocaleString() }}</span
            >
          </div>

          <!-- Company Fees -->
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

          <!-- GST Included details -->
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
          <div class="d-flex mb-4">
            <v-text-field
              v-model="couponCode"
              label="Have a promo code?"
              variant="outlined"
              density="compact"
              hide-details
              class="mr-2"
              :disabled="discount > 0"
            ></v-text-field>
            <v-btn
              color="primary"
              height="40"
              :loading="applyingCoupon"
              @click="discount > 0 ? removeCoupon() : applyCoupon()"
            >
              {{ discount > 0 ? "Remove" : "Apply" }}
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
              :disabled="discount > 0"
            >
              View Available Offers
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between mb-6">
            <span class="text-h6 font-weight-bold">To Pay</span>
            <span class="text-h6 font-weight-bold text-secondary">
              ₹{{
                totalPayable.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </div>

          <v-btn
            color="secondary"
            size="large"
            block
            class="luxury-action-btn font-weight-bold"
            :loading="placingOrder"
            :disabled="!selectedAddressId || !isMovMet"
            @click="placeOrder"
          >
            Place Order
          </v-btn>

          <p
            v-if="!selectedAddressId"
            class="text-caption text-error text-center mt-2"
          >
            Please select a delivery address
          </p>
          <p
            v-if="!isMovMet"
            class="text-caption text-error text-center mt-2 font-weight-bold"
          >
            {{ movMessage }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Address Dialog -->
    <v-dialog v-model="showAddressDialog" max-width="600">
      <v-card>
        <v-card-title>Add New Address</v-card-title>
        <v-card-text>
          <v-form
            ref="addressForm"
            v-model="addressFormValid"
            @submit.prevent="saveAddress"
          >
            <v-text-field
              v-model="newAddress.label"
              label="Address Name (e.g. Home, Office)"
              :rules="requiredRules"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAddress.city"
                  label="City"
                  :rules="requiredRules"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAddress.state"
                  label="State"
                  :rules="requiredRules"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAddress.pincode"
                  label="Pincode"
                  :rules="requiredRules"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAddress.phone"
                  label="Mobile Number"
                  :rules="requiredRules"
                />
              </v-col>
            </v-row>

            <v-textarea
              v-model="newAddress.add_1"
              label="Full Address"
              rows="3"
              :rules="requiredRules"
            />

            <v-checkbox
              v-model="newAddress.is_default"
              label="Make this my default address"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddressDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="saveAddress" :loading="savingAddress"
            >Save Address</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

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
              style="border-left: 4px solid var(--primary) !important"
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
    <!-- Gift Address Dialog -->
    <v-dialog v-model="showGiftAddressDialog" max-width="450">
      <v-card rounded="xl" class="pa-2">
        <v-card-title
          class="text-center pt-6 text-h5 font-weight-bold font-serif text-secondary"
          style="white-space: normal"
        >
          <v-icon color="accent" class="mb-3 d-block mx-auto" size="36"
            >mdi-gift-outline</v-icon
          >
          Sending a Gift?
        </v-card-title>
        <v-card-text
          class="text-center text-body-1 text-grey-darken-1 pb-6 px-6"
        >
          Would you like to send this to a different address or use your
          currently selected address?
        </v-card-text>
        <v-card-actions class="d-flex flex-column ga-3 px-6 pb-6 pt-0">
          <v-btn
            color="primary"
            variant="flat"
            block
            size="large"
            rounded="pill"
            class="font-weight-bold"
            @click="onChangeAddressForGift"
          >
            Change Address
          </v-btn>
          <v-btn
            variant="outlined"
            color="secondary"
            block
            size="large"
            rounded="pill"
            class="font-weight-bold"
            @click="showGiftAddressDialog = false"
          >
            Same as Selected
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Address Selection Dialog (For Gift Flow) -->
    <v-dialog v-model="showAddressSelectionDialog" max-width="500" scrollable>
      <v-card rounded="xl">
        <v-card-title
          class="d-flex justify-space-between align-center px-6 py-4 bg-grey-lighten-4"
        >
          <span class="text-h6 font-weight-bold text-secondary">
            <v-icon start color="primary" class="mr-1">mdi-map-marker</v-icon>
            Select Gift Address
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="compact"
            @click="showAddressSelectionDialog = false"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
          class="pa-4 bg-background"
          style="max-height: 450px; background-color: #fffdf5 !important"
        >
          <v-radio-group
            v-model="selectedAddressId"
            v-if="addresses.length > 0"
            hide-details
            @update:modelValue="showAddressSelectionDialog = false"
          >
            <v-radio
              v-for="address in addresses"
              :key="address.id"
              :value="address.id"
              color="primary"
              class="mb-4 bg-white pa-3 rounded-lg border-thin"
              style="border-left: 4px solid var(--primary) !important"
            >
              <template v-slot:label>
                <div class="py-1 ml-2">
                  <div class="font-weight-bold text-body-1 text-grey-darken-4">
                    {{ address.label || address.address_name }}
                    <v-chip
                      size="x-small"
                      color="primary"
                      v-if="address.is_default"
                      class="ml-2"
                      >Default</v-chip
                    >
                  </div>
                  <div class="text-body-2 text-grey-darken-1 mt-1">
                    {{ address.add_1 || address.address }}<br />
                    {{ address.city }}, {{ address.state }} -
                    {{ address.pincode }}
                  </div>
                  <div class="text-caption text-grey mt-1">
                    <v-icon size="small" class="mr-1">mdi-phone</v-icon>
                    {{ address.phone || address.mobile }}
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
          <div v-else class="text-center py-6 text-grey">
            <v-icon size="40" class="mb-2">mdi-map-marker-off</v-icon><br />
            No saved addresses found
          </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-plus"
            block
            @click="
              () => {
                showAddressSelectionDialog = false;
                showAddressDialog = true;
              }
            "
          >
            Add New Address
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { ref, reactive, computed, onMounted, inject, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWalletStore } from "~/stores/wallet";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const route = useRoute();
const walletStore = useWalletStore();
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

// State
const addresses = ref<any[]>([]);
const selectedAddressId = ref<number | null>(null);
const paymentMethod = ref("COD");
const isGift = ref(false);
const addGst = ref(false);
const gstNumberInput = ref("");
const discount = ref(0);
const wholesalerDiscount = ref(0);
const wholesalerDiscountsMap = ref<Record<number, number>>({});
const appliedCouponId = ref<string>("");
const couponCode = ref("");
const applyingCoupon = ref(false);
const placingOrder = ref(false);

const showCouponsDialog = ref(false);
const coupons = ref<any[]>([]);
const loadingCoupons = ref(false);

const showGiftAddressDialog = ref(false);
const showAddressSelectionDialog = ref(false);

watch(isGift, (newVal) => {
  if (newVal) {
    showGiftAddressDialog.value = true;
  }
});

const onChangeAddressForGift = () => {
  showGiftAddressDialog.value = false;
  showAddressSelectionDialog.value = true;
};

const usePoints = computed(() => route.query.use_points === "true");

// Helper to safely parse strings to floats
const parseAmount = (val: any) => parseFloat((val || 0).toString());

const companyFees = computed(() => {
  const company = authStore.user?.companies?.[0];
  return {
    deliveryCharges: parseAmount(company?.deliveryCharges || 0),
    packagingCharges: parseAmount(company?.packagingCharges || 0),
    platformFee: parseAmount(company?.platformFee || 0),
  };
});

const walletUsed = computed(() => {
  if (!usePoints.value || authStore.activeRole === "Distributor") return 0;
  const total = cartStore.selectedTotalAmount;
  const itemTotal = (total / 105) * 100;
  const calculatedPoints = Math.round(itemTotal * 0.25);
  const availablePoints = walletStore.balance;
  return Math.min(calculatedPoints, availablePoints);
});

const totalPayable = computed(() => {
  const fees = companyFees.value;
  const subtotal = cartStore.selectedTotalAmount;
  const total =
    subtotal +
    fees.platformFee +
    fees.packagingCharges +
    fees.deliveryCharges -
    discount.value -
    wholesalerDiscount.value -
    walletUsed.value;
  return Math.max(0, total);
});

const selectedAddress = computed(() => {
  return (
    addresses.value.find((a: any) => a.id === selectedAddressId.value) || null
  );
});

const gstCalculations = computed(() => {
  const total = totalPayable.value;
  const gstAmount = total > 0 ? (total * 5) / 105 : 0;

  const isMaharashtra = selectedAddress.value?.state
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

// Address Dialog State
const showAddressDialog = ref(false);
const savingAddress = ref(false);
const addressFormValid = ref(false);
const newAddress = reactive({
  label: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  add_1: "",
  is_default: false,
});

const requiredRules = [(v: string) => !!v || "Required"];

// Methods
const fetchAddresses = async () => {
  const api = useApi();
  const response = await api.get("/user_addresses", {
    userId: authStore.user?.id,
  });
  if (response.success && response.data) {
    addresses.value = response.data;

    // Load saved address selection from localStorage if available
    if (typeof window !== "undefined") {
      const savedAddressIdStr = localStorage.getItem(
        "checkout_selected_address_id",
      );
      const savedAddressId = savedAddressIdStr
        ? parseInt(savedAddressIdStr, 10)
        : null;
      const hasSavedAddr =
        savedAddressId &&
        addresses.value.some((a: any) => a.id === savedAddressId);

      if (hasSavedAddr) {
        selectedAddressId.value = savedAddressId;
        return;
      }
    }

    // Auto-select default address
    const defaultAddr = addresses.value.find((a: any) => a.is_default);
    if (defaultAddr) selectedAddressId.value = defaultAddr.id;
    else if (addresses.value.length > 0)
      selectedAddressId.value = addresses.value[0].id;
  }
};

const saveAddress = async () => {
  if (!addressFormValid.value) return;

  savingAddress.value = true;
  const api = useApi();

  const response = await api.post("/user_addresses", {
    ...newAddress,
    user_id: authStore.user?.id,
  });

  savingAddress.value = false;

  if (response.success) {
    showAddressDialog.value = false;

    // Reset form fields
    newAddress.label = "";
    newAddress.city = "";
    newAddress.state = "";
    newAddress.pincode = "";
    newAddress.phone = "";
    newAddress.add_1 = "";
    newAddress.is_default = false;

    await fetchAddresses();
    showSnackbar("Address saved successfully", "success");
  } else {
    showSnackbar("Failed to save address", "error");
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
        // Basic coupon validation (can be expanded based on API fields)
        const cartTotal = cartStore.selectedTotalAmount;
        let couponVal = 0;

        if (coupon.type === "Percentage") {
          couponVal = cartTotal * (parseFloat(coupon.value) / 100);
        } else {
          couponVal = parseFloat(coupon.value);
        }

        // Apply
        discount.value = Math.min(couponVal, cartTotal); // Don't discount more than total
        appliedCouponId.value = coupon.id?.toString();
        showSnackbar(
          `Coupon applied! Savings: ₹${discount.value.toFixed(2)}`,
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
  discount.value = 0;
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

const placeOrder = async () => {
  if (!selectedAddressId.value) return;

  placingOrder.value = true;
  const api = useApi();

  // Helper to safely parse strings to floats
  const parseAmount = (val: any) => parseFloat((val || 0).toString());

  // Get fees from User Config (Company)
  const company = authStore.user?.companies?.[0];
  const gstNumber = addGst.value ? gstNumberInput.value : "";

  // Order Details Construction (matching Mobile App Flavour-Specific image logic and exact keys)
  const orderDetails = cartStore.selectedItems.map((item: any) => {
    const price = parseAmount(item.price);
    // Reverse GST calc: price is inclusive of 5% tax? Mobile logic: (price / 105) * 100
    const orderDetailCost = parseFloat(((price / 105) * 100).toFixed(2));

    // Determine image path (replicated flavor-specific selection logic from mobile app)
    const originalProduct = item.originalItem?.product;
    let productImagePath = "";
    const flavour = item.originalItem?.flavour;

    if (originalProduct && originalProduct.product_images && flavour) {
      try {
        const matchingImage = originalProduct.product_images.find(
          (img: any) => (img.unit?.name || img.unit_name) === flavour,
        );
        if (matchingImage) {
          productImagePath =
            matchingImage.image_path || matchingImage.imagepath || "";
        }
      } catch (e) {
        console.error("Error getting product flavor image:", e);
      }
    }

    // Fallback to primary image if flavor-specific image not found
    if (!productImagePath && originalProduct) {
      productImagePath =
        originalProduct.imagepath1 ||
        (originalProduct.product_images &&
        originalProduct.product_images.length > 0
          ? originalProduct.product_images[0].image_path ||
            originalProduct.product_images[0].imagepath
          : "");
    }

    // Fallback to item.productImage resolved from store
    if (!productImagePath) {
      productImagePath = item.productImage || "";
    }

    return {
      product_id: item.productId,
      quantity: item.quantity,
      order_detail_cost: orderDetailCost,
      product_pack: item.packId || item.pack, // Retain/send correct pack ID integer to map belongsTo relationship
      kind_of_flower: item.originalItem?.kind_of_flower || "",
      flavour: item.originalItem?.flavour || "",
      write_on_cake: item.originalItem?.write_on_cake || "",
      product_image_path: productImagePath,
      cashback: parseAmount(item.originalItem?.points || 0) * item.quantity,
    };
  });

  // Calculate order cost (sum of all order_detail_cost * qty) to match mobile orderCostSum exclusive of tax
  const orderCostTotal = orderDetails.reduce((sum: number, detail: any) => {
    return sum + detail.order_detail_cost * detail.quantity;
  }, 0);

  const fees = companyFees.value;

  // Fully aligned mobile app payload structure
  const payload = {
    user_id: authStore.user?.id,
    company_id: company?.id || 1,
    address_id: selectedAddressId.value,
    paymentmode: paymentMethod.value,
    payment_mode: paymentMethod.value, // Send both keys for safe API mapping
    is_gift: isGift.value,
    delivery_method: "Standard",
    gst_number: gstNumber,
    total_amount: totalPayable.value.toFixed(2),
    order_cost: orderCostTotal.toFixed(2),
    coupon_amount: discount.value.toFixed(2),
    coupon_id: appliedCouponId.value,
    wallet_amount_used: walletUsed.value.toFixed(2),
    wholesaler_discount_amount: wholesalerDiscount.value.toFixed(2),
    packaging_amount: fees.packagingCharges,
    delivery_amount: fees.deliveryCharges,
    platform_fee: fees.platformFee,
    tax_amount: gstCalculations.value.gstAmount.toFixed(2),
    tax_percent: "5",
    tip_amount: 0,
    total_cashback: 0,
    is_approved_by_hotelier: 0,
    is_dinein: 0,
    is_delivered: 0,
    is_delivery_boy_accepted: 0,
    store_payable_amount: 0,
    comission_amount: 0,
    order_statuses: [],
    details: "-",
    order_details: orderDetails,
    role: authStore.activeRole,
  };

  try {
    const response: any = await api.post("/orders", payload);
    const isSuccess =
      response.success ||
      response.status === "success" ||
      response.statusCode === 200 ||
      (response.data && response.data.id);

    if (isSuccess) {
      cartStore.clearCart();

      // Clear saved address and payment method from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("checkout_selected_address_id");
        localStorage.removeItem("checkout_payment_method");
      }

      const orderId = response.data?.id || response.id;
      if (paymentMethod.value === "PhonePe") {
        showSnackbar("Redirecting to PhonePe...", "info");
        router.push({
          path: "/payment/processing",
          query: { orderId: orderId, amount: finalTotalAmount.toFixed(2) },
        });
      } else {
        showSnackbar("Order placed successfully!", "success");
        if (orderId) {
          router.push({
            path: "/order-success",
            query: { orderId: orderId },
          });
        } else {
          router.push("/");
        }
      }
    } else {
      showSnackbar(response.message || "Failed to place order", "error");
    }
  } catch (e: any) {
    console.error("Order error:", e);
    showSnackbar(e.message || "Failed to place order", "error");
  }

  placingOrder.value = false;
};

const calculateWholesalerDiscount = () => {
  if (authStore.activeRole !== "Distributor") return;

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

  wholesalerDiscount.value = totalDiscount;
};

onMounted(async () => {
  // If the user refreshed the checkout page or accessed it directly without coming from the cart, redirect to cart page
  if (typeof window !== "undefined") {
    const fromCart = sessionStorage.getItem("navigated_from_cart");
    if (!fromCart) {
      router.push("/cart");
      return;
    }
    // Remove the flag so that any subsequent refresh of the checkout page redirects to `/cart`
    sessionStorage.removeItem("navigated_from_cart");
  }

  if (!authStore.isLoggedIn) {
    router.push("/login?redirect=/checkout");
    return;
  }

  // Load saved payment method from localStorage if available
  if (typeof window !== "undefined") {
    const savedPayment = localStorage.getItem("checkout_payment_method");
    if (savedPayment) {
      paymentMethod.value = savedPayment;
    }
  }

  if (cartStore.isEmpty) {
    await cartStore.fetchCart();
    if (cartStore.isEmpty) {
      router.push("/cart");
      return;
    }
  }

  await fetchAddresses();

  // Fetch wallets if not Distributor
  if (authStore.activeRole !== "Distributor" && usePoints.value) {
    try {
      await walletStore.fetchWallets();
    } catch (e) {
      console.error("Failed to fetch wallets", e);
    }
  }

  // Fetch Wholesaler Discounts if Distributor
  if (authStore.activeRole === "Distributor" && authStore.user?.id) {
    try {
      const api = useApi();
      const res: any = await api.get(`/users/${authStore.user.id}/discounts`);
      if (res.success && res.data) {
        const map: Record<number, number> = {};
        res.data.forEach((d: any) => {
          map[d.product_id] = parseFloat(d.discount);
        });
        wholesalerDiscountsMap.value = map;
        calculateWholesalerDiscount();
      }
    } catch (e) {
      console.error("Failed to fetch wholesaler discounts", e);
    }
  }

  // Auto-fill GST if user has it
  const company = authStore.user?.companies?.[0];
  if (company && company.gstNumber) {
    addGst.value = true;
    gstNumberInput.value = company.gstNumber;
  }

  calculateWholesalerDiscount();
});

watch(
  () => cartStore.selectedItems,
  () => {
    calculateWholesalerDiscount();
  },
  { deep: true },
);

// Save selected address and payment method to localStorage on change
watch(selectedAddressId, (newVal) => {
  if (typeof window !== "undefined") {
    if (newVal) {
      localStorage.setItem("checkout_selected_address_id", newVal.toString());
    } else {
      localStorage.removeItem("checkout_selected_address_id");
    }
  }
});

watch(paymentMethod, (newVal) => {
  if (typeof window !== "undefined" && newVal) {
    localStorage.setItem("checkout_payment_method", newVal);
  }
});

// MOV Logic combined
const isMovMet = computed(() => {
  if (authStore.activeRole !== "Distributor") return true;

  // Check if items are exclusively "Madani"
  const allMadani = cartStore.selectedItems.every((item) =>
    item.productName.toLowerCase().includes("madani"),
  );

  if (allMadani) return true;

  // Dynamic MOV from user company profile
  const cartTotal = cartStore.selectedTotalAmount;
  let minVal = 10000; // Default fallback

  if (authStore.user?.companies && authStore.user.companies.length > 0) {
    const companyMinVal = parseFloat(
      authStore.user.companies[0].min_order_value_distributor || "0",
    );
    if (companyMinVal > 0) {
      minVal = companyMinVal;
    }
  }

  return cartTotal >= minVal;
});

const movMessage = computed(() => {
  if (isMovMet.value) return "";
  return "Minimum order value for Distributors is ₹10,000 (unless purchasing only Madani products)";
});
</script>
