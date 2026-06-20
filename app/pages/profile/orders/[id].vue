<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center">
        <v-btn icon variant="text" to="/profile/orders" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-bold">Order Details</h2>
      </div>

      <v-chip
        v-if="order"
        :color="getStatusColor(order.status)"
        label
        class="font-weight-bold"
      >
        {{ order.status }}
      </v-chip>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="order">
      <v-row>
        <!-- Order info -->
        <v-col cols="12" md="8">
          <!-- Items -->
          <v-card class="mb-4" rounded="lg">
            <v-card-title class="bg-grey-lighten-4 py-3">
              Items Ordered
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list lines="two">
                <template v-for="(item, i) in order.items" :key="item.id">
                  <v-list-item class="py-3">
                    <template v-slot:prepend>
                      <v-avatar
                        rounded="lg"
                        size="60"
                        class="bg-grey-lighten-4"
                      >
                        <v-img
                          :src="
                            item.product_image ||
                            'https://via.placeholder.com/60'
                          "
                          cover
                        />
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-bold">
                      {{ item.product_name }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text-grey">
                      <!-- <span v-if="item.pack?.value"
                        >Pack: {{ item.pack?.value }}</span
                      > -->
                      <span v-if="item.kind_of_flower">
                        Size: {{ item.kind_of_flower }}</span
                      >
                      <span v-if="item.flavour">
                        | Colour: {{ item.flavour }}</span
                      >
                      <span> | Qty: {{ item.quantity }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-if="item.write_on_cake"
                      class="text-caption text-primary font-weight-medium mt-1"
                    >
                      <v-icon size="x-small" start>mdi-pen</v-icon> Message: "{{
                        item.write_on_cake
                      }}"
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-if="order.status?.toLowerCase() === 'delivered' && !item.is_reviewed"
                      class="mt-2"
                    >
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-star"
                        @click="openReviewModal(item)"
                        class="rounded-lg font-weight-bold"
                        density="comfortable"
                      >
                        Rate & Review
                      </v-btn>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <div class="text-right">
                        <div
                          class="text-subtitle-2 font-weight-bold text-primary"
                        >
                          ₹{{ item.price * item.quantity }}
                        </div>
                        <div class="text-caption text-grey">
                          ₹{{ item.price }} / unit
                        </div>
                      </div>
                    </template>
                  </v-list-item>
                  <v-divider v-if="i < order.items.length - 1" />
                </template>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Shipping Address -->
          <v-card class="mb-4" rounded="lg">
            <v-card-title class="bg-grey-lighten-4 py-3">
              Delivery Information
            </v-card-title>
            <v-card-text class="pa-4">
              <template v-if="order.address">
                <div class="text-subtitle-1 font-weight-bold mb-1 text-primary">
                  {{
                    order.address.label ||
                    order.address.address_name ||
                    "Delivery Address"
                  }}
                </div>
                <div
                  class="text-body-2 font-weight-bold mb-1"
                  v-if="order.address.full_name || order.address.name"
                >
                  {{ order.address.full_name || order.address.name }}
                </div>
                <p
                  class="text-body-2 mb-1"
                  v-if="order.address.add_1 || order.address.address"
                >
                  {{ order.address.add_1 || order.address.address }}
                  <span v-if="order.address.add_2"
                    >, {{ order.address.add_2 }}</span
                  >
                  <span v-if="order.address.add_3"
                    >, {{ order.address.add_3 }}</span
                  >
                </p>
                <p
                  class="text-body-2 mb-1"
                  v-if="
                    order.address.city ||
                    order.address.state ||
                    order.address.pincode
                  "
                >
                  <span v-if="order.address.city">{{
                    order.address.city
                  }}</span>
                  <span v-if="order.address.state"
                    >, {{ order.address.state }}</span
                  >
                  <span v-if="order.address.pincode || order.address.pin_code">
                    -
                    {{ order.address.pincode || order.address.pin_code }}</span
                  >
                </p>
                <div
                  class="d-flex align-center text-caption text-grey mt-2"
                  v-if="
                    order.address.phone ||
                    order.address.mobile ||
                    order.address.alt_phone
                  "
                >
                  <v-icon size="small" start>mdi-phone</v-icon>
                  {{
                    order.address.phone ||
                    order.address.mobile ||
                    order.address.alt_phone
                  }}
                </div>
              </template>
              <template v-else>
                <div class="text-subtitle-1 text-grey font-weight-medium">
                  Self Pickup / No shipping address assigned
                </div>
              </template>

              <!-- Gift Alert Badge -->
              <v-alert
                v-if="order.is_gift"
                type="info"
                color="secondary"
                variant="tonal"
                density="compact"
                icon="mdi-gift-outline"
                class="mt-3 font-weight-bold text-caption"
              >
                This order is marked as a Gift!
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Summary -->
        <v-col cols="12" md="4">
          <v-card rounded="lg">
            <v-card-title class="bg-grey-lighten-4 py-3">
              Order Summary
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Order ID</span>
                <span class="font-weight-medium">#{{ order.id }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Date</span>
                <span class="font-weight-medium">{{
                  formatDate(order.created_at)
                }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Payment Method</span>
                <span class="font-weight-medium">{{
                  order.payment_method
                }}</span>
              </div>
              <v-divider class="my-3" />

              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Item Total</span>
                <span>₹{{ orderCost }}</span>
              </div>
              <template v-if="isMaharashtra">
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-grey">CGST 2.5%</span>
                  <span>₹{{ cgst }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-grey">SGST 2.5%</span>
                  <span>₹{{ sgst }}</span>
                </div>
              </template>
              <template v-else>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-grey">IGST 5%</span>
                  <span>₹{{ igst }}</span>
                </div>
              </template>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Delivery Charge</span>
                <span
                  :class="
                    deliveryCharge === 0 ? 'text-success font-weight-bold' : ''
                  "
                >
                  {{
                    deliveryCharge === 0
                      ? "Free"
                      : `₹${deliveryCharge.toFixed(2)}`
                  }}
                </span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-grey">Packing Charge</span>
                <span>₹{{ packagingCharge.toFixed(2) }}</span>
              </div>
              <div
                v-if="platformFee > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span class="text-grey">Platform Fee</span>
                <span>₹{{ platformFee.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2 text-success">
                <span>Coupon Value</span>
                <span>- ₹{{ couponDiscount.toFixed(2) }}</span>
              </div>
              <div
                v-if="authStore.activeRole !== 'Distributor'"
                class="d-flex justify-space-between mb-2 text-success"
              >
                <span>Reward Applied</span>
                <span>- ₹{{ walletUsed.toFixed(2) }}</span>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between">
                <span class="text-h6 font-weight-bold">Grand Total</span>
                <span class="text-h6 font-weight-bold text-primary">
                  ₹{{ totalAmount }}
                </span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Action Buttons (Track, Invoice, Cancel) -->
          <div class="mt-4 d-flex flex-column ga-2">
            <!-- Track Delhivery Shipment -->
            <v-btn
              v-if="order.delhivery_waybill"
              block
              color="primary"
              variant="flat"
              prepend-icon="mdi-truck-delivery-outline"
              :href="`https://www.delhivery.com/track/package/${order.delhivery_waybill}`"
              target="_blank"
              class="font-weight-bold rounded-lg"
            >
              Track Delhivery Shipment
            </v-btn>

            <!-- Download Invoice -->
            <v-btn
              v-if="order.status?.toLowerCase() === 'delivered'"
              block
              variant="outlined"
              color="primary"
              prepend-icon="mdi-file-document-outline"
              @click="downloadInvoice"
              :loading="downloadingInvoice"
              class="font-weight-bold rounded-lg"
            >
              Download Invoice
            </v-btn>

            <!-- Cancel Order -->
            <v-btn
              v-if="canCancel"
              block
              color="error"
              variant="flat"
              prepend-icon="mdi-close-circle-outline"
              @click="showCancelDialog = true"
              class="font-weight-bold rounded-lg animate-hover"
            >
              Cancel Order
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Write Review Dialog -->
    <v-dialog v-model="showReviewDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title
          class="d-flex justify-space-between align-center px-4 py-3"
        >
          <span class="text-h6 font-weight-bold">Write a Review</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="compact"
            @click="showReviewDialog = false"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <div class="font-weight-medium mb-4 text-center">
            Reviewing:
            <span class="text-primary font-weight-bold">{{
              selectedReviewItem?.product_name
            }}</span>
          </div>

          <div class="text-center mb-4">
            <div class="text-subtitle-1 mb-2">
              How would you rate this product?
            </div>
            <v-rating
              v-model="newReview.rating"
              color="warning"
              hover
              size="large"
            ></v-rating>
          </div>

          <v-textarea
            v-model="newReview.description"
            label="Your Review"
            variant="outlined"
            placeholder="Tell others what you think about this product..."
            rows="4"
            auto-grow
          ></v-textarea>

          <!-- Multiple Attachment Input -->
          <div class="mt-2">
            <div class="text-caption font-weight-bold text-grey-darken-1 mb-2">Upload Product Images (Optional)</div>
            <v-file-input
              v-model="newReview.images"
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

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showReviewDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="submitting"
            :disabled="!isValid"
            @click="submitReview"
            class="rounded-lg"
          >
            Submit Review
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Order Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="450">
      <v-card rounded="xl" class="pa-4">
        <v-card-title
          class="text-h6 font-weight-bold text-error d-flex align-center ga-2 px-0 pt-0"
        >
          <v-icon color="error">mdi-alert-circle-outline</v-icon>
          Cancel Order
        </v-card-title>
        <v-card-text class="pa-0 pt-2 text-body-1">
          Are you sure you want to cancel this order? This action cannot be
          undone and will restore stock items.
        </v-card-text>
        <v-card-actions class="justify-end px-0 pb-0 pt-4 gap-2">
          <v-btn
            variant="text"
            @click="showCancelDialog = false"
            class="rounded-lg"
          >
            No, Keep Order
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="cancelling"
            @click="handleCancelOrder"
            class="rounded-lg font-weight-bold"
          >
            Yes, Cancel Order
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { useAuthStore } from "~/stores/auth";

const config = useRuntimeConfig();
const mediaBase = config.public.mediaBase as string;

const route = useRoute();
const authStore = useAuthStore();
const showSnackbar = inject<any>("showSnackbar");

const loading = ref(true);
const order = ref<any>(null);

// Cost breakdown computed properties matching mobile app implementation
const isMaharashtra = computed(() => {
  return order.value?.address?.state?.toLowerCase() === "maharashtra";
});

const orderCost = computed(() => {
  return parseFloat(order.value?.order_cost || "0").toFixed(2);
});

const taxAmount = computed(() => {
  return parseFloat(order.value?.tax_amount || "0");
});

const cgst = computed(() => {
  return (taxAmount.value / 2).toFixed(2);
});

const sgst = computed(() => {
  return (taxAmount.value / 2).toFixed(2);
});

const igst = computed(() => {
  return taxAmount.value.toFixed(2);
});

const deliveryCharge = computed(() => {
  return parseFloat(order.value?.delivery_amount || "0");
});

const packagingCharge = computed(() => {
  return parseFloat(order.value?.packaging_amount || "0");
});

const platformFee = computed(() => {
  return parseFloat(order.value?.platform_fee || "0");
});

const couponDiscount = computed(() => {
  return parseFloat(order.value?.coupon_amount || "0");
});

const walletUsed = computed(() => {
  return parseFloat(order.value?.wallet_amount_used || "0");
});

const totalAmount = computed(() => {
  return parseFloat(order.value?.total_amount || "0").toFixed(2);
});

const showReviewDialog = ref(false);
const submitting = ref(false);
const selectedReviewItem = ref<any>(null);

const newReview = ref({
  rating: 0,
  description: "",
  images: [] as File[],
});

const isValid = computed(() => {
  return (
    newReview.value.rating > 0 && newReview.value.description.trim().length > 0
  );
});

const openReviewModal = (item: any) => {
  selectedReviewItem.value = item;
  newReview.value = {
    rating: 0,
    description: "",
    images: [] as File[],
  };
  showReviewDialog.value = true;
};

const submitReview = async () => {
  if (!selectedReviewItem.value) return;

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("userId", authStore.user!.id.toString());
    formData.append(
      "productId",
      selectedReviewItem.value.product_id.toString(),
    );
    let pPackId = "null";
    if (selectedReviewItem.value.product_pack) {
      pPackId = typeof selectedReviewItem.value.product_pack === 'object' 
        ? selectedReviewItem.value.product_pack.id?.toString() || "null"
        : selectedReviewItem.value.product_pack.toString();
    }
    
    formData.append("product_pack_id", pPackId);
    formData.append("rating", newReview.value.rating.toString());
    formData.append("description", newReview.value.description);

    // Append attachments for image updates
    if (newReview.value.images && newReview.value.images.length > 0) {
      newReview.value.images.forEach((file: File) => {
        formData.append("attachments[]", file);
      });
    }

    const api = useApi();
    const response: any = await api.post("/review", formData);

    if (response && response.success) {
      showSnackbar("Review submitted successfully!", "success");
      showReviewDialog.value = false;
      if (selectedReviewItem.value) {
        selectedReviewItem.value.is_reviewed = true;
      }
    } else {
      showSnackbar(response?.message || "Failed to submit review.", "error");
    }
  } catch (e: any) {
    console.error("Error submitting review:", e);
    showSnackbar(e.message || "An error occurred. Please try again.", "error");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "grey";
  }
};

const canCancel = computed(() => {
  if (!order.value) return false;
  const status = String(order.value.status || "").toLowerCase();
  console.log("canCancel status:", status, "order:", order.value);
  return (
    status.includes("pending") ||
    status.includes("place") ||
    status.includes("processing") ||
    status === "1" || // Assuming 1 is pending/placed
    status === "2" ||
    status === "4"
  );
});

const downloadingInvoice = ref(false);
const downloadInvoice = async () => {
  if (!order.value) return;
  downloadingInvoice.value = true;
  try {
    const authStore = useAuthStore();
    const api = useApi();
    
    let defaultAddress = null;
    const response = await api.get("/user_addresses", { userId: authStore.user?.id });
    if (response.success && response.data) {
      defaultAddress = response.data.find((a: any) => a.is_default === 1 || a.is_default === true) || response.data[0] || null;
    }
    
    const { generateInvoice } = await import("~/utils/invoiceService");
    await generateInvoice(order.value, defaultAddress);
  } catch (error: any) {
    console.error("Error downloading invoice:", error);
    showSnackbar(`Failed to download invoice: ${error?.message || error}`, "error");
  } finally {
    downloadingInvoice.value = false;
  }
};

const cancelling = ref(false);
const showCancelDialog = ref(false);

const handleCancelOrder = async () => {
  if (!order.value) return;
  cancelling.value = true;
  try {
    const api = useApi();
    const response: any = await api.post(
      `/orders/${order.value.id}/order_statuses`,
      {
        status_id: '8', // Cancelled status ID
        date: new Date().toISOString(),
      },
    );

    if (response && (response.success === true || response.status === 'success' || (response.data && response.data.id))) {
      showSnackbar("Order cancelled successfully!", "success");
      showCancelDialog.value = false;
      await fetchOrderDetails();
    } else {
      showSnackbar(response?.message || "Failed to cancel order.", "error");
    }
  } catch (e: any) {
    console.error("Error cancelling order:", e);
    showSnackbar(
      e.message || "An error occurred while cancelling the order.",
      "error",
    );
  } finally {
    cancelling.value = false;
  }
};

const mapOrderDetailsToItems = (ordersList: any[]) => {
  const resolveImage = (path: string | undefined) => {
    if (!path) return "https://via.placeholder.com/100?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${mediaBase}${path}`;
  };

  return ordersList.map((order: any) => {
    let computedStatus = order.status;
    if (order.order_statuses && order.order_statuses.length > 0) {
      const lastStatus = order.order_statuses[order.order_statuses.length - 1];
      if (lastStatus.status && lastStatus.status.name) {
        computedStatus = lastStatus.status.name;
      }
    }

    if (!computedStatus || computedStatus === "null" || computedStatus.trim() === "") {
      computedStatus = "Order placed";
    }

    const items = (order.order_details || []).map((detail: any) => {
      // Resolve product pack matching
      const rawPack = detail.product_pack;
      const packId = typeof rawPack === 'object' && rawPack !== null ? rawPack.id : rawPack;
      
      const matchingPack = detail.product?.product_packs?.find(
        (p: any) => p.id == packId || p.product_pack == packId,
      );

      return {
        id: detail.id,
        product_id: detail.product_id,
        product_name: detail.product?.name || "Product",
        product_image: resolveImage(
          detail.product_image_path ||
            detail.product?.product_images?.[0]?.image_path,
        ),
        quantity: detail.quantity,
        price:
          detail.quantity > 0
            ? parseFloat(detail.order_detail_cost) / detail.quantity
            : parseFloat(detail.order_detail_cost || 0),
        pack: matchingPack || { value: detail.product_pack },
        product_pack: detail.product_pack,
        flavour: detail.flavour,
        kind_of_flower: detail.kind_of_flower,
        write_on_cake: detail.write_on_cake,
        is_reviewed: false,
      };
    });
    return {
      ...order,
      status: computedStatus,
      items,
    };
  });
};

const fetchOrderDetails = async () => {
  loading.value = true;
  const api = useApi();
  const orderId = route.params.id;

  const response = await api.get(`/orders/${orderId}`);
  if (response.success && response.data) {
    const mapped = mapOrderDetailsToItems([response.data]);
    order.value = mapped[0];

    // Fetch user reviews to determine if items are already reviewed
    if (authStore.user?.id) {
      const reviewsResponse: any = await api.post("/review", {
        userId: authStore.user.id,
        isOnlyFetch: 1,
      });
      if (reviewsResponse && reviewsResponse.success && reviewsResponse.data) {
        const userReviews = reviewsResponse.data;
        if (order.value?.items) {
          order.value.items.forEach((item: any) => {
            const rawPack = item.product_pack;
            const packId = typeof rawPack === 'object' && rawPack !== null 
              ? String(rawPack.id) 
              : (rawPack !== undefined && rawPack !== null ? String(rawPack) : 'null');
              
            const hasReviewed = userReviews.some((review: any) => {
              if (review.product_id != item.product_id) return false;
              
              const rPackRaw = review.product_pack_id;
              const reviewPackId = (rPackRaw === null || rPackRaw === undefined) ? 'null' : String(rPackRaw);
              
              const isMatch = reviewPackId === packId;
              if (isMatch) {
                console.log(`Matched review for product ${item.product_id} with pack ${packId}`);
              }
              return isMatch;
            });
            console.log(`Item ${item.product_id} (pack: ${packId}) hasReviewed: ${hasReviewed}`);
            if (hasReviewed) {
              item.is_reviewed = true;
            }
          });
        }
      }
    }
  }

  loading.value = false;
};

onMounted(() => {
  fetchOrderDetails();
});
</script>
