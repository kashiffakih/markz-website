<template>
  <div v-if="policy" class="d-flex flex-wrap ga-2 mb-4">
    <v-chip v-if="policy.return_window_days > 0" size="small" variant="tonal" color="primary" prepend-icon="mdi-undo-variant">
      {{ policy.return_window_days }} din easy return
    </v-chip>
    <v-chip v-if="Number(policy.free_delivery_above) > 0" size="small" variant="tonal" color="success" prepend-icon="mdi-truck-fast-outline">
      ₹{{ Number(policy.free_delivery_above).toLocaleString('en-IN') }}+ par free delivery
    </v-chip>
    <v-chip size="small" variant="tonal" color="secondary" prepend-icon="mdi-shield-check-outline">
      Galat / kharab product par poora refund
    </v-chip>
  </div>
</template>

<script setup lang="ts">
const { policy, load } = usePolicy()
onMounted(load)
</script>
