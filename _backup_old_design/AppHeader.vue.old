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

    <v-app-bar flat class="glass-header" style="border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important; box-shadow: 0 4px 30px -10px rgba(0,0,0,0.02) !important;" height="75">
      <v-container class="d-flex align-center justify-space-between position-relative py-0 px-4" fluid style="height: 100%; max-width: 1400px; margin: 0 auto;">
        <!-- Left Side: Desktop Nav / Mobile Menu Toggle -->
        <div class="d-flex align-center" style="min-width: 250px;">
          <!-- Mobile Menu Toggle -->
          <v-btn
            icon
            variant="text"
            class="d-md-none mr-2"
            @click="$emit('toggle-drawer')"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          
          <!-- Desktop Navigation -->
          <nav class="d-none d-md-flex align-center ga-6">
            <NuxtLink to="/" class="nav-link">Home</NuxtLink>
            <NuxtLink to="/products" class="nav-link">Products</NuxtLink>
            <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
          </nav>
        </div>

        <!-- Center: Logo -->
        <div class="logo-container">
          <NuxtLink to="/" class="text-decoration-none">
            <span class="logo-text">Aadab<span class="text-primary">.</span></span>
          </NuxtLink>
        </div>

        <!-- Right Side: Search, Cart, User Menu -->
        <div class="d-flex align-center justify-end ga-2" style="min-width: 250px;">
          <!-- Desktop Search -->
          <v-card
            elevation="0"
            class="search-card d-none d-md-flex mr-2"
            style="width: 200px;"
          >
            <v-text-field
              v-model="searchQuery"
              density="compact"
              placeholder="Search..."
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

          <!-- Cart Button -->
          <v-btn variant="text" @click="goToCart" class="text-caption font-weight-bold tracking-wider px-3 mr-1">
            <v-icon start size="18" class="mr-1">mdi-cart-outline</v-icon>
            CART ({{ cartCount }})
          </v-btn>

          <!-- User Menu / Login / Register (Client Only to avoid SSR/Hydration mismatches) -->
          <ClientOnly>
            <div class="d-none d-md-flex align-center">
              <template v-if="isLoggedIn">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" class="d-flex align-center px-3 font-weight-bold text-caption tracking-wider">
                      ACCOUNT
                      <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="py-2" style="border-radius: 12px !important; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;">
                    <v-list-item to="/profile" density="comfortable">
                      <template v-slot:prepend>
                        <v-icon size="20" class="mr-2">mdi-account-outline</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">Profile</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/profile/orders" density="comfortable">
                      <template v-slot:prepend>
                        <v-icon size="20" class="mr-2">mdi-package-variant-closed</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">My Orders</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!isDistributor" to="/profile/wallet" density="comfortable">
                      <template v-slot:prepend>
                        <v-icon size="20" class="mr-2">mdi-wallet-outline</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">My Rewards</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/profile/wishlist" density="comfortable">
                      <template v-slot:prepend>
                        <v-icon size="20" class="mr-2">mdi-heart-outline</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">Wishlist</v-list-item-title>
                    </v-list-item>
                    <v-divider class="my-1" />
                    <!-- Role Switcher -->
                    <v-list-item
                      v-if="hasDistributorRole"
                      @click="toggleRole"
                      class="text-primary"
                      density="comfortable"
                    >
                      <template v-slot:prepend>
                        <v-icon size="20" class="mr-2">mdi-account-switch-outline</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-semibold">
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
                    <v-divider v-if="hasDistributorRole" class="my-1" />
                    <v-list-item @click="handleLogout" class="text-error" density="comfortable">
                      <template v-slot:prepend>
                        <v-icon color="error" size="20" class="mr-2">mdi-logout</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-semibold">Logout</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <!-- Login/Register (Not Logged In) -->
              <template v-else>
                <v-btn to="/login" variant="text" size="small" class="font-weight-bold text-caption tracking-wider px-3">
                  ACCOUNT
                </v-btn>
              </template>
            </div>
            
            <template #fallback>
              <!-- Server placeholder to avoid layout shift -->
              <div class="d-none d-md-flex" style="width: 150px; height: 36px;"></div>
            </template>
          </ClientOnly>
        </div>
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
  color: var(--secondary);
  text-decoration: none;
  font-family: "Urbanist", sans-serif;
  font-weight: 700;
  font-size: 0.825rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 6px 2px;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover {
  color: var(--accent);
  background-color: transparent !important;
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.logo-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  pointer-events: auto;
  z-index: 10;
}

.logo-text {
  font-family: "Urbanist", sans-serif !important;
  color: var(--secondary) !important;
  font-weight: 800 !important;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 1.6rem;
}

.search-card {
  border: 1px solid var(--border-color) !important;
  background: #ffffff !important;
  border-radius: 9999px !important;
  padding: 0 16px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.search-card:hover,
.search-card:focus-within {
  border-color: var(--accent) !important;
  box-shadow: 0 4px 12px rgba(229, 94, 94, 0.08) !important;
}

.search-input :deep(.v-field__input) {
  padding-top: 6px;
  padding-bottom: 6px;
  font-size: 0.85rem;
}

.mobile-search-field :deep(.v-field) {
  border: 1px solid var(--border-color) !important;
  background: #ffffff !important;
  border-radius: 9999px !important;
}
</style>
