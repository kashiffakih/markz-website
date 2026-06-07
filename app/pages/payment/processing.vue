<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-8 text-center" max-width="500" elevation="2" rounded="lg">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-6"></v-progress-circular>
      <h2 class="text-h5 font-weight-bold mb-2">Redirecting to PhonePe...</h2>
      <p class="text-body-1 text-grey-darken-1 mb-6">
        Please do not refresh or press back. We are securely transferring you to the payment gateway.
      </p>
      
      <!-- Mock Payment Actions (Since we don't have Web SDK keys) -->
      <v-divider class="mb-6"></v-divider>
      <p class="text-caption text-grey mb-4 text-left">
        * Mock Gateway Interface (No V2 Web Credentials Provided) *
        <br />Order ID: {{ route.query.orderId }}
        <br />Amount: ₹{{ route.query.amount }}
      </p>
      <div class="d-flex justify-space-between gap-4">
        <v-btn color="error" variant="outlined" @click="failPayment">Simulate Failure</v-btn>
        <v-btn color="success" @click="succeedPayment">Simulate Success</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { inject } from 'vue'

const route = useRoute()
const router = useRouter()
const showSnackbar = inject("showSnackbar", (text: string, color: string) => {});

const succeedPayment = () => {
  showSnackbar("Payment Successful via PhonePe!", "success")
  router.push({
    path: "/order-success",
    query: { orderId: route.query.orderId },
  })
}

const failPayment = () => {
  showSnackbar("Payment Failed or Cancelled.", "error")
  router.push("/checkout")
}
</script>
