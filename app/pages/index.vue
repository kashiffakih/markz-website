<template>
  <div class="elegance-container">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center py-12" style="min-height: 100vh;">
      <v-progress-circular indeterminate color="#222222" size="64" width="2"></v-progress-circular>
    </div>

    <template v-else>
      <!-- 1. The Floating Hero Slider -->
      <section class="hero-wrapper pa-4 pa-md-8">
        <v-carousel
          cycle
          height="85vh"
          hide-delimiter-background
          show-arrows="hover"
          class="hero-carousel"
          :interval="6000"
        >
          <!-- Default fallback -->
          <v-carousel-item
            v-if="bannerUrls.length === 0"
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
            cover
          >
            <div class="hero-floating-card">
              <span class="elegant-eyebrow">THE SIGNATURE COLLECTION</span>
              <h1 class="elegant-title mb-6">Effortless Grace</h1>
              <NuxtLink to="/products" class="elegant-btn">DISCOVER THE LOOK</NuxtLink>
            </div>
          </v-carousel-item>

          <v-carousel-item
            v-for="(url, i) in bannerUrls"
            :key="i"
            :src="url"
            cover
          >
            <div class="hero-floating-card">
              <span class="elegant-eyebrow">VOL. 0{{ i + 1 }} EXCLUSIVE</span>
              <h1 class="elegant-title mb-6">Modern Luxury</h1>
              <NuxtLink to="/products" class="elegant-btn">SHOP THE EDIT</NuxtLink>
            </div>
          </v-carousel-item>
        </v-carousel>
      </section>

      <!-- 2. Infinite Scrolling Marquee -->
      <div class="marquee-section">
        <div class="marquee-content">
          <span v-for="i in 10" :key="i">
            ✨ PREMIUM APPAREL ✨ FREE SHIPPING ON ORDERS OVER $150 ✨ MODERN LUXURY
          </span>
        </div>
      </div>

      <!-- 3. "Our Collections" Hover Gallery -->
      <section class="category-hover-gallery" v-if="productStore.categories.length > 0">
        <div class="hover-gallery-bg">
          <transition name="fade-bg" mode="out-in">
             <v-img 
               :key="activeCategoryIndex" 
               :src="getImageUrl(productStore.categories[activeCategoryIndex]?.imagepath)" 
               cover 
               class="h-100 w-100"
             ></v-img>
          </transition>
          <div class="gallery-overlay"></div>
        </div>

        <div class="hover-gallery-content px-4 px-md-12">
           <div class="d-flex flex-column justify-center h-100" style="max-width: 1400px; margin: 0 auto;">
              <span class="elegant-eyebrow text-white mb-8" style="opacity: 0.8;">CURATED SELECTIONS</span>
              
              <div class="gallery-nav-list">
                 <NuxtLink 
                   v-for="(category, index) in productStore.categories.slice(0, 5)" 
                   :key="category.id"
                   :to="`/products?category=${category.id}`"
                   class="gallery-nav-item d-flex align-start text-decoration-none"
                   @mouseenter="activeCategoryIndex = index"
                 >
                   <span class="nav-number" :class="{ 'text-white': activeCategoryIndex === index }">0{{ index + 1 }}</span>
                   <h2 class="nav-title" :class="{ 'is-active': activeCategoryIndex === index }">{{ category.name }}</h2>
                 </NuxtLink>
              </div>
           </div>
        </div>
      </section>

      <!-- 4. Overlapping Editorial Promotional Section -->
      <section class="editorial-promo py-16">
        <div class="container mx-auto px-4 px-md-8" style="max-width: 1400px;">
          <div class="v-row align-center">
            <div class="v-col-12 v-col-md-7 position-relative z-1">
              <div class="editorial-img-wrap">
                <v-img 
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
                  cover 
                  class="h-100 w-100"
                  aspect-ratio="4/5"
                ></v-img>
              </div>
            </div>
            <div class="v-col-12 v-col-md-5 position-relative z-2">
              <div class="editorial-text-box bg-white pa-8 pa-md-16">
                <span class="elegant-eyebrow mb-4">PARTNER WITH US</span>
                <h2 class="section-heading mb-6">Elevate Your Retail Experience</h2>
                <p class="elegant-body mb-8 text-grey-darken-2">
                  Join our elite network of wholesale distributors and gain access to our premium catalog with exclusive pricing. Experience the standard of modern luxury.
                </p>
                <NuxtLink v-if="!authStore.isLoggedIn || !authStore.isDistributor" to="/distributor/register" class="elegant-btn-outline">
                  BECOME A PARTNER
                </NuxtLink>
                <div v-else class="text-subtitle-1 font-italic text-success">
                  Your Distributor Account is Active.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Seamless Product Carousel (New Arrivals) -->
      <section class="products-section py-16 bg-white" v-if="productStore.products.length > 0">
        <div class="d-flex justify-space-between align-end mb-12 px-4 px-md-12" style="max-width: 1600px; margin: 0 auto;">
          <div>
            <span class="elegant-eyebrow mb-2">JUST LANDED</span>
            <h2 class="section-heading mb-0">New Arrivals</h2>
          </div>
          <NuxtLink to="/products?newArrivals=true" class="elegant-link">VIEW ALL</NuxtLink>
        </div>
        
        <v-slide-group
          class="px-4 px-md-12"
          show-arrows
        >
          <v-slide-group-item
            v-for="product in productStore.products"
            :key="product.id"
          >
            <div class="product-carousel-card mx-2 mx-md-4">
              <product-card :product="product" class="h-100 elegant-product-card" />
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </section>

      <!-- 6. Standard Elegant Grid (Discover More) -->
      <section class="products-section py-16" v-if="productStore.randomProducts.length > 0">
        <div class="d-flex flex-column align-center text-center mb-12 px-4">
          <span class="elegant-eyebrow mb-2">FOR YOU</span>
          <h2 class="section-heading">Discover More</h2>
        </div>
        
        <div class="container mx-auto px-4 px-md-8" style="max-width: 1400px;">
          <div class="v-row">
            <div
              v-for="product in productStore.randomProducts.slice(0, 4)"
              :key="product.id"
              class="v-col-12 v-col-sm-6 v-col-md-3 mb-8"
            >
              <product-card :product="product" class="h-100 elegant-product-card" />
            </div>
          </div>
          <div class="text-center mt-8">
            <NuxtLink to="/products" class="elegant-btn-outline">VIEW ENTIRE COLLECTION</NuxtLink>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from "@stores/product";
import { useAuthStore } from "@stores/auth";
import ProductCard from "~/components/product/ProductCard.vue";

const productStore = useProductStore();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const loading = ref(true);
const activeCategoryIndex = ref(0);

const bannerPaths = [
  "banner_path_1",
  "banner_path_2",
  "banner_path_3",
  "banner_path_11",
  "banner_path_12",
  "banner_path_13",
];

const bannerUrls = computed(() => {
  const mediaBase = config.public.mediaBase as string;
  return bannerPaths
    .filter((path) => productStore.banners[path])
    .map((path) => `${mediaBase}${productStore.banners[path]}`);
});

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const mediaBase = config.public.mediaBase as string;
  return `${mediaBase}${path}`;
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchBanners(),
    productStore.fetchNewArrivals(),
    productStore.fetchRandomProducts(),
  ]);
  loading.value = false;
});
</script>

<style scoped>
/* Base Constraints */
.elegance-container {
  background-color: #FDFBF7; /* Soft warm beige */
  color: #222222;
  font-family: 'Urbanist', sans-serif;
  overflow-x: hidden;
}

/* Typography */
.elegant-eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  text-transform: uppercase;
  color: #888888;
  display: block;
}
.elegant-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #222222;
}
.section-heading {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: #222222;
}
.elegant-body {
  font-size: 1.1rem;
  line-height: 1.8;
  font-weight: 300;
}

/* Buttons & Links */
.elegant-btn {
  display: inline-block;
  background-color: #222222;
  color: #FFFFFF !important;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  padding: 16px 40px;
  border-radius: 999px; /* Pill shape */
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.elegant-btn:hover {
  background-color: #444444;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.elegant-btn-outline {
  display: inline-block;
  background-color: transparent;
  color: #222222 !important;
  border: 1px solid #222222;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  padding: 16px 40px;
  border-radius: 999px; /* Pill shape */
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.elegant-btn-outline:hover {
  background-color: #222222;
  color: #FFFFFF !important;
}

.elegant-link {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #222222;
  text-decoration: none;
  border-bottom: 1px solid #222222;
  padding-bottom: 2px;
  transition: opacity 0.3s ease;
}
.elegant-link:hover {
  opacity: 0.6;
}

/* 1. Hero Section */
.hero-carousel {
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}
.hero-floating-card {
  position: absolute;
  bottom: 8%;
  left: 8%;
  background: rgba(253, 251, 247, 0.9);
  backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

/* 2. Marquee */
.marquee-section {
  width: 100vw;
  overflow: hidden;
  background-color: #222222;
  color: #FDFBF7;
  padding: 1rem 0;
  position: relative;
}
.marquee-content {
  display: flex;
  white-space: nowrap;
  animation: marquee 30s linear infinite;
}
.marquee-content span {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  padding: 0 2rem;
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 3. Interactive Hover Gallery */
.category-hover-gallery {
  position: relative;
  height: 85vh;
  min-height: 600px;
  width: 100vw;
  margin-left: calc(-50vw + 50%); /* Full bleed */
  margin-top: 64px;
  margin-bottom: 64px;
  overflow: hidden;
  background-color: #111111;
}

.hover-gallery-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%);
  z-index: 2;
  pointer-events: none;
}

.hover-gallery-content {
  position: relative;
  z-index: 3;
  height: 100%;
}

.gallery-nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gallery-nav-item {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.5s ease;
  padding: 8px 0;
}

.nav-number {
  font-family: "Urbanist", sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-right: 32px;
  margin-top: 16px;
  transition: color 0.5s ease;
  color: rgba(255, 255, 255, 0.4);
}

.nav-title {
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  line-height: 1.1;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  color: rgba(255, 255, 255, 0.4);
}

.gallery-nav-item:hover .nav-title, .nav-title.is-active {
  color: #ffffff;
  transform: translateX(40px);
}

.nav-title.is-active {
  font-style: italic;
  font-weight: 400;
}

.fade-bg-enter-active,
.fade-bg-leave-active {
  transition: opacity 1s ease, transform 2s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-bg-enter-from {
  opacity: 0;
  transform: scale(1.05);
}
.fade-bg-leave-to {
  opacity: 0;
  transform: scale(1);
}

/* Customizing Slide Group Arrows */
:deep(.v-slide-group__prev), :deep(.v-slide-group__next) {
  background: #FDFBF7;
  border: 1px solid #E5E5E5;
  border-radius: 50%;
  margin: 0 10px;
  transition: all 0.3s ease;
}
:deep(.v-slide-group__prev:hover), :deep(.v-slide-group__next:hover) {
  background: #222222;
  color: #FFFFFF;
}

/* 4. Editorial Promo (Overlapping) */
.editorial-img-wrap {
  border-radius: 32px;
  overflow: hidden;
}
.editorial-text-box {
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
@media (min-width: 960px) {
  .editorial-text-box {
    margin-left: -100px; /* Overlap effect */
  }
}

/* 5. Product Carousels */
.product-carousel-card {
  width: 300px;
}


</style>
