<template>
  <v-footer class="bg-secondary pa-8 mt-auto">
    <v-container>
      <v-row>
        <!-- Brand -->
        <v-col cols="12" md="4">
          <h3 class="text-h5 font-weight-bold text-white mb-4">Aadab</h3>
          <p class="text-grey-lighten-1 mb-4">
            Premium quality products delivered to your doorstep. Shop as a
            regular customer or become a distributor for wholesale prices.
          </p>
          <div class="d-flex ga-2">
            <v-btn icon variant="text" color="grey-lighten-1">
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="grey-lighten-1">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="grey-lighten-1">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Quick Links -->
        <v-col cols="6" md="2">
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-4">
            Quick Links
          </h4>
          <div class="d-flex flex-column ga-2">
            <NuxtLink to="/" class="footer-link">Home</NuxtLink>
            <NuxtLink to="/products" class="footer-link">Products</NuxtLink>
            <NuxtLink to="/cart" class="footer-link">Cart</NuxtLink>
            <NuxtLink to="/profile" class="footer-link">My Account</NuxtLink>
          </div>
        </v-col>

        <!-- Information -->
        <v-col cols="6" md="2">
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-4">
            Information
          </h4>
          <div class="d-flex flex-column ga-2">
            <NuxtLink to="/terms" class="footer-link"
              >Terms & Conditions</NuxtLink
            >
            <NuxtLink to="/refund-policy" class="footer-link"
              >Refund Policy</NuxtLink
            >
            <NuxtLink to="/contact" class="footer-link">Contact Us</NuxtLink>
          </div>
        </v-col>

        <!-- Contact -->
        <v-col cols="12" md="4">
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-4">
            Contact Us
          </h4>
          <div class="d-flex flex-column ga-3">
            <div class="d-flex align-center ga-2">
              <v-icon color="primary" size="small">mdi-email</v-icon>
              <span class="text-grey-lighten-1">support@aadab.com</span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon color="primary" size="small">mdi-phone</v-icon>
              <span class="text-grey-lighten-1">+91 1234567890</span>
            </div>
            <div class="d-flex align-start ga-2">
              <v-icon color="primary" size="small">mdi-map-marker</v-icon>
              <span class="text-grey-lighten-1">
                123 Business Street,<br />
                City, State - 123456
              </span>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6" color="grey-darken-2" />

      <!-- Copyright -->
      <div class="text-center text-grey-lighten-1">
        <p>© {{ currentYear }} Aadab. All rights reserved.</p>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer-link {
  color: #bdbdbd;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #eed056;
}
</style>
