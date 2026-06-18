<template>
  <v-container class="py-8">
    <v-row>
      <!-- Sidebar -->
      <v-col cols="12" md="3">
        <ClientOnly>
          <div>
            <v-card rounded="lg" class="mb-4">
              <v-list>
                <v-list-item
                  :prepend-avatar="userAvatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authStore.displayName) + '&background=C5A850&color=fff'"
                  :title="authStore.displayName"
                  :subtitle="authStore.user?.email"
                  class="pb-4"
                />
                <v-divider />
                <v-list-item
                  v-for="(item, i) in menuItems"
                  :key="i"
                  :to="item.to"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  exact
                  color="primary"
                  rounded="lg"
                  class="ma-2"
                />

                <!-- Admin items if user has admin role (optional future proofing) -->

                <v-divider class="my-2" />

                <v-list-item
                  prepend-icon="mdi-logout"
                  title="Logout"
                  color="error"
                  class="text-error ma-2"
                  @click="handleLogout"
                />
              </v-list>
            </v-card>

            <!-- Role Status Card -->
            <v-card rounded="lg" color="primary" variant="tonal" class="pa-4">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Current Role</h3>
              <div class="d-flex align-center justify-space-between">
                <v-chip color="primary" label>
                  {{ authStore.activeRole }}
                </v-chip>
                <v-icon color="primary">
                  {{ authStore.isDistributor ? "mdi-store" : "mdi-account" }}
                </v-icon>
              </div>
              <p class="text-caption mt-2 text-grey-darken-1">
                {{
                  authStore.isDistributor
                    ? "You are viewing wholesale prices."
                    : "You are viewing retail prices."
                }}
              </p>
            </v-card>
          </div>

          <template #fallback>
            <v-card rounded="lg" class="mb-4 pa-8 text-center">
              <v-progress-circular indeterminate color="primary" />
            </v-card>
          </template>
        </ClientOnly>
      </v-col>

      <!-- Content -->
      <v-col cols="12" md="9">
        <NuxtPage />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { computed } from "vue";

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();

const userAvatarUrl = computed(() => {
  const path = authStore.user?.imagepath;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${config.public.mediaBase}${path}`;
});

const menuItems = computed(() => {
  const items = [
    { title: "Profile", icon: "mdi-account-outline", to: "/profile" },
    { title: "My Orders", icon: "mdi-package-variant", to: "/profile/orders" },
    {
      title: "Saved Addresses",
      icon: "mdi-map-marker-outline",
      to: "/profile/addresses",
    },
    { title: "My Reviews", icon: "mdi-comment-text-multiple-outline", to: "/profile/reviews" },
    { title: "Wishlist", icon: "mdi-heart-outline", to: "/profile/wishlist" },
  ];

  if (!authStore.isDistributor) {
    items.push({
      title: "My Rewards",
      icon: "mdi-star-circle",
      to: "/profile/wallet",
    });
  }

  items.push({
    title: "Notifications",
    icon: "mdi-bell-outline",
    to: "/profile/notifications",
  });

  return items;
});

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push("/login");
  }
});
</script>
