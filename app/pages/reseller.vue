<template>
  <v-container class="py-6" style="max-width:1100px">
    <h1 class="text-h5 font-weight-medium mb-4">Reseller Panel</h1>

    <v-alert v-if="needLogin" type="info" variant="tonal">
      Pehle <NuxtLink to="/login">login</NuxtLink> karo.
    </v-alert>

    <div v-else-if="loading" class="text-center pa-8"><v-progress-circular indeterminate /></div>

    <!-- Apply -->
    <v-card v-else-if="!me || !me.applied" flat class="pa-4" style="border:1px solid var(--border-color) !important;">
      <h2 class="text-h6 mb-1">Reseller bano, margin kamao</h2>
      <p class="text-grey mb-4">Products apne customers ko becho, apna margin khud set karo. Delivery + {{ rules.return_window_days || 7 }} din baad margin wallet me.</p>
      <v-text-field v-model="form.business_name" label="Business / shop name" variant="outlined" density="compact" />
      <v-text-field v-model="form.phone" label="Phone" variant="outlined" density="compact" />
      <v-btn color="accent" :loading="busy" @click="apply">Apply karo</v-btn>
      <v-alert v-if="err" type="error" variant="tonal" class="mt-3">{{ err }}</v-alert>
    </v-card>

    <v-alert v-else-if="me.data.status === 'pending'" type="warning" variant="tonal">Aapki application review me hai. Admin approve karega to yahan catalog khul jayega.</v-alert>
    <v-alert v-else-if="me.data.status !== 'approved'" type="error" variant="tonal">
      Application {{ me.data.status }}. {{ me.data.rejection_reason }}
    </v-alert>

    <!-- Approved -->
    <template v-else>
      <v-row class="mb-2">
        <v-col cols="6" md="3"><v-card flat class="pa-3" style="border:1px solid #eee"><div class="text-caption text-grey">Wallet</div><div class="text-h6">₹{{ summary.wallet_balance ?? me.data.wallet_balance }}</div></v-card></v-col>
        <v-col cols="6" md="3"><v-card flat class="pa-3" style="border:1px solid #eee"><div class="text-caption text-grey">Pending margin</div><div class="text-h6">₹{{ summary.pending_balance ?? me.data.pending_balance }}</div></v-card></v-col>
        <v-col cols="6" md="3"><v-card flat class="pa-3" style="border:1px solid #eee"><div class="text-caption text-grey">Total earned</div><div class="text-h6">₹{{ summary.total_earned ?? me.data.total_earned }}</div></v-card></v-col>
        <v-col cols="6" md="3"><v-card flat class="pa-3" style="border:1px solid #eee"><div class="text-caption text-grey">Withdrawn</div><div class="text-h6">₹{{ summary.total_withdrawn ?? me.data.total_withdrawn }}</div></v-card></v-col>
      </v-row>

      <v-tabs v-model="tab" color="accent">
        <v-tab value="catalog">Catalog</v-tab>
        <v-tab value="orders">My Orders</v-tab>
        <v-tab value="wallet">Wallet</v-tab>
      </v-tabs>

      <!-- Catalog -->
      <div v-if="tab === 'catalog'" class="mt-4">
        <v-row>
          <v-col cols="12" md="7">
            <v-text-field v-model="search" label="Search products" variant="outlined" density="compact" append-inner-icon="mdi-magnify" @keyup.enter="loadCatalog" @click:append-inner="loadCatalog" />
            <v-card v-for="p in catalog" :key="p.id" flat class="pa-3 mb-2 d-flex" style="border:1px solid #eee">
              <img v-if="p.image" :src="img(p.image)" style="width:70px;height:70px;object-fit:cover;border-radius:6px" class="mr-3" />
              <div style="flex:1">
                <strong>{{ p.name }}</strong>
                <div class="text-caption text-grey">{{ p.seller }}</div>
                <div class="d-flex flex-wrap mt-1">
                  <v-btn v-for="pk in p.packs" :key="pk.id" size="x-small" variant="outlined" class="mr-1 mb-1" :disabled="pk.stock < 1" @click="addToCart(p, pk)">
                    {{ pk.value }} · ₹{{ pk.price }} +
                  </v-btn>
                </div>
              </div>
            </v-card>
            <div v-if="!catalog.length" class="text-grey text-center pa-4">Koi product nahi mila</div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card flat class="pa-3" style="border:1px solid #eee">
              <h3 class="text-subtitle-1 mb-2">Customer order</h3>
              <div v-if="!cart.length" class="text-grey text-caption">Catalog se pack add karo.</div>
              <div v-for="(c, i) in cart" :key="c.key" class="mb-3">
                <div class="d-flex justify-space-between">
                  <span>{{ c.name }} <small class="text-grey">({{ c.pack_value }})</small></span>
                  <v-btn icon="mdi-close" size="x-small" variant="text" @click="cart.splice(i, 1)" />
                </div>
                <div class="d-flex align-center">
                  <v-text-field v-model.number="c.quantity" type="number" min="1" label="Qty" density="compact" hide-details variant="outlined" style="max-width:80px" class="mr-2" />
                  <v-text-field v-model.number="c.margin" type="number" min="0" label="Margin / unit ₹" density="compact" hide-details variant="outlined" />
                </div>
                <div class="text-caption text-grey">Base ₹{{ c.price }} → customer price ₹{{ (Number(c.price) + Number(c.margin || 0)).toFixed(2) }}</div>
              </div>
              <template v-if="cart.length">
                <v-divider class="my-2" />
                <div class="d-flex justify-space-between"><span>Customer se lena</span><strong>₹{{ collectTotal.toFixed(2) }}</strong></div>
                <div class="d-flex justify-space-between text-success"><span>Aapka margin</span><strong>₹{{ marginTotal.toFixed(2) }}</strong></div>
                <v-text-field v-model="cust.name" label="Customer name" density="compact" variant="outlined" class="mt-3" hide-details="auto" />
                <v-text-field v-model="cust.phone" label="Customer phone" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
                <v-text-field v-model="cust.add_1" label="Address" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
                <div class="d-flex mt-2">
                  <v-text-field v-model="cust.city" label="City" density="compact" variant="outlined" class="mr-2" hide-details="auto" />
                  <v-text-field v-model="cust.state" label="State" density="compact" variant="outlined" hide-details="auto" />
                </div>
                <v-text-field v-model="cust.pincode" label="Pincode" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
                <v-btn block color="accent" class="mt-3" :loading="busy" @click="placeOrder">Order place karo</v-btn>
              </template>
              <v-alert v-if="err" type="error" variant="tonal" class="mt-3">{{ err }}</v-alert>
              <v-alert v-if="ok" type="success" variant="tonal" class="mt-3">{{ ok }}</v-alert>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Orders -->
      <div v-if="tab === 'orders'" class="mt-4">
        <v-table density="compact">
          <thead><tr><th>Order</th><th>Customer</th><th class="text-right">Margin</th><th>Margin status</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>#{{ o.order_id }}<div class="text-caption text-grey" v-if="o.order">{{ o.order.is_delivered ? 'Delivered' : 'In progress' }}</div></td>
              <td>{{ o.customer_name }}<div class="text-caption text-grey">{{ o.customer_phone }}</div></td>
              <td class="text-right">₹{{ o.margin_amount }}</td>
              <td><v-chip size="x-small" :color="o.status === 'credited' ? 'success' : o.status === 'reversed' ? 'error' : 'warning'">{{ o.status }}</v-chip></td>
              <td>{{ fmt(o.created_at) }}</td>
            </tr>
            <tr v-if="!orders.length"><td colspan="5" class="text-center text-grey pa-4">Abhi koi order nahi</td></tr>
          </tbody>
        </v-table>
      </div>

      <!-- Wallet -->
      <div v-if="tab === 'wallet'" class="mt-4">
        <v-row>
          <v-col cols="12" md="5">
            <v-card flat class="pa-3 mb-3" style="border:1px solid #eee">
              <h3 class="text-subtitle-1 mb-2">Payout details</h3>
              <v-text-field v-model="payout.upi_id" label="UPI ID" density="compact" variant="outlined" hide-details="auto" />
              <v-text-field v-model="payout.acc_name" label="Account holder" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
              <v-text-field v-model="payout.acc_no" label="Account number" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
              <v-text-field v-model="payout.ifsc_code" label="IFSC" density="compact" variant="outlined" class="mt-2" hide-details="auto" />
              <v-btn class="mt-3" variant="outlined" :loading="busy" @click="savePayout">Save</v-btn>
            </v-card>
            <v-card flat class="pa-3" style="border:1px solid #eee">
              <h3 class="text-subtitle-1 mb-2">Withdraw (min ₹{{ rules.min_withdrawal || 100 }})</h3>
              <v-text-field v-model.number="wAmount" type="number" label="Amount ₹" density="compact" variant="outlined" hide-details="auto" />
              <v-btn class="mt-3" color="accent" :loading="busy" @click="withdraw">Request withdrawal</v-btn>
            </v-card>
            <v-alert v-if="err" type="error" variant="tonal" class="mt-3">{{ err }}</v-alert>
            <v-alert v-if="ok" type="success" variant="tonal" class="mt-3">{{ ok }}</v-alert>
          </v-col>
          <v-col cols="12" md="7">
            <h3 class="text-subtitle-1 mb-1">Withdrawals</h3>
            <v-table density="compact" class="mb-4">
              <thead><tr><th>#</th><th class="text-right">Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                <tr v-for="w in withdrawals" :key="w.id"><td>{{ w.id }}</td><td class="text-right">₹{{ w.amount }}</td>
                  <td>{{ w.status }}<div class="text-caption text-grey" v-if="w.remarks">{{ w.remarks }}</div></td><td>{{ fmt(w.created_at) }}</td></tr>
                <tr v-if="!withdrawals.length"><td colspan="4" class="text-center text-grey">Koi withdrawal nahi</td></tr>
              </tbody>
            </v-table>
            <h3 class="text-subtitle-1 mb-1">Ledger</h3>
            <v-table density="compact">
              <thead><tr><th>Type</th><th class="text-right">Wallet</th><th class="text-right">Pending</th><th>Date</th></tr></thead>
              <tbody>
                <tr v-for="t in txns" :key="t.id"><td>{{ t.type }}<div class="text-caption text-grey">{{ t.note }}</div></td>
                  <td class="text-right">{{ t.amount }}</td><td class="text-right">{{ t.pending_effect }}</td><td>{{ fmt(t.created_at) }}</td></tr>
                <tr v-if="!txns.length"><td colspan="4" class="text-center text-grey">Koi entry nahi</td></tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi();
const config = useRuntimeConfig();
const mediaBase = config.public.mediaBase as string;

const needLogin = ref(false);
const loading = ref(true);
const busy = ref(false);
const err = ref("");
const ok = ref("");
const me = ref<any>(null);
const rules = ref<any>({});
const tab = ref("catalog");
const form = reactive({ business_name: "", phone: "" });

const catalog = ref<any[]>([]);
const search = ref("");
const cart = ref<any[]>([]);
const cust = reactive({ name: "", phone: "", add_1: "", city: "", state: "", pincode: "" });

const orders = ref<any[]>([]);
const summary = ref<any>({});
const txns = ref<any[]>([]);
const withdrawals = ref<any[]>([]);
const payout = reactive({ upi_id: "", acc_name: "", acc_no: "", ifsc_code: "" });
const wAmount = ref<number | null>(null);

const img = (p: string) => (p.startsWith("http") ? p : `${mediaBase}${p}`);
const fmt = (d: string) => (d ? new Date(d.replace(" ", "T")).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "");
const errMsg = (res: any) => {
  if (res?.errors) return Object.values(res.errors).flat().join(" ");
  return res?.message || "Kuch gadbad hui";
};

const collectTotal = computed(() => cart.value.reduce((s, c) => s + (Number(c.price) + Number(c.margin || 0)) * Number(c.quantity || 0), 0));
const marginTotal = computed(() => cart.value.reduce((s, c) => s + Number(c.margin || 0) * Number(c.quantity || 0), 0));

const loadMe = async () => {
  const res: any = await api.get("/reseller/me");
  if (res?.message === "Unauthenticated.") { needLogin.value = true; return; }
  me.value = res;
  rules.value = res?.rules || {};
  if (res?.data) {
    payout.upi_id = res.data.upi_id || ""; payout.acc_name = res.data.acc_name || "";
    payout.acc_no = res.data.acc_no || ""; payout.ifsc_code = res.data.ifsc_code || "";
  }
};
const loadCatalog = async () => {
  const res: any = await api.get("/reseller/catalog", search.value ? { search: search.value } : undefined);
  catalog.value = res?.data || [];
};
const loadOrders = async () => { const res: any = await api.get("/reseller/orders"); orders.value = res?.data || []; };
const loadWallet = async () => {
  const res: any = await api.get("/reseller/wallet");
  summary.value = res?.summary || {}; txns.value = res?.transactions?.data || [];
  const w: any = await api.get("/reseller/withdrawals"); withdrawals.value = w?.data || [];
};
const loadAll = async () => { await Promise.all([loadCatalog(), loadOrders(), loadWallet()]); };

const apply = async () => {
  err.value = ""; busy.value = true;
  const res: any = await api.post("/reseller/apply", { ...form });
  busy.value = false;
  if (res?.data?.id) await loadMe(); else err.value = errMsg(res);
};

const addToCart = (p: any, pk: any) => {
  const key = `${p.id}-${pk.id}`;
  const ex = cart.value.find((c) => c.key === key);
  if (ex) { ex.quantity += 1; return; }
  cart.value.push({ key, product_id: p.id, product_pack: pk.id, name: p.name, pack_value: pk.value, price: pk.price, quantity: 1, margin: 0 });
};

const placeOrder = async () => {
  err.value = ""; ok.value = ""; busy.value = true;
  const res: any = await api.post("/reseller/orders", {
    customer: { ...cust },
    items: cart.value.map((c) => ({ product_id: c.product_id, product_pack: c.product_pack, quantity: c.quantity, margin: c.margin || 0 })),
  });
  busy.value = false;
  if (res?.success) {
    ok.value = `${res.message} Customer se ₹${res.collect_total} lena hai.`;
    cart.value = [];
    await Promise.all([loadOrders(), loadWallet(), loadCatalog()]);
  } else err.value = errMsg(res);
};

const savePayout = async () => {
  err.value = ""; ok.value = ""; busy.value = true;
  const res: any = await api.put("/reseller/payout", { ...payout });
  busy.value = false;
  if (res?.data) ok.value = "Payout details save ho gaye."; else err.value = errMsg(res);
};

const withdraw = async () => {
  err.value = ""; ok.value = ""; busy.value = true;
  const res: any = await api.post("/reseller/withdrawals", { amount: wAmount.value });
  busy.value = false;
  if (res?.data?.id) { ok.value = "Withdrawal request bhej di."; wAmount.value = null; await loadWallet(); } else err.value = errMsg(res);
};

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { needLogin.value = true; loading.value = false; return; }
  await loadMe();
  if (me.value?.data?.status === "approved") await loadAll();
  loading.value = false;
});
</script>
