<template>
  <div class="mk-grid">
    <div v-for="i in count" :key="i" class="mk-skel mk-skel-card" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>
