<template>
  <v-app>
    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="drawer" temporary location="left">
      <v-list>
        <v-list-item to="/" title="Home" prepend-icon="mdi-home" />
        <v-list-item to="/shop" title="Shop All" prepend-icon="mdi-shopping" />
        <v-list-item to="/categories" title="Categories" prepend-icon="mdi-view-grid-outline" />
        <v-list-item to="/sellers" title="Sellers" prepend-icon="mdi-storefront-outline" />
        <v-list-item to="/products" title="Aadab Collection" prepend-icon="mdi-hanger" />
        <v-list-item to="/cart" title="Cart" prepend-icon="mdi-cart" />
        <v-divider />
        <v-list-item to="/sell" title="Sell on Aadab" prepend-icon="mdi-store-plus-outline" />
        <v-list-item to="/reseller" title="Reseller Program" prepend-icon="mdi-account-cash-outline" />
        <v-list-item to="/about" title="About" prepend-icon="mdi-information-outline" />
        <v-list-item to="/faq" title="FAQs" prepend-icon="mdi-help-circle-outline" />
        <v-list-item to="/contact" title="Contact" prepend-icon="mdi-phone-outline" />
        <v-divider />
        <ClientOnly>
          <template v-slot:placeholder>
            <!-- Render dummy/loading items during SSR to maintain a smooth UI -->
            <v-list-item title="Loading..." prepend-icon="mdi-loading animate-spin" />
          </template>
          <div>
            <template v-if="isLoggedIn">
              <!-- Role Switcher -->
              <v-list-item
                v-if="hasMultipleRoles"
                @click="toggleRole"
                :title="`Switch to ${authStore.isDistributor ? 'User' : 'Distributor'}`"
                prepend-icon="mdi-account-switch"
                color="secondary"
              />
              <v-list-item
                v-else-if="!hasDistributorRole"
                to="/distributor/register"
                title="Become a Distributor"
                prepend-icon="mdi-store-plus"
                color="primary"
              />
              <v-divider class="my-2" />

              <v-list-item
                to="/profile"
                title="Profile"
                prepend-icon="mdi-account"
              />
              <v-list-item
                v-if="!authStore.isDistributor"
                to="/profile/wallet"
                title="My Rewards"
                prepend-icon="mdi-star-circle"
              />
              <v-list-item
                to="/profile/orders"
                title="My Orders"
                prepend-icon="mdi-package-variant"
              />
              <v-list-item
                to="/profile/wishlist"
                title="Wishlist"
                prepend-icon="mdi-heart"
              />
              <v-divider />
              <v-list-item
                @click="handleLogout"
                title="Logout"
                prepend-icon="mdi-logout"
              />
            </template>
            <template v-else>
              <v-list-item to="/login" title="Login" prepend-icon="mdi-login" />
              <v-list-item
                to="/register"
                title="Register"
                prepend-icon="mdi-account-plus"
              />
            </template>
          </div>
        </ClientOnly>
      </v-list>
    </v-navigation-drawer>

    <!-- Header -->
    <LayoutAppHeader @toggle-drawer="drawer = !drawer" />

    <!-- Main Content -->
    <v-main class="bg-background">
      <NuxtPage />
    </v-main>

    <!-- Footer -->
    <LayoutAppFooter />

    <!-- Mobile bottom navigation (hidden on desktop) -->
    <LayoutMobileBottomNav />

    <!-- Global Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";
import { useWishlistStore } from "@stores/wishlist";

const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(false);

const isLoggedIn = computed(() => authStore.isLoggedIn);

// Global snackbar state
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Provide snackbar to child components
provide("showSnackbar", (text: string, color: string = "success") => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
});

// Initialize auth on mount
onMounted(async () => {
  await authStore.init();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  if (authStore.isLoggedIn) {
    cartStore.fetchCart();
    wishlistStore.fetchWishlist();
  }
});

const handleLogout = () => {
  authStore.logout();
  drawer.value = false;
  router.push("/");
};

const hasDistributorRole = computed(() => {
  return authStore.user?.roles?.some((r) => r.name === "Distributor") || false;
});

const hasMultipleRoles = computed(() => {
  if (!authStore.user?.roles) return false;
  const roles = authStore.user.roles.map((r) => r.name);
  return roles.includes("User") && roles.includes("Distributor");
});

const toggleRole = async () => {
  const newRole = authStore.isDistributor ? "User" : "Distributor";
  const result = await authStore.switchRole(newRole);
  if (result.success) {
    // reload page or fetch fresh data
    window.location.reload();
  }
};
</script>

<style>
.bg-background {
  background-color: var(--background) !important;
}
</style>
