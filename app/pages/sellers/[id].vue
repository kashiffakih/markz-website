<template>
  <div>
    <div v-if="notFound" class="mk-container mk-empty" style="padding-top:60px">
      <v-icon>mdi-storefront-remove-outline</v-icon>
      <p>Ye seller nahi mila.</p>
      <NuxtLink to="/sellers" class="mk-btn mk-btn--sm" style="margin-top:12px">All sellers</NuxtLink>
    </div>

    <template v-else>
      <header class="mk-pagehead">
        <div class="mk-container" style="display:flex; gap:16px; align-items:center; flex-wrap:wrap">
          <div class="mk-seller__logo" style="width:78px; height:78px; flex:none">
            <img v-if="logo" :src="logo" :alt="seller?.name" @error="logoFailed = true" />
            <span v-else>{{ (seller?.name || '?').charAt(0).toUpperCase() }}</span>
          </div>
          <div style="flex:1 1 220px; min-width:0">
            <h1>{{ seller?.name || 'Loading...' }}</h1>
            <p v-if="seller">
              <v-icon size="14" color="white" v-if="seller.city">mdi-map-marker-outline</v-icon>
              <span v-if="seller.city">{{ seller.city }}<span v-if="seller.state">, {{ seller.state }}</span> &bull; </span>
              {{ seller.product_count }} products
            </p>
          </div>
          <NuxtLink v-if="seller" :to="`/chat?company=${seller.id}`" class="mk-btn mk-btn--white mk-btn--sm">
            <v-icon size="18">mdi-chat-outline</v-icon> Chat with seller
          </NuxtLink>
        </div>
      </header>

      <div class="mk-container" style="padding-bottom:24px">
        <div v-if="seller && seller.categories && seller.categories.length" class="mk-scroller" style="padding-top:14px">
          <a href="#" class="mk-chip" :class="{ 'is-active': !category }" @click.prevent="setCategory(null)">All</a>
          <a v-for="c in seller.categories" :key="c.id" href="#" class="mk-chip" :class="{ 'is-active': category === c.id }" @click.prevent="setCategory(c.id)">{{ c.name }}</a>
        </div>

        <div class="mk-toolbar">
          <input v-model="search" class="mk-input" style="flex:1 1 200px" placeholder="Is store mein search karo..." @keyup.enter="apply" />
          <select v-model="sort" class="mk-select" @change="apply">
            <option value="latest">Newest first</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        <MarketProductSkeleton v-if="loading" :count="8" />
        <div v-else-if="items.length" class="mk-grid mk-grid--5">
          <MarketProductCard v-for="p in items" :key="p.id" :product="p" />
        </div>
        <div v-else class="mk-empty"><v-icon>mdi-package-variant-closed</v-icon><p>Is store mein abhi koi product nahi hai.</p></div>

        <div v-if="lastPage > 1" class="mk-pager">
          <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page <= 1" @click="go(page - 1)">Prev</button>
          <span>Page {{ page }} / {{ lastPage }}</span>
          <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page >= lastPage" @click="go(page + 1)">Next</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { seller: fetchSeller, products, img } = useMarket()

const seller = ref<any>(null)
const notFound = ref(false)
const logoFailed = ref(false)
const items = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const search = ref('')
const sort = ref('latest')
const category = ref<number | null>(null)

const logo = computed(() => (logoFailed.value || !seller.value ? '' : img(seller.value.logo_path)))
useHead(() => ({ title: seller.value ? `${seller.value.name} - Markz` : 'Seller - Markz' }))

const load = async () => {
  loading.value = true
  const res = await products({ sellerId: route.params.id, search: search.value, categoryId: category.value, sort: sort.value, page: page.value, perPage: 20 }).catch(() => null)
  items.value = res?.data || []
  lastPage.value = res?.last_page || 1
  loading.value = false
}
const apply = () => { page.value = 1; load() }
const setCategory = (id: number | null) => { category.value = id; apply() }
const go = (p: number) => { page.value = p; load(); if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(async () => {
  const res = await fetchSeller(route.params.id as string).catch(() => null)
  if (!res || !res.data) { notFound.value = true; return }
  seller.value = res.data
  load()
})
</script>
