<template>
  <NuxtLink :to="`/products/${product.id}`" class="mk-pcard">
    <div class="mk-pcard__media">
      <img v-if="src" :src="src" :alt="product.name" loading="lazy" @error="onErr" />
      <v-icon v-else size="44" color="grey-lighten-1" class="ma-auto d-block" style="margin-top:35%">mdi-image-outline</v-icon>
      <span v-if="product.discount_percent > 0" class="mk-pcard__badge">{{ product.discount_percent }}% OFF</span>
      <div v-if="product.in_stock === false" class="mk-pcard__oos">Out of stock</div>
    </div>
    <div class="mk-pcard__body">
      <div v-if="product.seller" class="mk-pcard__seller">by {{ product.seller.name }}</div>
      <div class="mk-pcard__name">{{ product.name }}</div>
      <div class="mk-pcard__price">
        <span class="mk-pcard__now">{{ money(product.price) }}</span>
        <span v-if="product.mrp" class="mk-pcard__mrp">{{ money(product.mrp) }}</span>
        <span v-if="product.discount_percent > 0" class="mk-pcard__off">{{ product.discount_percent }}% off</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ product: any }>()
const { img, money } = useMarket()
const failed = ref(false)
const src = computed(() => (failed.value ? '' : img(props.product.image)))
const onErr = () => { failed.value = true }
</script>
