<template>
  <div>
    <header class="mk-pagehead">
      <div class="mk-container">
        <h1>{{ heading }}</h1>
        <p>{{ total }} products &bull; sab verified sellers se</p>
      </div>
    </header>

    <div class="mk-container" style="padding-top:6px; padding-bottom:20px">
      <!-- category chips -->
      <div class="mk-scroller" style="padding-top:12px">
        <a href="#" class="mk-chip" :class="{ 'is-active': !category }" @click.prevent="setCategory(null)">All</a>
        <a v-for="c in categories" :key="c.id" href="#" class="mk-chip" :class="{ 'is-active': category === c.id }" @click.prevent="setCategory(c.id)">{{ c.name }}</a>
      </div>

      <!-- toolbar -->
      <div class="mk-toolbar">
        <input v-model="search" class="mk-input" style="flex:1 1 200px" placeholder="Search products..." @keyup.enter="apply" />
        <select v-model="sort" class="mk-select" @change="apply">
          <option value="latest">Newest first</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
        <input v-model="minPrice" class="mk-input" style="width:96px" type="number" min="0" placeholder="Min ₹" @keyup.enter="apply" />
        <input v-model="maxPrice" class="mk-input" style="width:96px" type="number" min="0" placeholder="Max ₹" @keyup.enter="apply" />
        <button class="mk-btn mk-btn--sm" @click="apply">Apply</button>
        <button v-if="hasFilters" class="mk-btn mk-btn--ghost mk-btn--sm" @click="reset">Clear</button>
      </div>

      <MarketProductSkeleton v-if="loading" :count="10" />
      <div v-else-if="items.length" class="mk-grid mk-grid--5">
        <MarketProductCard v-for="p in items" :key="p.id" :product="p" />
      </div>
      <div v-else-if="errorMsg" class="mk-empty"><v-icon>mdi-alert-circle-outline</v-icon><p>Products load nahi hue: {{ errorMsg }}</p><button class="mk-btn mk-btn--sm" @click="load">Dobara try karo</button></div>
      <div v-else class="mk-empty"><v-icon>mdi-magnify-close</v-icon><p>Koi product nahi mila. Filter badal ke dekho.</p></div>

      <div v-if="lastPage > 1" class="mk-pager">
        <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page <= 1" @click="go(page - 1)">Prev</button>
        <span>Page {{ page }} / {{ lastPage }}</span>
        <button class="mk-btn mk-btn--ghost mk-btn--sm" :disabled="page >= lastPage" @click="go(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@stores/product'

useHead({ title: 'Shop - Aadab' })

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const { products } = useMarket()

const items = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref('')
const total = ref(0)
const page = ref(1)
const lastPage = ref(1)

const search = ref((route.query.search as string) || '')
const category = ref<number | null>(route.query.category ? Number(route.query.category) : null)
const sort = ref((route.query.sort as string) || 'latest')
const minPrice = ref((route.query.minPrice as string) || '')
const maxPrice = ref((route.query.maxPrice as string) || '')

const categories = computed(() => productStore.categories || [])
const heading = computed(() => {
  if (search.value) return `Results for "${search.value}"`
  const c = categories.value.find((x: any) => x.id === category.value)
  return c ? c.name : 'Shop All Products'
})
const hasFilters = computed(() => !!(search.value || category.value || minPrice.value || maxPrice.value || sort.value !== 'latest'))

const load = async () => {
  loading.value = true
  const res = await products({
    search: search.value, categoryId: category.value, sort: sort.value,
    minPrice: minPrice.value, maxPrice: maxPrice.value, page: page.value, perPage: 20,
  }).catch(() => null)
  errorMsg.value = ''
  if (!res || !Array.isArray(res.data)) {
    errorMsg.value = (res && (res.message || (res as any).error)) || 'API se jawab nahi aaya'
    console.error('shop products response:', res)
  }
  items.value = Array.isArray(res?.data) ? res.data : []
  total.value = res?.total || 0
  lastPage.value = res?.last_page || 1
  loading.value = false
}

const pushQuery = () => {
  const q: Record<string, any> = {}
  if (search.value) q.search = search.value
  if (category.value) q.category = category.value
  if (sort.value !== 'latest') q.sort = sort.value
  if (minPrice.value) q.minPrice = minPrice.value
  if (maxPrice.value) q.maxPrice = maxPrice.value
  router.replace({ query: q })
}

const apply = () => { page.value = 1; pushQuery(); load() }
const setCategory = (id: number | null) => { category.value = id; apply() }
const reset = () => { search.value = ''; category.value = null; sort.value = 'latest'; minPrice.value = ''; maxPrice.value = ''; apply() }
const go = (p: number) => { page.value = p; load(); if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' }) }

// header search box navigates here with ?search=...
watch(() => route.query.search, (v) => {
  const s = (v as string) || ''
  if (s !== search.value) { search.value = s; page.value = 1; load() }
})

onMounted(async () => {
  await productStore.fetchCategories()
  load()
})
</script>
