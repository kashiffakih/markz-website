<template>
  <div>
    <header class="mk-pagehead">
      <div class="mk-container"><h1>Frequently Asked Questions</h1><p>Sabse zyada pooche jaane wale sawal</p></div>
    </header>
    <div class="mk-container mk-section" style="max-width:860px">
      <div v-for="g in groups" :key="g.title" style="margin-bottom:22px">
        <h2 class="mk-section-title" style="margin-bottom:10px">{{ g.title }}</h2>
        <v-expansion-panels variant="accordion" elevation="0" style="border:1px solid var(--mk-line); border-radius:14px; overflow:hidden">
          <v-expansion-panel v-for="q in g.items" :key="q.q" :title="q.q" :text="q.a" />
        </v-expansion-panels>
      </div>
      <p style="text-align:center; color:var(--mk-muted); font-size:.9rem">Jawab nahi mila? <NuxtLink to="/contact" style="color:var(--mk-green); font-weight:700">Humse contact karein</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'FAQs - Aadab' })
const groups = [
  { title: 'Orders & Delivery', items: [
    { q: 'Ek order mein alag-alag sellers ke products le sakta hoon?', a: 'Haan. Cart mein kisi bhi seller ke products jod sakte hain. Order apne aap seller ke hisaab se alag-alag shipments mein split ho jata hai.' },
    { q: 'Cash on delivery available hai?', a: 'Haan, serviceable pincodes par cash on delivery available hai. Checkout par payment option dikhega.' },
    { q: 'Order kab tak pahunchega?', a: 'Delivery time seller aur aapke pincode par depend karta hai. Order status "My Orders" mein dekh sakte hain.' },
  ] },
  { title: 'Returns & Refunds', items: [
    { q: 'Return kaise karun?', a: 'Delivered order ke baad return window ke andar "My Orders" se return request daal sakte hain. Seller/admin approve karne par pickup schedule hota hai.' },
    { q: 'Refund kab milega?', a: 'Product wapas mil jane aur refund approve hone ke baad paisa original payment method ya wallet mein wapas jata hai.' },
  ] },
  { title: 'Sellers & Resellers', items: [
    { q: 'Seller kaise bane?', a: '"Sell on Aadab" page par jaakar registration form bharein. Approval ke baad aap products upload kar sakte hain.' },
    { q: 'Reseller program kya hai?', a: 'Reseller apne customers ko products apne margin par bechte hain. Delivery aur stock hum sambhalte hain. Delivery aur return window ke baad margin wallet mein aata hai.' },
    { q: 'Seller se baat kaise karun?', a: 'Product page par "Chat with seller" button se seedha seller ko message bhej sakte hain.' },
  ] },
]
</script>
