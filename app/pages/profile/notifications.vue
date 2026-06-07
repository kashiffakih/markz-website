<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-6">Notifications</h2>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="notifications.length === 0"
      class="pa-8 text-center"
      flat
    >
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-bell-off
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No notifications</h3>
      <p class="text-grey">You have no new notifications</p>
    </v-card>

    <!-- Notification List -->
    <div v-else class="d-flex flex-column ga-2">
      <v-card
        v-for="notification in notifications"
        :key="notification.id"
        rounded="lg"
        :variant="notification.read ? 'outlined' : 'elevated'"
        :class="{ 'bg-yellow-lighten-5': !notification.read }"
        @click="markAsRead(notification.id)"
      >
        <v-card-text>
          <div class="d-flex align-start">
            <v-avatar color="primary" variant="tonal" size="40" class="mr-4">
              <v-icon color="primary">mdi-bell</v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-1">
                <h3 class="text-subtitle-1 font-weight-bold">
                  {{ notification.title }}
                </h3>
                <span class="text-caption text-grey">
                  {{ formatDate(notification.created_at) }}
                </span>
              </div>

              <p class="text-body-2 text-grey-darken-1">
                {{ notification.message }}
              </p>

              <v-chip
                v-if="!notification.read"
                size="x-small"
                color="primary"
                class="mt-2"
              >
                New
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true);
const notifications = ref<any[]>([]);

const formatDate = (dateString: string) => {
  // Simple relative time or date format
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

const fetchNotifications = async () => {
  loading.value = true;
  const api = useApi();

  // Simulated endpoint
  try {
    const response = await api.get("/notifications");
    if (response.success && response.data) {
      notifications.value = response.data;
    } else {
      // Fallback data for demo if API empty
      /*
      notifications.value = [
        { id: 1, title: 'Welcome to Aadab', message: 'Thanks for joining us!', created_at: new Date().toISOString(), read: false },
        { id: 2, title: 'Order Shipped', message: 'Your order #1234 has been shipped.', created_at: new Date().toISOString(), read: true }
      ]
      */
    }
  } catch (e) {
    console.error(e);
  }

  loading.value = false;
};

const markAsRead = async (id: number) => {
  const notification = notifications.value.find((n) => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    const api = useApi();
    await api.post(`/notifications/${id}/read`);
  }
};

onMounted(() => {
  fetchNotifications();
});
</script>
