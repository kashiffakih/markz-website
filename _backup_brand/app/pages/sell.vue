<template>
  <div>
    <section class="mk-container" style="padding-top:14px">
      <div class="mk-band" style="padding-top:34px; padding-bottom:34px">
        <div>
          <span class="mk-pill" style="background:rgba(255,255,255,.15); color:#fff; margin-bottom:10px">Sell on Aadab</span>
          <h2>Apna business online le jao - bina kisi setup cost ke</h2>
          <p>Registration free hai. Products upload karo, orders lo, aur payout seedha apne bank mein pao. Delivery, returns aur customer chat sab ek hi dashboard se.</p>
        </div>
        <div class="mk-band__row">
          <NuxtLink to="/become-a-seller" class="mk-btn mk-btn--gold">Register as Seller</NuxtLink>
          <NuxtLink to="/reseller" class="mk-btn mk-btn--white">Reseller Program</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mk-container mk-section">
      <div class="mk-section-head"><div><h2 class="mk-section-title">Aadab par kyun bechein?</h2></div></div>
      <div class="mk-features">
        <div class="mk-feature" v-for="f in features" :key="f.t">
          <span class="mk-trust__icon"><v-icon>{{ f.i }}</v-icon></span>
          <div><h3>{{ f.t }}</h3><p>{{ f.s }}</p></div>
        </div>
      </div>
    </section>

    <section class="mk-container mk-section">
      <div class="mk-section-head"><div><h2 class="mk-section-title">Kaise shuru karein</h2><div class="mk-section-sub">4 simple steps</div></div></div>
      <div class="mk-steps" style="margin-top:18px">
        <div class="mk-step"><h3>Apply karo</h3><p>Business ki basic details aur GST/PAN ke saath form bharo.</p></div>
        <div class="mk-step"><h3>Approval</h3><p>Hamari team details verify karke aapka account approve karti hai.</p></div>
        <div class="mk-step"><h3>Products upload karo</h3><p>Seller panel se ek-ek ya Excel bulk upload se products daalo.</p></div>
        <div class="mk-step"><h3>Becho aur kamao</h3><p>Order aate hi ship karo. Delivery ke baad payout aapke bank mein.</p></div>
      </div>
    </section>

    <section class="mk-container mk-section">
      <div class="mk-split">
        <div class="mk-tile">
          <h3>Commission aur payout</h3>
          <p>Commission category/seller ke hisaab se set hota hai aur order ke time hi clear dikhta hai. Delivered orders ka payout settlement cycle mein aapke bank account mein jata hai.</p>
        </div>
        <div class="mk-tile mk-tile--gold">
          <h3>Return aur refund</h3>
          <p>Customer ke returns ek hi jagah se manage hote hain. Refund approve hone par settlement mein khud adjust ho jata hai.</p>
        </div>
      </div>
    </section>

    <section class="mk-container mk-section">
      <div class="mk-band">
        <div><h2>Ready to grow?</h2><p>Aaj hi register karo. Approval ke baad aap turant products daalna shuru kar sakte hain.</p></div>
        <div class="mk-band__row"><NuxtLink to="/become-a-seller" class="mk-btn mk-btn--gold">Apply Now</NuxtLink></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Sell on Aadab - Become a Seller' })
const features = [
  { i: 'mdi-account-check-outline', t: 'Free registration', s: 'Koi joining fee nahi. Form bharo aur approval ka wait karo.' },
  { i: 'mdi-view-dashboard-outline', t: 'Seller dashboard', s: 'Orders, earnings, products aur payouts ek hi jagah.' },
  { i: 'mdi-truck-delivery-outline', t: 'Easy shipping', s: 'Courier partner integration se pickup aur tracking.' },
  { i: 'mdi-bank-transfer', t: 'Direct payouts', s: 'Delivered orders ka paisa seedha bank account mein.' },
  { i: 'mdi-chat-outline', t: 'Customer chat', s: 'Customers se seedha baat karke sales badhao.' },
  { i: 'mdi-account-cash-outline', t: 'Reseller network', s: 'Hamare resellers aapke products aage bechte hain.' },
]
</script>
