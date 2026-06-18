<template>
  <v-footer class="bg-secondary pa-12 mt-auto" style="border-top: 1px solid rgba(255, 255, 255, 0.06) !important; background: #000000 !important;">
    <v-container>
      <v-row class="py-4">
        <!-- Brand -->
        <v-col cols="12" md="4" class="pr-md-8">
          <h3 class="logo-text mb-4 text-white" style="letter-spacing: 0.15em; text-transform: uppercase; font-size: 1.5rem !important; font-weight: 800 !important;">Aadab<span class="text-primary">.</span></h3>
          <p class="text-grey-lighten-1 mb-6" style="font-size: 0.875rem; line-height: 1.6; font-weight: 300;">
            Premium quality products delivered to your doorstep. Shop as a
            regular customer or become a distributor for wholesale prices.
          </p>
          <div class="d-flex ga-2">
            <v-btn icon variant="text" color="grey-lighten-1" size="small" class="social-btn">
              <v-icon size="20">mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="grey-lighten-1" size="small" class="social-btn">
              <v-icon size="20">mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="grey-lighten-1" size="small" class="social-btn">
              <v-icon size="20">mdi-twitter</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Quick Links -->
        <v-col cols="6" md="2">
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-6" style="letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.8rem !important;">
            QUICK LINKS
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
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-6" style="letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.8rem !important;">
            INFORMATION
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
          <h4 class="text-subtitle-1 font-weight-bold text-white mb-6" style="letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.8rem !important;">
            CONTACT US
          </h4>
          <div class="d-flex flex-column ga-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="accent" size="18">mdi-email-outline</v-icon>
              <span class="text-grey-lighten-1" style="font-size: 0.875rem;">support@aadab.com</span>
            </div>
            <div class="d-flex align-center ga-3">
              <v-icon color="accent" size="18">mdi-phone-outline</v-icon>
              <span class="text-grey-lighten-1" style="font-size: 0.875rem;">+91 1234567890</span>
            </div>
            <div class="d-flex align-start ga-3">
              <v-icon color="accent" size="18" class="mt-1">mdi-map-marker-outline</v-icon>
              <span class="text-grey-lighten-1" style="font-size: 0.875rem; line-height: 1.5; font-weight: 300;">
                123 Business Street,<br />
                City, State - 123456
              </span>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-8" color="grey-lighten-4" style="opacity: 0.1;" />

      <!-- Copyright -->
      <div class="text-center text-grey-lighten-2" style="font-size: 0.8rem; font-weight: 400; letter-spacing: 0.05em;">
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
  color: #c2c2c2;
  text-decoration: none;
  font-family: 'Urbanist', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  display: inline-block;
  transition: all 0.3s ease;
  font-weight: 300;
}

.footer-link:hover {
  color: var(--accent) !important;
  transform: translateX(4px);
}

.social-btn {
  transition: all 0.3s ease !important;
}

.social-btn:hover {
  color: var(--accent) !important;
  transform: translateY(-2px);
}
</style>
