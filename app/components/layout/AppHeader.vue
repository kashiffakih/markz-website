<template>
  <div>
    <!-- Role Switch Loading Overlay (Copied from Profile) -->
    <v-dialog
      v-model="switchingRole"
      persistent
      fullscreen
      transition="fade-transition"
    >
      <v-card
        color="white"
        class="d-flex align-center justify-center flex-column"
      >
        <v-avatar size="80" color="primary" class="mb-6 elevation-4">
          <v-icon size="40" color="white">mdi-account-sync</v-icon>
        </v-avatar>
        <h3 class="text-h5 font-weight-bold mb-2">Switching Profile...</h3>
        <p class="text-grey mb-6">
          Please wait while we switch your experience
        </p>
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          width="4"
        />
      </v-card>
    </v-dialog>

    <v-app-bar flat color="white" elevation="1">
      <v-container class="d-flex align-center">
        <!-- Logo -->
        <NuxtLink to="/" class="text-decoration-none">
          <div class="d-flex align-center">
            <span class="text-h5 font-weight-bold text-secondary">Aadab</span>
          </div>
        </NuxtLink>

        <v-spacer />

        <!-- Desktop Navigation -->
        <nav class="d-none d-md-flex align-center ga-4">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/products" class="nav-link">Products</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>

        <v-spacer />

        <!-- Search -->
        <v-card
          elevation="0"
          rounded="lg"
          class="search-card d-none d-md-flex mr-4"
          style="max-width: 300px; width: 100%"
        >
          <v-text-field
            v-model="searchQuery"
            density="compact"
            placeholder="Search products..."
            prepend-inner-icon="mdi-magnify"
            variant="plain"
            hide-details
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </v-card>

        <!-- Mobile Search Button -->
        <v-btn
          icon
          variant="text"
          class="d-md-none"
          @click="showMobileSearch = !showMobileSearch"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- Cart Icon -->
        <v-btn icon variant="text" @click="goToCart" class="mr-2">
          <v-badge
            :content="cartCount"
            :model-value="cartCount > 0"
            color="primary"
          >
            <v-icon>mdi-cart-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- User Menu / Login / Register (Client Only to avoid SSR/Hydration mismatches) -->
        <ClientOnly>
          <div class="d-none d-md-flex align-center">
            <template v-if="isLoggedIn">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text" class="d-flex align-center">
                    <v-avatar size="28" class="mr-2 elevation-1" color="grey-lighten-2">
                      <v-img
                        v-if="userAvatarUrl"
                        :src="userAvatarUrl"
                        cover
                      />
                      <span v-else class="text-caption font-weight-bold">
                        {{ displayName.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <span>{{ displayName }}</span>
                    <v-icon right>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item to="/profile">
                    <template v-slot:prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Profile</v-list-item-title>
                  </v-list-item>
                  <v-list-item to="/profile/orders">
                    <template v-slot:prepend>
                      <v-icon>mdi-package-variant</v-icon>
                    </template>
                    <v-list-item-title>My Orders</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="!isDistributor" to="/profile/wallet">
                    <template v-slot:prepend>
                      <v-icon>mdi-star-circle</v-icon>
                    </template>
                    <v-list-item-title>My Rewards</v-list-item-title>
                  </v-list-item>
                  <v-list-item to="/profile/wishlist">
                    <template v-slot:prepend>
                      <v-icon>mdi-heart</v-icon>
                    </template>
                    <v-list-item-title>Wishlist</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <!-- Role Switcher -->
                  <v-list-item
                    v-if="hasDistributorRole"
                    @click="toggleRole"
                    class="text-primary"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-account-switch</v-icon>
                    </template>
                    <v-list-item-title>
                      Switch to {{ isDistributor ? "User" : "Distributor" }}
                    </v-list-item-title>
                    <template v-slot:append>
                      <v-progress-circular
                        v-if="switchingRole"
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      />
                    </template>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="handleLogout" class="text-error">
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-logout</v-icon>
                    </template>
                    <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <!-- Login/Register (Not Logged In) -->
            <template v-else>
              <v-btn to="/login" variant="text" class="mr-2">
                Login
              </v-btn>
              <v-btn to="/register" color="primary">
                Register
              </v-btn>
            </template>
          </div>
          
          <template #fallback>
            <!-- Server placeholder to avoid layout shift -->
            <div class="d-none d-md-flex" style="width: 150px; height: 36px;"></div>
          </template>
        </ClientOnly>

        <!-- Mobile Menu Toggle -->
        <v-btn
          icon
          variant="text"
          class="d-md-none"
          @click="$emit('toggle-drawer')"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </v-container>

      <!-- Mobile Search Bar Expanded -->
      <v-expand-transition>
        <div
          v-if="showMobileSearch"
          class="d-md-none w-100 py-2 px-4 bg-white border-bottom"
        >
          <v-text-field
            v-model="searchQuery"
            placeholder="Search products..."
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="compact"
            hide-details
            autofocus
            class="mobile-search-field"
            rounded="lg"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append-inner>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="showMobileSearch = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </v-expand-transition>
    </v-app-bar>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";

const authStore = useAuthStore();
const cartStore = useCartStore();
const config = useRuntimeConfig();
const router = useRouter();

const userAvatarUrl = computed(() => {
  const path = authStore.user?.imagepath;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${config.public.mediaBase}${path}`;
});

// Debug & Refresh on mount
onMounted(() => {
  if (authStore.isLoggedIn && !authStore.user) {
    authStore.fetchUser();
  } else if (authStore.isLoggedIn) {
    // Background refresh to ensure fresh data
    authStore.fetchUser();
  }
});

const searchQuery = ref("");
const showMobileSearch = ref(false);
const switchingRole = ref(false);

// Computed
const isLoggedIn = computed(() => authStore.isLoggedIn);
const displayName = computed(() => authStore.displayName);
const isDistributor = computed(() => authStore.isDistributor);
const hasDistributorRole = computed(
  () => authStore.user?.roles?.some((r) => r.name === "Distributor") ?? false,
);
const cartCount = computed(() => cartStore.itemCount);

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery.value)}`);
    showMobileSearch.value = false;
  }
};

const goToCart = () => {
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }
  router.push("/cart");
};

const toggleRole = async () => {
  if (switchingRole.value) return;

  switchingRole.value = true;

  // Artificial delay for animation
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newRole = authStore.isDistributor ? "User" : "Distributor";
  const result = await authStore.switchRole(newRole);

  if (result.success) {
    // Fetch fresh data for the new role before hiding overlay
    await authStore.fetchUser();
  } else {
    // If failed, maybe revert UI thinking but for now just hide overlay
  }

  switchingRole.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

defineEmits(["toggle-drawer"]);
</script>

<style scoped>
.nav-link {
  color: #232323;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgba(238, 208, 86, 0.15);
  color: #eed056;
}

.search-card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.search-card:hover,
.search-card:focus-within {
  border-color: #eed056; /* Primary color */
  box-shadow: 0 0 0 2px rgba(238, 208, 86, 0.2) !important;
}

.search-input :deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.mobile-search-field :deep(.v-field) {
  border-radius: 8px;
}
</style>
