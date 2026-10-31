<template>
  <div class="mk-home">
    <!-- HERO -->
    <section class="mk-container" style="padding-top:14px">
      <div v-if="bannerUrls.length" class="mk-hero mk-hero--banners">
        <v-carousel cycle hide-delimiter-background show-arrows="hover" :interval="5500" :height="'100%'" delimiter-icon="mdi-circle-small">
          <v-carousel-item v-for="(url, i) in bannerUrls" :key="i" :src="url" cover @click="router.push('/shop')" style="cursor:pointer" />
        </v-carousel>
      </div>
      <div v-else class="mk-hero">
        <div class="mk-hero__fallback">
          <span class="mk-pill" style="align-self:flex-start; background:rgba(255,255,255,.15); color:#fff">Aadab Marketplace</span>
          <h1>Trusted sellers. Best prices. Ek hi jagah.</h1>
          <p>Fashion aur lifestyle ke products direct sellers se - cash on delivery aur easy returns ke saath.</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <NuxtLink to="/shop" class="mk-btn mk-btn--gold">Shop Now</NuxtLink>
            <NuxtLink to="/sell" class="mk-btn mk-btn--white">Sell on Aadab</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST STRIP -->
    <section class="mk-container" style="padding-top:14px">
      <div class="mk-trust">
        <div class="mk-trust__item"><span class="mk-trust__icon"><v-icon>mdi-truck-fast-outline</v-icon></span><div><div class="mk-trust__t">Fast Delivery</div><div class="mk-trust__s">Pure India shipping</div></div></div>
        <div class="mk-trust__item"><span class="mk-trust__icon"><v-icon>mdi-cash-multiple</v-icon></span><div><div class="mk-trust__t">Cash on Delivery</div><div class="mk-trust__s">Ghar par payment</div></div></div>
        <div class="mk-trust__item"><span class="mk-trust__icon"><v-icon>mdi-backup-restore</v-icon></span><div><div class="mk-trust__t">Easy Returns</div><div class="mk-trust__s">7 din return window</div></div></div>
        <div class="mk-trust__item"><span class="mk-trust__icon"><v-icon>mdi-shield-check-outline</v-icon></span><div><div class="mk-trust__t">Verified Sellers</div><div class="mk-trust__s">Har seller approved</div></div></div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section v-if="categories.length" class="mk-container mk-section">
      <div class="mk-section-head">
        <div><h2 class="mk-section-title">Shop by Category</h2></div>
        <NuxtLink to="/categories" class="mk-link">See all</NuxtLink>
      </div>
      <div class="mk-scroller">
        <NuxtLink v-for="c in categories" :key="c.id" :to="`/shop?category=${c.id}`" class="mk-cat">
          <div class="mk-cat__img">
            <img v-if="c.imagepath" :src="img(c.imagepath)" :alt="c.name" loading="lazy" />
            <v-icon v-else>mdi-tag-outline</v-icon>
          </div>
          <div class="mk-cat__name">{{ c.name }}</div>
        </NuxtLink>
      </div>
    </section>

    <!-- DEALS -->
    <section v-if="deals.length" class="mk-container mk-section" style="padding-top:4px">
      <div class="mk-section-head">
        <div><h2 class="mk-section-title">🔥 Hot Deals</h2><div class="mk-section-sub">Sabse zyada discount wale products</div></div>
        <NuxtLink to="/shop?sort=latest" class="mk-link">View all</NuxtLink>
      </div>
      <div class="mk-grid mk-grid--5">
        <MarketProductCard v-for="p in deals.slice(0, 5)" :key="'d' + p.id" :product="p" />
      </div>
    </section>

    <!-- NEW ARRIVALS -->
    <section class="mk-container mk-section">
      <div class="mk-section-head">
        <div><h2 class="mk-section-title">New Arrivals</h2><div class="mk-section-sub">Sellers ne abhi jode hain</div></div>
        <NuxtLink to="/shop" class="mk-link">View all</NuxtLink>
      </div>
      <MarketProductSkeleton v-if="loading" :count="8" />
      <div v-else-if="newArrivals.length" class="mk-grid mk-grid--5">
        <MarketProductCard v-for="p in newArrivals.slice(0, 10)" :key="p.id" :product="p" />
      </div>
      <div v-else class="mk-empty"><v-icon>mdi-package-variant-closed</v-icon><p>Abhi koi product available nahi hai.</p></div>
    </section>

    <!-- BECOME A SELLER / RESELLER -->
    <section class="mk-container mk-section">
      <div class="mk-split">
        <div class="mk-tile">
          <span class="mk-pill">For businesses</span>
          <h3>Apna business Aadab par becho</h3>
          <p>Free registration, seller dashboard, direct payouts aur poore India ke customers tak pahunch.</p>
          <NuxtLink to="/sell" class="mk-btn mk-btn--sm">Start Selling</NuxtLink>
        </div>
        <div class="mk-tile mk-tile--gold">
          <span class="mk-pill" style="background:#fff">Zero investment</span>
          <h3>Reseller bano, margin kamao</h3>
          <p>Products apne customers ko apne margin par becho. Stock aur delivery hum sambhalte hain.</p>
          <NuxtLink to="/reseller" class="mk-btn mk-btn--gold mk-btn--sm">Join as Reseller</NuxtLink>
        </div>
      </div>
    </section>

    <!-- TOP SELLERS -->
    <section v-if="sellers.length" class="mk-container mk-section">
      <div class="mk-section-head">
        <div><h2 class="mk-section-title">Top Sellers</h2><div class="mk-section-sub">Verified aur trusted stores</div></div>
        <NuxtLink to="/sellers" class="mk-link">All sellers</NuxtLink>
      </div>
      <div class="mk-sgrid">
        <MarketSellerCard v-for="s in sellers.slice(0, 8)" :key="s.id" :seller="s" />
      </div>
    </section>

    <!-- REFER BAND -->
    <section class="mk-container mk-section">
      <div class="mk-band">
        <div>
          <h2>Register karo, rewards pao</h2>
          <p>Naya account banao, doston ko refer karo aur har successful referral par reward kamao.</p>
        </div>
        <div class="mk-band__row">
          <NuxtLink to="/register" class="mk-btn mk-btn--gold">Create Account</NuxtLink>
          <NuxtLink to="/shop" class="mk-btn mk-btn--white">Start Shopping</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@stores/product'

useHead({ title: 'Aadab - Online Marketplace for Fashion & Lifestyle' })

const router = useRouter()
const config = useRuntimeConfig()
const productStore = useProductStore()
const { img, home } = useMarket()

const loading = ref(true)
const newArrivals = ref<any[]>([])
const deals = ref<any[]>([])
const sellers = ref<any[]>([])

const categories = computed(() => productStore.categories || [])

const bannerKeys = ['banner_path_1', 'banner_path_2', 'banner_path_3', 'banner_path_11', 'banner_path_12', 'banner_path_13']
const bannerUrls = computed(() => {
  const base = config.public.mediaBase as string
  return bannerKeys.filter((k) => (productStore.banners as any)[k]).map((k) => `${base}${(productStore.banners as any)[k]}`)
})

onMounted(async () => {
  const [, , res] = await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchBanners(),
    home().catch(() => null),
  ])
  if (res) {
    newArrivals.value = res.new_arrivals || []
    deals.value = res.deals || []
    sellers.value = res.top_sellers || []
  }
  loading.value = false
})
</script>
