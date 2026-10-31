<template>
  <div>
    <header class="mk-pagehead">
      <div class="mk-container"><h1>About Aadab</h1><p>The Fashion Zone - ek bharosemand marketplace</p></div>
    </header>
    <div class="mk-container mk-section">
      <div class="mk-prose">
        <p>Aadab ek online marketplace hai jaha verified sellers apne fashion aur lifestyle products seedha customers tak pahunchate hain. Hamara maqsad hai ki customers ko achhe daam par quality products mile, aur chhote-bade sellers ko apna business badhane ka bharosemand platform.</p>
        <h2>Hum kya alag karte hain</h2>
        <ul style="padding-left:20px; display:grid; gap:6px">
          <li>Har seller ko approve karne ke baad hi platform par jagah milti hai.</li>
          <li>Ek hi cart mein alag-alag sellers ke products - delivery alag-alag sellers se.</li>
          <li>Cash on delivery aur easy returns.</li>
          <li>Resellers ke liye zero-investment margin model.</li>
        </ul>
        <h2>Judiye hamare saath</h2>
        <p>Customer ho, seller ho ya reseller - Aadab sabke liye hai.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px">
          <NuxtLink to="/shop" class="mk-btn mk-btn--sm">Shop Now</NuxtLink>
          <NuxtLink to="/sell" class="mk-btn mk-btn--ghost mk-btn--sm">Sell on Aadab</NuxtLink>
          <NuxtLink to="/contact" class="mk-btn mk-btn--ghost mk-btn--sm">Contact Us</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'About Us - Aadab' })
</script>
