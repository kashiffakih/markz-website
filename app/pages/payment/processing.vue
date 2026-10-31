<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-8 text-center" max-width="500" elevation="2" rounded="lg">
      <v-progress-circular v-if="busy" indeterminate color="primary" size="64" class="mb-6"></v-progress-circular>
      <h2 class="text-h5 font-weight-bold mb-2">Payment</h2>
      <p class="text-body-1 mb-1">Payable amount</p>
      <p class="text-h4 font-weight-bold mb-4">&#8377;{{ route.query.amount }}</p>
      <p class="text-caption text-grey mb-4" v-if="orders.length">
        Orders: <span v-for="(o, i) in orders" :key="o.id">#{{ o.id }}<span v-if="i < orders.length - 1">, </span></span>
      </p>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-left">{{ error }}</v-alert>

      <template v-if="testMode">
        <v-divider class="mb-4"></v-divider>
        <p class="text-caption text-grey mb-4 text-left">
          * Test gateway (sirf development me). Asli PhonePe merchant keys lagne par yahan real redirect aayega. *
        </p>
        <div class="d-flex justify-space-between gap-4">
          <v-btn color="error" variant="outlined" :disabled="busy" @click="failPayment">Simulate Failure</v-btn>
          <v-btn color="success" :loading="busy" @click="succeedPayment">Simulate Success</v-btn>
        </div>
      </template>
      <p v-else class="text-body-2 text-grey-darken-1">
        Online payment abhi live nahi hai. Aapka order save ho gaya hai, payment ke liye hum aapse contact karenge, ya order COD me badalne ke liye support se baat karein.
        <v-btn class="mt-4" block color="primary" to="/profile/orders">My Orders</v-btn>
      </p>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { inject, ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const showSnackbar = inject("showSnackbar", (text: string, color: string) => {});
const busy = ref(false)
const error = ref('')

// gateway test buttons exist only on the dev server
const testMode = import.meta.dev

// "12:499.00,13:250.00" -> [{id, amount}]
const orders = computed(() =>
  String(route.query.orders || route.query.orderId || '')
    .split(',')
    .filter(Boolean)
    .map((p) => {
      const [id, amount] = p.split(':')
      return { id, amount: amount ? Number(amount) : undefined }
    }),
)

const succeedPayment = async () => {
  busy.value = true
  error.value = ''
  const api = useApi()
  try {
    // tell the server each order is paid; it checks the amount against ITS order total
    for (const o of orders.value) {
      const res: any = await api.post('/orders/confirm_payment', {
        order_id: o.id,
        txnid: `TEST-${Date.now()}-${o.id}`,
        paymentmode: 'PhonePe (test)',
        txnamount: o.amount,
      })
      if (res && res.success === false) throw new Error(res.message || 'Payment confirm nahi hua')
    }
    showSnackbar("Payment successful!", "success")
    router.push({ path: "/order-success", query: { orderId: orders.value[0]?.id } })
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Payment confirm nahi ho saka.'
  } finally {
    busy.value = false
  }
}

const failPayment = () => {
  showSnackbar("Payment failed or cancelled. Order 'Pay Now' se baad me pay kar sakte ho.", "error")
  router.push("/profile/orders")
}
</script>
