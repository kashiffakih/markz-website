<template>
  <v-container class="fill-height py-16">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="120" color="success" class="mb-6">
          mdi-check-circle-outline
        </v-icon>

        <h1 class="text-h3 font-weight-bold text-secondary mb-4">
          Order Placed Successfully!
        </h1>

        <p class="text-h6 text-grey mb-2" v-if="orderId">
          Order ID: #{{ orderId }}
        </p>

        <p class="text-body-1 text-grey mb-8">
          Thank you for your purchase. We have received your order and will
          process it shortly.
        </p>

        <div class="d-flex justify-center ga-4">
          <v-btn variant="outlined" size="large" to="/profile/orders">
            View Orders
          </v-btn>

          <v-btn color="primary" size="large" to="/"> Continue Shopping </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute();
const orderId = computed(() => route.query.orderId);
</script>
