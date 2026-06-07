<template>
  <div v-if="hasAnyDescription" class="product-description-section">
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <div
        class="icon-container d-flex align-center justify-center rounded-lg mr-3"
      >
        <v-icon icon="mdi-text-box-outline" color="white" size="small" />
      </div>
      <div>
        <h3 class="text-h6 font-weight-bold">Product Details</h3>
        <div class="underline"></div>
      </div>
    </div>

    <!-- Highlights (Small Description) -->
    <CollapsibleCard
      v-if="product.small_description"
      title="Highlights"
      icon="mdi-star-four-points-outline"
      :content="product.small_description"
      :expanded="true"
    />

    <!-- Description (Main) -->
    <CollapsibleCard
      v-if="product.description"
      title="Description"
      icon="mdi-information-outline"
      :content="product.description"
    />

    <!-- Specifications (Description 1) -->
    <CollapsibleCard
      v-if="product.description_1"
      title="Specifications"
      icon="mdi-cog-outline"
      :content="product.description_1"
    />

    <!-- Additional Information (Description 2) -->
    <CollapsibleCard
      v-if="product.description_2"
      title="Additional Information"
      icon="mdi-plus-circle-outline"
      :content="product.description_2"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CollapsibleCard from "./CollapsibleCard.vue";

const props = defineProps<{
  product: any;
}>();

const hasAnyDescription = computed(() => {
  return (
    props.product?.small_description ||
    props.product?.description ||
    props.product?.description_1 ||
    props.product?.description_2
  );
});
</script>

<style scoped>
.icon-container {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #eed056 0%, #f6e27f 100%);
  box-shadow: 0 4px 8px rgba(238, 208, 86, 0.3);
}

.underline {
  height: 3px;
  width: 50px;
  background: linear-gradient(90deg, #eed056 0%, rgba(238, 208, 86, 0.3) 100%);
  border-radius: 2px;
  margin-top: 4px;
}
</style>
