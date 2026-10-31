<template>
  <v-dialog v-model="open" max-width="520" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-4">
        <span class="font-weight-bold">Order #{{ order?.id }} return karo</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3">{{ error }}</v-alert>

        <div class="text-subtitle-2 font-weight-bold mb-2">Return ki wajah kya hai?</div>
        <v-radio-group v-model="reason" hide-details class="mb-2">
          <v-radio v-for="r in reasons" :key="r.code" :value="r.code" color="primary">
            <template #label>
              <span class="text-body-2">{{ r.label }}</span>
            </template>
          </v-radio>
        </v-radio-group>

        <v-alert v-if="selected" :type="selected.fault === 'customer' ? 'info' : 'success'" variant="tonal" density="compact" class="mb-3">
          <template v-if="selected.fault === 'customer'">
            Is wajah par refund <b>₹{{ money(refundIfCustomer) }}</b> hoga
            (delivery fee ₹{{ money(deliveryPaid) }} aur return fee ₹{{ money(Number(policy?.customer_return_fee || 0)) }} kategi).
          </template>
          <template v-else>
            Poora paisa wapas milega: <b>₹{{ money(paid) }}</b>. Koi return fee nahi.
          </template>
        </v-alert>

        <v-textarea v-model="description" label="Aur kuch batana ho? (optional)" rows="2" auto-grow variant="outlined" density="comfortable" hide-details class="mb-3" maxlength="2000" />

        <v-radio-group v-model="refundMode" inline hide-details label="Refund kaha chahiye?">
          <v-radio label="Markz wallet (turant)" value="wallet" color="primary" />
          <v-radio label="Original payment" value="original" color="primary" />
        </v-radio-group>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-btn variant="text" @click="open = false">Cancel</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" :loading="saving" :disabled="!reason" @click="submit">Return request bhejo</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; order: any | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'done', r: any): void }>()

const api = useApi()
const { policy, load } = usePolicy()

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const reason = ref('')
const description = ref('')
const refundMode = ref('wallet')
const saving = ref(false)
const error = ref('')

const reasons = computed<any[]>(() => policy.value?.return_reasons || [])
const selected = computed(() => reasons.value.find((r) => r.code === reason.value))
const paid = computed(() => Number(props.order?.total_amount || props.order?.order_cost || 0))
const deliveryPaid = computed(() => Number(props.order?.delivery_amount || 0))
const refundIfCustomer = computed(() => Math.max(0, paid.value - deliveryPaid.value - Number(policy.value?.customer_return_fee || 0)))
const money = (n: number) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

watch(open, async (v) => {
  if (v) {
    reason.value = ''
    description.value = ''
    error.value = ''
    await load()
  }
})

const submit = async () => {
  if (!props.order || !reason.value) return
  saving.value = true
  error.value = ''
  const r: any = await api.post('/my_returns', {
    order_id: props.order.id,
    reason: reason.value,
    description: description.value || undefined,
    refund_mode: refundMode.value,
  })
  saving.value = false
  if (r && r.data && r.data.id) {
    emit('done', r.data)
    open.value = false
  } else {
    error.value = (r && (r.message || (r.errors && Object.values(r.errors as any)[0]))) || 'Return request nahi ja saki, dobara try karo.'
    if (Array.isArray(error.value)) error.value = (error.value as any)[0]
  }
}
</script>
