<template>
  <div class="collection-page pb-16">
    <!-- Massive Editorial Header -->
    <header class="collection-header py-16 text-center">
      <h1 class="collection-title">THE COLLECTION</h1>
      <p class="collection-subtitle mt-4">{{ totalProductsCount }} EXQUISITE PIECES</p>
    </header>

    <v-container fluid class="px-4 px-md-12" style="max-width: 1800px;">
      <v-row>
        <!-- Editorial Filters Sidebar -->
        <v-col cols="12" md="2" class="d-none d-md-block filter-sidebar pe-8">
          <div class="sticky-sidebar">
            <h3 class="filter-heading mb-8">Refine</h3>

            <!-- Categories -->
            <div class="filter-section mb-10">
              <h4 class="filter-subheading mb-4">Category</h4>
              <ul class="filter-list">
                <li>
                  <button 
                    class="filter-btn" 
                    :class="{ 'is-active': selectedCategory === null }"
                    @click="selectedCategory = null"
                  >
                    All Pieces
                  </button>
                </li>
                <li v-for="cat in categories" :key="cat.id">
                  <button 
                    class="filter-btn" 
                    :class="{ 'is-active': selectedCategory === cat.id }"
                    @click="selectedCategory = cat.id"
                  >
                    {{ cat.name }}
                  </button>
                </li>
              </ul>
            </div>

            <!-- Price Range (Min / Max Inputs) -->
            <div class="filter-section mb-10">
              <h4 class="filter-subheading mb-4">Price Range</h4>
              <div class="price-inputs d-flex align-center ga-2 mb-2">
                <div class="price-input-wrap flex-grow-1">
                  <span class="currency-symbol">₹</span>
                  <input type="number" v-model.number="priceMinInput" placeholder="Min" class="price-field" @blur="applyPriceFilter" @keyup.enter="applyPriceFilter">
                </div>
                <span class="price-separator">-</span>
                <div class="price-input-wrap flex-grow-1">
                  <span class="currency-symbol">₹</span>
                  <input type="number" v-model.number="priceMaxInput" placeholder="Max" class="price-field" @blur="applyPriceFilter" @keyup.enter="applyPriceFilter">
                </div>
              </div>
              <v-btn variant="text" size="small" class="text-caption font-weight-bold px-0 text-grey-darken-1" @click="applyPriceFilter" style="letter-spacing: 0.1em; text-transform: uppercase;">
                Apply Price
              </v-btn>
            </div>

            <!-- Sort -->
            <div class="filter-section mb-10">
              <h4 class="filter-subheading mb-4">Sort By</h4>
              <ul class="filter-list">
                <li v-for="option in sortOptions" :key="option.value">
                  <button 
                    class="filter-btn" 
                    :class="{ 'is-active': sortBy === option.value }"
                    @click="sortBy = option.value"
                  >
                    {{ option.label }}
                  </button>
                </li>
              </ul>
            </div>

            <!-- Clear Filters -->
            <button class="clear-filters-btn mt-4" @click="clearFilters">
              Clear All Filters
            </button>
          </div>
        </v-col>

        <!-- Products Grid -->
        <v-col cols="12" md="10">
          <!-- Mobile Filter Button -->
          <div class="d-flex d-md-none justify-space-between align-center mb-6">
            <span class="text-caption text-grey font-weight-bold" style="letter-spacing: 0.1em;">{{ totalProductsCount }} PIECES</span>
            <v-btn
              variant="outlined"
              rounded="pill"
              class="mobile-filter-btn"
              prepend-icon="mdi-tune"
              @click="showMobileFilters = true"
            >
              Filters
            </v-btn>
          </div>

          <!-- Loading State -->
          <v-row v-if="loading">
            <v-col v-for="n in 8" :key="n" cols="6" sm="4" lg="3" class="mb-8">
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
              class="mb-8"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>

          <!-- Empty State -->
          <div v-else class="empty-state py-16 text-center">
            <v-icon size="64" color="grey-lighten-2" class="mb-6">mdi-diamond-outline</v-icon>
            <h3 class="text-h5 font-weight-light mb-4">No pieces match your criteria</h3>
            <button class="elegant-btn" @click="clearFilters">RESET FILTERS</button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPagesCount > 1" class="d-flex justify-center mt-12 mb-8">
            <v-pagination
              v-model="currentPage"
              :length="totalPagesCount"
              :total-visible="5"
              rounded="circle"
              active-color="#111111"
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
        <div class="mobile-filters-drawer bg-white h-100 d-flex flex-column">
          <div class="d-flex justify-space-between align-center pa-6 border-b">
            <h3 class="filter-heading mb-0">Refine</h3>
            <v-btn icon="mdi-close" variant="text" @click="showMobileFilters = false"></v-btn>
          </div>

          <div class="flex-grow-1 overflow-y-auto pa-6">
            <!-- Same filter content as sidebar -->
            <div class="filter-section mb-8">
              <h4 class="filter-subheading mb-4">Category</h4>
              <v-chip-group v-model="selectedCategory" column>
                <v-chip :value="null" variant="outlined" class="custom-chip">All Pieces</v-chip>
                <v-chip
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                  variant="outlined"
                  class="custom-chip"
                >
                  {{ cat.name }}
                </v-chip>
              </v-chip-group>
            </div>

            <div class="filter-section mb-8">
              <h4 class="filter-subheading mb-4">Price Range</h4>
              <div class="price-inputs d-flex align-center ga-2">
                <div class="price-input-wrap flex-grow-1">
                  <span class="currency-symbol">₹</span>
                  <input type="number" v-model.number="priceMinInput" placeholder="Min" class="price-field" @blur="applyPriceFilter">
                </div>
                <span class="price-separator">-</span>
                <div class="price-input-wrap flex-grow-1">
                  <span class="currency-symbol">₹</span>
                  <input type="number" v-model.number="priceMaxInput" placeholder="Max" class="price-field" @blur="applyPriceFilter">
                </div>
              </div>
            </div>

            <div class="filter-section mb-8">
              <h4 class="filter-subheading mb-4">Sort By</h4>
              <v-chip-group v-model="sortBy" column>
                <v-chip
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                  variant="outlined"
                  class="custom-chip"
                >
                  {{ option.label }}
                </v-chip>
              </v-chip-group>
            </div>
          </div>

          <div class="pa-6 border-t d-flex ga-4 bg-white">
            <button class="clear-filters-btn flex-grow-1" style="height: 48px;" @click="clearFilters">Clear All</button>
            <button class="elegant-btn flex-grow-1 text-center" style="height: 48px; line-height: 48px; padding: 0;" @click="showMobileFilters = false">Show Results</button>
          </div>
        </div>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useProductStore } from "~/stores/product";
import { useAuthStore } from "~/stores/auth";
import ProductCard from "~/components/product/ProductCard.vue";

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

const priceMinInput = ref<number | ''>('');
const priceMaxInput = ref<number | ''>('');
const priceRange = ref([0, 999999]);

const sortBy = ref("newest");

const sortOptions = [
  { label: "New Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

const searchQuery = computed(() => route.query.search?.toString() || "");

const applyPriceFilter = () => {
  const min = typeof priceMinInput.value === 'number' ? priceMinInput.value : 0;
  const max = typeof priceMaxInput.value === 'number' && priceMaxInput.value > 0 ? priceMaxInput.value : 999999;
  
  if (min > max && max !== 0) {
     priceRange.value = [max, min];
     priceMinInput.value = max;
     priceMaxInput.value = min;
  } else {
     priceRange.value = [min, max];
  }
};

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
      return b.id - a.id;
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

const clearFilters = () => {
  selectedCategory.value = null;
  priceMinInput.value = '';
  priceMaxInput.value = '';
  priceRange.value = [0, 999999];
  sortBy.value = "newest";
  currentPage.value = 1;
};

watch([selectedCategory, sortBy, priceRange, searchQuery], () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.collection-page {
  background-color: #FDFBF7;
  min-height: 100vh;
  font-family: 'Urbanist', sans-serif;
}

.collection-header {
  padding-top: 100px;
  padding-bottom: 80px;
}

.collection-title {
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  color: #111111;
  line-height: 1;
}

.collection-subtitle {
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  font-weight: 600;
  color: #888888;
}

.sticky-sidebar {
  position: sticky;
  top: 120px;
}

.filter-heading {
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: #111111;
  text-transform: uppercase;
}

.filter-subheading {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: #888888;
  text-transform: uppercase;
}

.filter-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.filter-btn {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 0.95rem;
  font-weight: 400;
  color: #888888;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.filter-btn:hover {
  color: #111111;
  transform: translateX(4px);
}

.filter-btn.is-active {
  color: #111111;
  font-weight: 600;
}

.filter-btn.is-active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #111111;
}

.price-input-wrap {
  position: relative;
  border-bottom: 1px solid #CCCCCC;
  transition: border-color 0.3s ease;
}

.price-input-wrap:focus-within {
  border-bottom-color: #111111;
}

.currency-symbol {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: #888888;
}

.price-field {
  width: 100%;
  padding: 8px 8px 8px 16px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #111111;
  font-family: inherit;
}

.price-field::placeholder {
  color: #CCCCCC;
}

/* Hide number arrows */
.price-field::-webkit-outer-spin-button,
.price-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.price-field[type=number] {
  -moz-appearance: textfield;
}

.price-separator {
  color: #CCCCCC;
  font-weight: 300;
}

.clear-filters-btn {
  background: transparent;
  border: none;
  color: #888888;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.clear-filters-btn:hover {
  color: #111111;
}

.elegant-btn {
  display: inline-block;
  background-color: #111111;
  color: #FFFFFF !important;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  padding: 14px 36px;
  border-radius: 999px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.elegant-btn:hover {
  background-color: #333333;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.mobile-filter-btn {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  font-size: 0.75rem;
  border-color: #E5E5E5;
}

.custom-chip {
  border-color: #E5E5E5 !important;
  color: #888888 !important;
  font-weight: 500;
}
.custom-chip.v-chip--selected {
  background-color: #111111 !important;
  color: #FFFFFF !important;
  border-color: #111111 !important;
}

.border-b {
  border-bottom: 1px solid #E5E5E5;
}
.border-t {
  border-top: 1px solid #E5E5E5;
}

:deep(.v-pagination .v-pagination__item--is-active),
:deep(.v-pagination .v-btn--active),
:deep(.v-pagination .v-btn[aria-current="true"]) {
  background-color: #111111 !important;
  color: #ffffff !important;
}
:deep(.v-pagination .v-btn[aria-current="true"] .v-btn__content) {
  color: #ffffff !important;
}
</style>
