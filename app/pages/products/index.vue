<template>
  <v-container class="py-8">
    <!-- Page Header -->
    <div class="d-flex flex-wrap justify-space-between align-center mb-8 ga-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-secondary">Products</h1>
        <p class="text-grey">{{ totalProductsCount }} products found</p>
      </div>

      <!-- Search on Desktop (Removed as per request) -->
    </div>

    <v-row>
      <!-- Filters Sidebar -->
      <v-col cols="12" md="3" class="d-none d-md-block">
        <v-card class="pa-4" rounded="lg">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Filters</h3>

          <!-- Categories -->
          <div class="mb-6">
            <p class="text-subtitle-2 font-weight-bold mb-3">Categories</p>
            <v-chip-group v-model="selectedCategory" column filter>
              <v-chip :value="null" variant="outlined" filter> All </v-chip>
              <v-chip
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
                variant="outlined"
                filter
              >
                {{ cat.name }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Price Range -->
          <div class="mb-6">
            <p class="text-subtitle-2 font-weight-bold mb-3">Price Range</p>
            <v-range-slider
              v-model="priceRange"
              :max="10000"
              :step="100"
              color="primary"
              hide-details
              class="mb-2"
            />
            <div class="d-flex justify-space-between text-caption text-grey">
              <span>₹{{ priceRange[0] }}</span>
              <span>₹{{ priceRange[1] }}</span>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <p class="text-subtitle-2 font-weight-bold mb-3">Sort By</p>
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
            />
          </div>

          <!-- Clear Filters -->
          <v-btn
            variant="text"
            color="primary"
            block
            class="mt-4"
            @click="clearFilters"
          >
            Clear Filters
          </v-btn>
        </v-card>
      </v-col>

      <!-- Products Grid -->
      <v-col cols="12" md="9">
        <!-- Mobile Filter Button (Search removed) -->
        <div class="d-flex d-md-none justify-end mb-4">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter-variant"
            @click="showMobileFilters = true"
          >
            Filters
          </v-btn>
        </div>

        <!-- Loading State -->
        <v-row v-if="loading">
          <v-col v-for="n in 8" :key="n" cols="6" sm="4" lg="3">
            <v-skeleton-loader type="card" />
          </v-col>
        </v-row>

        <!-- Products -->
        <v-row v-else-if="paginatedProducts.length > 0">
          <v-col
            v-for="product in paginatedProducts"
            :key="product.id"
            cols="6"
            sm="4"
            lg="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-card v-else class="pa-8 text-center" flat>
          <v-icon size="80" color="grey-lighten-2" class="mb-4">
            mdi-package-variant-remove
          </v-icon>
          <h3 class="text-h6 text-grey-darken-1 mb-2">No Products Found</h3>
          <p class="text-grey">Try adjusting your filters or search query</p>
          <v-btn color="primary" class="mt-4" @click="clearFilters">
            Clear Filters
          </v-btn>
        </v-card>

        <!-- Pagination -->
        <div v-if="totalPagesCount > 1" class="d-flex justify-center mt-8">
          <v-pagination
            v-model="currentPage"
            :length="totalPagesCount"
            :total-visible="5"
            rounded
          />
        </div>
      </v-col>
    </v-row>

    <!-- Mobile Filters Dialog -->
    <v-dialog
      v-model="showMobileFilters"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar color="white" elevation="1">
          <v-btn icon @click="showMobileFilters = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Filters</v-toolbar-title>
          <v-spacer />
          <v-btn variant="text" color="primary" @click="applyMobileFilters"
            >Apply</v-btn
          >
        </v-toolbar>

        <v-card-text class="pa-4">
          <!-- Same filter content as sidebar -->
          <div class="mb-6">
            <p class="text-subtitle-2 font-weight-bold mb-3">Categories</p>
            <v-chip-group v-model="selectedCategory" column filter>
              <v-chip :value="null" variant="outlined" filter>All</v-chip>
              <v-chip
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
                variant="outlined"
                filter
              >
                {{ cat.name }}
              </v-chip>
            </v-chip-group>
          </div>

          <div class="mb-6">
            <p class="text-subtitle-2 font-weight-bold mb-3">Sort By</p>
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
            />
          </div>

          <!-- Price Range Mobile -->
          <div class="mb-6">
            <p class="text-subtitle-2 font-weight-bold mb-3">Price Range</p>
            <v-range-slider
              v-model="priceRange"
              :max="10000"
              :step="100"
              color="primary"
              hide-details
              class="mb-2"
            />
            <div class="d-flex justify-space-between text-caption text-grey">
              <span>₹{{ priceRange[0] }}</span>
              <span>₹{{ priceRange[1] }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useProductStore } from "~/stores/product";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const authStore = useAuthStore();

const loading = ref(true);
const rawProducts = ref<any[]>([]);
const categories = ref<{ id: number; name: string }[]>([]);
const currentPage = ref(1);
const showMobileFilters = ref(false);

const ITEMS_PER_PAGE = 12;

// Filters State
const selectedCategory = ref<number | null>(
  route.query.category ? parseInt(route.query.category.toString()) : null,
);
const priceRange = ref([0, 10000]);
const sortBy = ref("newest");

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
];

// Computed search query from route
const searchQuery = computed(() => route.query.search?.toString() || "");

// High-Performance Filtering & Sorting Engine
const filteredAndSortedProducts = computed(() => {
  let list = [...rawProducts.value];

  // 1. Filter by Category
  if (selectedCategory.value !== null) {
    list = list.filter((p) => p.category_id === selectedCategory.value);
  }

  // 2. Filter by Price Range
  const isDist = authStore.activeRole === "Distributor";
  list = list.filter((p) => {
    const { price } = productStore.getPrice(p, isDist);
    return price >= priceRange.value[0] && price <= priceRange.value[1];
  });

  // 3. Filter by Search Query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }

  // 4. Sort
  list.sort((a, b) => {
    if (sortBy.value === "newest") {
      return b.id - a.id; // Assumes newer items have larger IDs
    }
    if (sortBy.value === "price_asc") {
      const priceA = productStore.getPrice(a, isDist).price;
      const priceB = productStore.getPrice(b, isDist).price;
      return priceA - priceB;
    }
    if (sortBy.value === "price_desc") {
      const priceA = productStore.getPrice(a, isDist).price;
      const priceB = productStore.getPrice(b, isDist).price;
      return priceB - priceA;
    }
    if (sortBy.value === "name_asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  return list;
});

// Reactively Slice for Pagination
const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return filteredAndSortedProducts.value.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
});

const totalProductsCount = computed(() => filteredAndSortedProducts.value.length);

const totalPagesCount = computed(() => {
  return Math.ceil(filteredAndSortedProducts.value.length / ITEMS_PER_PAGE);
});

// Fetch full product catalog
const fetchProducts = async () => {
  const api = useApi();
  loading.value = true;

  try {
    const response = await api.get<any>("/products", { limit: 1000, all: true });
    if (response.success && response.data) {
      const data = response.data;
      if (Array.isArray(data)) {
        rawProducts.value = data;
      } else if (data && Array.isArray((data as any).data)) {
        rawProducts.value = (data as any).data;
      } else {
        rawProducts.value = [];
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
};

// Fetch categories
const fetchCategories = async () => {
  const api = useApi();
  try {
    const response = await api.get<{ id: number; name: string }[]>("/categories");
    if (response.success && response.data) {
      categories.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// Clear filters
const clearFilters = () => {
  selectedCategory.value = null;
  priceRange.value = [0, 10000];
  sortBy.value = "newest";
  currentPage.value = 1;
};

// Apply mobile filters
const applyMobileFilters = () => {
  showMobileFilters.value = false;
};

// Watchers: Reset to Page 1 when any filter state changes
watch([selectedCategory, sortBy, priceRange, searchQuery], () => {
  currentPage.value = 1;
});

// Initialize
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.search-field :deep(.v-field) {
  border-radius: 12px;
}
</style>
