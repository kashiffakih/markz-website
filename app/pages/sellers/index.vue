<template>
  <div>
    <header class="mk-pagehead">
      <div class="mk-container">
        <h1>Our Sellers</h1>
        <p>Verified stores - apni pasand ka seller chuno</p>
      </div>
    </header>

    <div class="mk-container" style="padding-top:8px; padding-bottom:24px">
      <div class="mk-toolbar">
        <input v-model="search" class="mk-input" style="flex:1 1 220px" placeholder="Seller ka naam search karo..." @keyup.enter="apply" />
        <button class="mk-btn mk-btn--sm" @click="apply">Search</button>
      </div>

      <div v-if="loading" class="mk-sgrid"><div v-for="i in 8" :key="i" class="mk-skel" style="height:150px;border-radius:14px" /></div>
      <div v-else-if="items.length" class="mk-sgrid">
        <MarketSellerCard v-for="s in items" :key="s.id" :seller="s" />
      </div>
      <div v-else class="mk-empty"><v-icon>mdi-storefront-outline</v-icon><p>Koi seller nahi mila.</p></div>

      <div v-if="lastPage > 1" class="mk-pager">
        <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page <= 1" @click="go(page - 1)">Prev</button>
        <span>Page {{ page }} / {{ lastPage }}</span>
        <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page >= lastPage" @click="go(page + 1)">Next</button>
      </div>

      <div class="mk-band" style="margin-top:28px">
        <div><h2>Aap bhi seller banna chahte hain?</h2><p>Free mein apni dukaan Markz par kholo aur poore India mein becho.</p></div>
        <div class="mk-band__row"><NuxtLink to="/sell" class="mk-btn mk-btn--gold">Sell on Markz</NuxtLink></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Sellers - Markz' })
const { sellers } = useMarket()
const items = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const lastPage = ref(1)

const load = async () => {
  loading.value = true
  const res = await sellers({ search: search.value, page: page.value, perPage: 24 }).catch(() => null)
  items.value = res?.data || []
  lastPage.value = res?.last_page || 1
  loading.value = false
}
const apply = () => { page.value = 1; load() }
const go = (p: number) => { page.value = p; load(); if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' }) }
onMounted(load)
</script>
