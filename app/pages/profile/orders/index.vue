<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-6">My Orders</h2>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <v-card v-else-if="orders.length === 0" class="pa-8 text-center" flat>
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-package-variant-closed
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No orders found</h3>
      <p class="text-grey mb-4">You haven't placed any orders yet</p>
      <v-btn color="primary" to="/products">Start Shopping</v-btn>
    </v-card>

    <!-- Orders List -->
    <div v-else class="d-flex flex-column ga-4">
      <v-card
        v-for="order in orders"
        :key="order.id"
        rounded="lg"
        variant="outlined"
        class="border-opacity-50"
      >
        <v-card-text>
          <div class="d-flex justify-space-between align-start mb-4">
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Order #{{ order.id }}
              </div>
              <div class="text-caption text-grey">
                Placed on {{ formatDate(order.created_at) }}
              </div>
            </div>
            <v-chip
              :color="getStatusColor(order.status)"
              size="small"
              label
              class="font-weight-bold"
            >
              {{ order.status }}
            </v-chip>
          </div>

          <v-divider class="mb-4" />

          <div class="mb-4">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="d-flex align-center py-2"
            >
              <v-avatar rounded="lg" size="48" class="mr-3 bg-grey-lighten-4">
                <v-img
                  :src="item.product_image || 'https://via.placeholder.com/48'"
                  cover
                />
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">
                  {{ item.product_name }}
                </div>
                <div class="text-caption text-grey">
                  Qty: {{ item.quantity }} × ₹{{ item.price }} | Pack:
                  {{ item.pack?.value }}
                </div>
              </div>
            </div>
          </div>

          <v-divider class="mb-4" />

          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-grey text-caption">Total Amount</span>
              <div class="text-subtitle-1 font-weight-bold text-primary">
                ₹{{ order.total_amount }}
              </div>
            </div>

            <v-btn
              variant="text"
              color="primary"
              append-icon="mdi-chevron-right"
              :to="`/profile/orders/${order.id}`"
            >
              View Details
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";

const authStore = useAuthStore();
const config = useRuntimeConfig();
const mediaBase = config.public.mediaBase as string;
const loading = ref(true);
const orders = ref<any[]>([]);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusColor = (status: string | null | undefined) => {
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
      return {
        id: detail.id,
        product_id: detail.product_id,
        product_name: detail.product?.name || "Product",
        product_image: resolveImage(
          detail.product_image_path ||
            detail.product?.product_images?.[0]?.image_path,
        ),
        quantity: detail.quantity,
        price: detail.order_detail_cost,
        pack: detail.product_pack,
      };
    });
    return {
      ...order,
      status: computedStatus,
      items,
    };
  });
};

const fetchOrders = async () => {
  loading.value = true;
  const api = useApi();

  const response = await api.get("/orders", { userId: authStore.user?.id });
  if (response.success && response.data) {
    orders.value = mapOrderDetailsToItems(response.data);
  }

  loading.value = false;
};

// Fetch orders reactively when the authenticated user is loaded/restored
watch(
  () => authStore.user?.id,
  (newUserId) => {
    if (newUserId) {
      fetchOrders();
    }
  },
  { immediate: true },
);
</script>
