<template>
  <div>
    <header class="mk-pagehead">
      <div class="mk-container">
        <h1>All Categories</h1>
        <p>Apni pasand ki category chuno</p>
      </div>
    </header>
    <div class="mk-container" style="padding-top:20px; padding-bottom:24px">
      <div v-if="loading" class="mk-sgrid"><div v-for="i in 8" :key="i" class="mk-skel" style="height:150px;border-radius:14px" /></div>
      <div v-else-if="categories.length" class="mk-sgrid">
        <NuxtLink v-for="c in categories" :key="c.id" :to="`/shop?category=${c.id}`" class="mk-seller">
          <div class="mk-seller__logo" style="width:84px;height:84px">
            <img v-if="c.imagepath" :src="img(c.imagepath)" :alt="c.name" loading="lazy" />
            <v-icon v-else>mdi-tag-outline</v-icon>
          </div>
          <div class="mk-seller__name">{{ c.name }}</div>
          <span class="mk-pill">Shop now</span>
        </NuxtLink>
      </div>
      <div v-else class="mk-empty"><v-icon>mdi-view-grid-outline</v-icon><p>Abhi koi category nahi hai.</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@stores/product'
useHead({ title: 'Categories - Aadab' })
const productStore = useProductStore()
const { img } = useMarket()
const loading = ref(true)
const categories = computed(() => productStore.categories || [])
onMounted(async () => { await productStore.fetchCategories(); loading.value = false })
</script>
