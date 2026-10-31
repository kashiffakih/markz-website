<template>
  <footer class="mk-footer">
    <div class="mk-container">
      <div class="mk-footer__grid">
        <div class="mk-footer__brand">
          <div class="mk-footer__logo">Aadab<span>.</span></div>
          <p style="margin-top:10px; max-width:360px; font-size:.88rem; line-height:1.7; color:#a9b9b0;">
            Aadab - The Fashion Zone. Ek marketplace jaha trusted sellers ke fashion aur lifestyle products ek hi jagah milte hain. Cash on delivery aur easy returns ke saath.
          </p>
          <div style="display:flex; gap:8px; margin-top:14px;">
            <v-btn icon variant="text" size="small" color="grey-lighten-1" aria-label="Facebook"><v-icon>mdi-facebook</v-icon></v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1" aria-label="Instagram"><v-icon>mdi-instagram</v-icon></v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1" aria-label="WhatsApp"><v-icon>mdi-whatsapp</v-icon></v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1" aria-label="YouTube"><v-icon>mdi-youtube</v-icon></v-btn>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><NuxtLink to="/shop">All Products</NuxtLink></li>
            <li><NuxtLink to="/categories">Categories</NuxtLink></li>
            <li><NuxtLink to="/sellers">Our Sellers</NuxtLink></li>
            <li><NuxtLink to="/profile/orders">My Orders</NuxtLink></li>
            <li><NuxtLink to="/profile/wishlist">Wishlist</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4>Earn with Aadab</h4>
          <ul>
            <li><NuxtLink to="/sell">Sell on Aadab</NuxtLink></li>
            <li><NuxtLink to="/become-a-seller">Become a Seller</NuxtLink></li>
            <li><NuxtLink to="/reseller">Reseller Program</NuxtLink></li>
            <li><NuxtLink to="/distributor/register">Distributor</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4>Help</h4>
          <ul>
            <li><NuxtLink to="/about">About Us</NuxtLink></li>
            <li><NuxtLink to="/faq">FAQs</NuxtLink></li>
            <li><NuxtLink to="/contact">Contact</NuxtLink></li>
            <li><NuxtLink to="/refund-policy">Returns &amp; Refunds</NuxtLink></li>
            <li><NuxtLink to="/terms">Terms</NuxtLink></li>
            <li><NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mk-footer__bar">
        <span>&copy; {{ year }} Aadab. All rights reserved.</span>
        <span>Secure payments &bull; Cash on delivery &bull; Easy returns</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
