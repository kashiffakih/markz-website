<template>
  <nav class="mk-bottomnav" aria-label="Main">
    <NuxtLink to="/" :class="{ 'is-active': is('/') }"><v-icon>mdi-home-outline</v-icon>Home</NuxtLink>
    <NuxtLink to="/shop" :class="{ 'is-active': is('/shop') || is('/products') || is('/categories') }"><v-icon>mdi-shopping-outline</v-icon>Shop</NuxtLink>
    <NuxtLink to="/sellers" :class="{ 'is-active': is('/sellers') }"><v-icon>mdi-storefront-outline</v-icon>Sellers</NuxtLink>
    <NuxtLink to="/cart" :class="{ 'is-active': is('/cart') }">
      <v-icon>mdi-cart-outline</v-icon>Cart
      <span v-if="mounted && count > 0" class="mk-bottomnav__badge">{{ count > 99 ? '99+' : count }}</span>
    </NuxtLink>
    <NuxtLink :to="mounted && loggedIn ? '/profile' : '/login'" :class="{ 'is-active': is('/profile') || is('/login') }">
      <v-icon>mdi-account-outline</v-icon>{{ mounted && loggedIn ? 'Account' : 'Login' }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@stores/auth'
import { useCartStore } from '@stores/cart'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const loggedIn = computed(() => auth.isLoggedIn)
const count = computed(() => cart.itemCount)
const is = (p: string) => (p === '/' ? route.path === '/' : route.path === p || route.path.startsWith(p + '/'))
</script>
