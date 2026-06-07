<template>
  <v-container class="pa-0 pa-md-4" fluid>
    <!-- Mobile Search Bar Removed (Using Header Search) -->

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <template v-else>
      <!-- Categories Section -->
      <div class="px-2 px-md-4 py-4" v-if="productStore.categories.length > 0">
        <div class="d-flex justify-space-between align-center mb-3">
          <h3 class="text-h6 font-weight-bold text-secondary">
            Shop by Category
          </h3>
        </div>

        <v-slide-group show-arrows class="category-slide-group">
          <v-slide-group-item
            v-for="category in productStore.categories"
            :key="category.id"
          >
            <div
              class="d-flex flex-column align-center mr-4 cursor-pointer category-item"
              @click="goToCategory(category.id)"
            >
              <v-avatar
                size="72"
                color="white"
                class="elevation-1 mb-2 category-avatar"
              >
                <v-img
                  v-if="category.imagepath"
                  :src="getImageUrl(category.imagepath)"
                  cover
                  alt="Category"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        size="20"
                        width="2"
                        color="primary"
                        indeterminate
                      />
                    </div>
                  </template>
                  <template v-slot:error>
                    <div
                      class="d-flex align-center justify-center fill-height bg-grey-lighten-4"
                    >
                      <span class="text-h5 text-grey">{{
                        category.name.charAt(0)
                      }}</span>
                    </div>
                  </template>
                </v-img>
                <span v-else class="text-h5">{{
                  category.name.charAt(0)
                }}</span>
              </v-avatar>
              <span
                class="text-caption font-weight-medium text-center text-truncate"
                style="max-width: 80px"
              >
                {{ category.name }}
              </span>
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>

      <!-- Banners Carousel -->
      <div class="px-3 px-md-4 pb-6" v-if="bannerUrls.length > 0">
        <v-carousel
          cycle
          height="auto"
          hide-delimiter-background
          show-arrows="hover"
          class="rounded-xl elevation-2 overflow-hidden banner-carousel"
          :interval="4000"
        >
          <v-carousel-item
            v-for="(url, i) in bannerUrls"
            :key="i"
            :src="url"
            cover
            loading="lazy"
            height="100%"
            style="aspect-ratio: 16/7"
          >
            <!-- Aspect Ratio Hack via Style if needed, but height=auto + styling is tricky in Vuetify carousel without fixed height. 
                 The mobile app likely uses fixed aspect ratio. Let's try 200px (mobile) to 400px (desktop) height logic or just fixed reasonable height. 
            -->
          </v-carousel-item>
        </v-carousel>
      </div>

      <!-- New Arrivals / Products -->
      <div class="px-4 py-4" v-if="productStore.products.length > 0">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6 font-weight-bold">New Arrivals</h3>
          <v-btn
            variant="text"
            color="primary"
            to="/products?newArrivals=true"
            class="px-0"
            >See All</v-btn
          >
        </div>

        <v-row>
          <v-col
            v-for="product in productStore.products"
            :key="product.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <product-card :product="product" />
          </v-col>
        </v-row>
      </div>

      <!-- Random Products -->
      <div class="px-4 py-4" v-if="productStore.randomProducts.length > 0">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6 font-weight-bold">Discover More</h3>
        </div>

        <v-row>
          <v-col
            v-for="product in productStore.randomProducts"
            :key="product.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <product-card :product="product" />
          </v-col>
        </v-row>
      </div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { useProductStore } from "@stores/product";
import ProductCard from "~/components/product/ProductCard.vue";

const productStore = useProductStore();
const config = useRuntimeConfig();
const router = useRouter();

const searchQuery = ref("");
const loading = ref(true);

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

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery.value)}`);
  }
};

const goToCategory = (id: number) => {
  router.push(`/products?category=${id}`);
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
.search-bar :deep(.v-field) {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.search-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.search-input :deep(.v-field__input) {
  padding-top: 12px;
  padding-bottom: 12px;
}
.cursor-pointer {
  cursor: pointer;
}

.category-item {
  transition: transform 0.2s;
}

.category-item:hover {
  transform: translateY(-2px);
}

.category-item:hover .category-avatar {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Responsive banner heights */
.banner-carousel {
  height: 180px !important;
}

@media (min-width: 600px) {
  .banner-carousel {
    height: 280px !important;
  }
}

@media (min-width: 960px) {
  .banner-carousel {
    height: 380px !important;
  }
}
</style>
