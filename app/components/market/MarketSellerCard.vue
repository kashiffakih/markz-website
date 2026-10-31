<template>
  <NuxtLink :to="`/sellers/${seller.id}`" class="mk-seller">
    <div class="mk-seller__logo">
      <img v-if="logo" :src="logo" :alt="seller.name" loading="lazy" @error="failed = true" />
      <span v-else>{{ (seller.name || '?').charAt(0).toUpperCase() }}</span>
    </div>
    <div class="mk-seller__name">{{ seller.name }}</div>
    <div v-if="seller.city" class="mk-seller__meta"><v-icon size="12">mdi-map-marker-outline</v-icon> {{ seller.city }}</div>
    <span class="mk-pill">{{ seller.product_count }} products</span>
    <span v-if="seller.trust && seller.trust.badge === 'trusted'" class="mk-pill" style="background:#e1f5ea;color:#12794a;margin-left:4px">✓ Trusted seller</span>
    <span v-if="seller.trust && seller.trust.rating" class="mk-seller__meta">★ {{ seller.trust.rating }} ({{ seller.trust.review_count }})</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ seller: any }>()
const { img } = useMarket()
const failed = ref(false)
const logo = computed(() => (failed.value ? '' : img(props.seller.logo_path)))
</script>
