<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="11" md="8" lg="7">
        <v-card class="pa-8" flat style="border: 1px solid var(--border-color) !important; background-color: #ffffff;">
          <div class="text-center mb-6">
            <h1 class="text-h3 font-weight-medium text-secondary font-serif mb-2" style="font-size: 2rem !important;">
              Become a Seller
            </h1>
            <div style="width: 30px; height: 1.5px; background-color: var(--accent); margin: 8px auto 16px;"></div>
            <p class="text-grey text-caption font-weight-bold" style="letter-spacing: 0.08em; text-transform: uppercase;">
              Apna shop kholo aur Aadab par becho
            </p>
          </div>

          <v-tabs v-model="tab" color="accent" grow class="mb-6">
            <v-tab value="apply">Apply</v-tab>
            <v-tab value="status">Check Status</v-tab>
          </v-tabs>

          <!-- APPLY -->
          <div v-if="tab === 'apply'">
            <v-alert v-if="submitted" type="success" variant="tonal" class="mb-4">
              Application submit ho gayi! Admin review ke baad aap isi email/password se login kar paayenge.
              Status "Check Status" tab mein dekh sakte ho.
            </v-alert>

            <v-form v-else ref="formRef" v-model="formValid" @submit.prevent="submit">
              <div class="text-subtitle-2 mb-2">Shop Details</div>
              <v-text-field v-model="form.name" label="Shop / Business Name" :rules="required" />
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.owner_name" label="Owner Name" :rules="required" /></v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="form.business_type" label="Business Type" :items="businessTypes" item-title="t" item-value="v" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="form.category_id" label="What will you sell?" :items="categories" item-title="name" item-value="id" clearable />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="form.state" label="State" :items="states" :rules="required" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.city" label="City / Town" :rules="required" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.pincode" label="Pincode (6 digits)" :rules="pincodeRules" maxlength="6" /></v-col>
              </v-row>
              <v-text-field v-model="form.add_1" label="Full pickup address (shop / warehouse)" />

              <div class="text-subtitle-2 mt-4 mb-2">Login Details</div>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.email" label="Email" type="email" :rules="emailRules" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.phone" label="Phone (10 digits)" :rules="phoneRules" /></v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.password" label="Password" type="password" :rules="passwordRules" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.password_confirmation" label="Confirm Password" type="password" :rules="confirmRules" /></v-col>
              </v-row>

              <div class="text-subtitle-2 mt-4 mb-2">KYC & Bank (optional abhi, payout se pehle zaroori)</div>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.gst_number" label="GST Number" :rules="gstRules" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.pan_number" label="PAN Number" :rules="panRules" /></v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.acc_name" label="Account Holder Name" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.acc_no" label="Account Number" /></v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="form.bank" label="Bank Name" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.ifsc_code" label="IFSC Code" :rules="ifscRules" /></v-col>
              </v-row>

              <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3">{{ errorMsg }}</v-alert>

              <v-btn type="submit" color="accent" block size="large" :loading="loading" :disabled="!formValid">
                Submit Application
              </v-btn>
            </v-form>
          </div>

          <!-- STATUS -->
          <div v-else>
            <v-text-field v-model="chk.email" label="Registered Email" type="email" />
            <v-text-field v-model="chk.phone" label="Registered Phone" />
            <v-btn color="accent" block :loading="checking" @click="checkStatus">Check Status</v-btn>
            <v-alert v-if="statusResult" class="mt-4" variant="tonal"
              :type="statusResult.status === 'approved' ? 'success' : statusResult.status === 'rejected' ? 'error' : 'info'">
              Status: <strong class="text-capitalize">{{ statusResult.status }}</strong>
              <div v-if="statusResult.rejection_reason">Reason: {{ statusResult.rejection_reason }}</div>
              <div v-if="statusResult.status === 'approved'">Ab aap <NuxtLink to="/login">login</NuxtLink> kar sakte ho.</div>
            </v-alert>
            <v-alert v-if="statusError" class="mt-4" type="warning" variant="tonal">{{ statusError }}</v-alert>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const api = config.public.apiBase as string;

const tab = ref("apply");
const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const submitted = ref(false);
const errorMsg = ref("");

const categories = ref<any[]>([]);
const businessTypes = [
  { t: "Individual", v: "individual" },
  { t: "Proprietorship", v: "proprietorship" },
  { t: "Partnership", v: "partnership" },
  { t: "Company", v: "company" },
];

const form = reactive<any>({
  name: "", owner_name: "", business_type: "individual", category_id: null, state: "", city: "",
  add_1: "", pincode: "", email: "", phone: "", password: "", password_confirmation: "",
  gst_number: "", pan_number: "", acc_name: "", acc_no: "", bank: "", ifsc_code: "",
});

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];
const required = [(v: any) => !!v || "Required"];
const pincodeRules = [(v: string) => /^[1-9][0-9]{5}$/.test(v || "") || "6 digit pincode likho"];
const emailRules = [(v: string) => /.+@.+\..+/.test(v || "") || "Valid email likho"];
const phoneRules = [(v: string) => /^[0-9]{10}$/.test(v || "") || "10 digit phone"];
const passwordRules = [(v: string) => (v || "").length >= 6 || "Min 6 characters"];
const confirmRules = [(v: string) => v === form.password || "Password match nahi hua"];
const gstRules = [(v: string) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(v) || "Invalid GST"];
const panRules = [(v: string) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(v) || "Invalid PAN"];
const ifscRules = [(v: string) => !v || /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(v) || "Invalid IFSC"];

const list = (r: any) => (Array.isArray(r) ? r : r?.data || r?.cities || r?.categories || []);

onMounted(async () => {
  try { categories.value = list(await $fetch(`${api}/categories`)); } catch (e) {}
});

const submit = async () => {
  if (!formValid.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const payload: any = { ...form };
    Object.keys(payload).forEach((k) => { if (payload[k] === "" || payload[k] === null) delete payload[k]; });
    await $fetch(`${api}/seller_applications/apply`, {
      method: "POST", body: payload, headers: { Accept: "application/json" },
    });
    submitted.value = true;
  } catch (e: any) {
    const errs = e?.data?.errors;
    errorMsg.value = errs ? Object.values(errs).flat().join(" ") : (e?.data?.message || "Submit nahi hua, dobara try karo.");
  } finally {
    loading.value = false;
  }
};

const chk = reactive({ email: "", phone: "" });
const checking = ref(false);
const statusResult = ref<any>(null);
const statusError = ref("");

const checkStatus = async () => {
  checking.value = true;
  statusResult.value = null;
  statusError.value = "";
  try {
    statusResult.value = await $fetch(`${api}/seller_applications/status`, {
      method: "POST", body: { ...chk }, headers: { Accept: "application/json" },
    });
  } catch (e: any) {
    statusError.value = e?.status === 404 ? "Is email/phone se application nahi mili." : "Status check nahi hua.";
  } finally {
    checking.value = false;
  }
};
</script>
