<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="7" lg="6">
        <v-card class="pa-8" flat style="border: 1px solid var(--border-color) !important; background-color: #ffffff; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04) !important;">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-h3 font-weight-medium text-secondary font-serif mb-2" style="font-size: 2rem !important;">
              Create Account
            </h1>
            <div style="width: 30px; height: 1.5px; background-color: var(--accent); margin: 8px auto 16px;"></div>
            <p class="text-grey text-caption font-weight-bold" style="letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;">Join Markz today</p>
          </div>

          <!-- Role Tabs -->
          <v-tabs v-model="selectedRole" color="accent" class="mb-6" grow>
            <v-tab value="User">
              <v-icon start>mdi-account</v-icon>
              Customer
            </v-tab>
            <v-tab value="Distributor">
              <v-icon start>mdi-store</v-icon>
              Distributor
            </v-tab>
          </v-tabs>

          <!-- Step indicator -->
          <div class="d-flex align-center justify-center mb-6 reg-steps">
            <span class="reg-dot" :class="{ on: step >= 1 }">1</span>
            <span class="reg-line" :class="{ on: step >= 2 }"></span>
            <span class="reg-dot" :class="{ on: step >= 2 }">2</span>
          </div>

          <!-- STEP 1: mobile + email (saved as soon as it is entered) -->
          <v-form v-if="step === 1" ref="form1" @submit.prevent="goStep2">
            <p class="text-body-2 text-grey-darken-1 mb-4 text-center">
              Pehle apna mobile number aur email batayein.
            </p>
            <v-text-field
              v-model="form.phone"
              label="Mobile Number"
              prepend-inner-icon="mdi-phone"
              inputmode="numeric"
              maxlength="10"
              autocomplete="tel-national"
              validate-on="blur"
              :rules="phoneRules"
              @update:model-value="(v: string) => (form.phone = digits(v))"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              autocomplete="email"
              validate-on="blur"
              :rules="emailRules"
            />
            <v-btn type="submit" color="secondary" size="large" block class="luxury-action-btn font-weight-bold" :loading="savingLead">
              Continue
            </v-btn>
          </v-form>

          <!-- STEP 2: the rest of the details -->
          <v-form v-else ref="formRef" v-model="formValid" @submit.prevent="handleRegister">
            <div class="reg-summary mb-4">
              <div>
                <v-icon size="small" class="mr-1">mdi-phone</v-icon>{{ form.phone }}
                <span class="mx-2 text-grey">|</span>
                <v-icon size="small" class="mr-1">mdi-email-outline</v-icon>{{ form.email }}
              </div>
              <a class="reg-change" @click="step = 1">Change</a>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.firstName" label="First Name" validate-on="blur" :rules="requiredRules" autocomplete="given-name" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.lastName" label="Last Name" validate-on="blur" :rules="requiredRules" autocomplete="family-name" />
              </v-col>
            </v-row>

            <!-- Distributor-specific fields -->
            <template v-if="selectedRole === 'Distributor'">
              <p class="text-subtitle-2 font-weight-bold text-secondary mb-4 mt-2" style="letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.75rem !important;">
                Business Information
              </p>

              <v-text-field v-model="form.businessName" label="Business/Shop Name" prepend-inner-icon="mdi-store" validate-on="blur" :rules="requiredRules" />
              <v-text-field v-model="form.tradeName" label="Trade Name (Optional)" />

              <v-radio-group v-model="hasGst" inline hide-details class="mb-2">
                <v-radio label="Mere paas GST number hai" :value="true" color="accent" />
                <v-radio label="GST nahi hai" :value="false" color="accent" />
              </v-radio-group>

              <v-row>
                <v-col cols="12" md="6" v-if="hasGst">
                  <v-text-field
                    v-model="form.gstNumber"
                    label="GST Number"
                    validate-on="blur"
                    :rules="gstRules"
                    @update:model-value="(v: string) => (form.gstNumber = (v || '').toUpperCase())"
                  />
                </v-col>
                <v-col cols="12" :md="hasGst ? 6 : 12">
                  <v-text-field
                    v-model="form.panNumber"
                    label="PAN Number (Optional)"
                    validate-on="blur"
                    :rules="panRules"
                    @update:model-value="(v: string) => (form.panNumber = (v || '').toUpperCase())"
                  />
                </v-col>
              </v-row>
              <p v-if="!hasGst" class="text-caption text-grey mb-2">
                GST ke bina bhi account ban jayega. Baad me kabhi bhi GST add kar sakte hain.
              </p>

              <v-textarea v-model="form.businessAddress" label="Business Address" rows="3" validate-on="blur" :rules="requiredRules" />
            </template>

            <v-divider class="my-4" />

            <v-text-field
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              autocomplete="new-password"
              validate-on="blur"
              :rules="passwordRules"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-text-field
              v-model="form.confirmPassword"
              label="Confirm Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              autocomplete="new-password"
              validate-on="blur"
              :rules="confirmPasswordRules"
            />

            <!-- Terms -->
            <v-checkbox v-model="form.acceptTerms" color="accent" :rules="[(v) => !!v || 'You must accept the terms']">
              <template v-slot:label>
                <span class="text-caption font-weight-bold">
                  I agree to the
                  <NuxtLink to="/terms" class="text-primary">Terms & Conditions</NuxtLink>
                </span>
              </template>
            </v-checkbox>

            <div class="d-flex ga-3">
              <v-btn variant="outlined" size="large" class="font-weight-bold" @click="step = 1">Back</v-btn>
              <v-btn type="submit" color="secondary" size="large" block class="luxury-action-btn font-weight-bold" :loading="loading" :disabled="!formValid">
                Create Account
              </v-btn>
            </div>
          </v-form>

          <!-- OR Divider -->
          <div class="d-flex align-center my-6">
            <v-divider />
            <span class="px-4 text-overline text-grey">OR</span>
            <v-divider />
          </div>

          <!-- Social Login -->
          <div class="d-flex justify-center">
            <v-btn
              variant="outlined"
              color="secondary"
              block
              size="large"
              class="font-weight-bold"
              style="
                border-color: var(--border-color) !important;
                border-radius: 6px !important;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 0.75rem;
              "
              @click="handleGoogleLogin"
            >
              <v-icon start>mdi-google</v-icon>
              Google
            </v-btn>
          </div>

          <!-- Login Link -->
          <p class="text-center mt-6 text-grey text-body-2">
            Already have an account?
            <NuxtLink
              to="/login"
              class="text-primary font-weight-bold text-decoration-none"
            >
              Sign In
            </NuxtLink>
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Modal -->
    <ClientOnly>
      <RegistrationSuccessModal
        v-model="showSuccessModal"
        :userName="registeredUserName"
        :isWholesaler="selectedRole === 'Distributor'"
        :bonusPoints="100"
        @closed="authStore.isLoggedIn ? router.push('/') : router.push('/login')"
      />
    </ClientOnly>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import RegistrationSuccessModal from "~/components/RegistrationSuccessModal.vue";

const router = useRouter();

const step = ref(1);
const form1 = ref();
const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const savingLead = ref(false);
const showPassword = ref(false);
const selectedRole = ref("User");
const hasGst = ref(false);
const showSuccessModal = ref(false);
const registeredUserName = ref("");

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  // Distributor fields
  businessName: "",
  tradeName: "",
  gstNumber: "",
  panNumber: "",
  businessAddress: "",
});

const digits = (v: string) => String(v || "").replace(/\D/g, "").slice(0, 10);

// Validation rules
const requiredRules = [(v: string) => !!v || "This field is required"];

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const phoneRules = [
  (v: string) => !!v || "Mobile number is required",
  (v: string) => /^[6-9][0-9]{9}$/.test(v) || "Enter a valid 10 digit mobile number",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 6 || "Password must be at least 6 characters",
];

const confirmPasswordRules = [
  (v: string) => !!v || "Please confirm your password",
  (v: string) => v === form.password || "Passwords do not match",
];

// GST is optional: only checked when the user says they have one
const gstRules = [
  (v: string) => !!v || "GST Number likhiye (ya 'GST nahi hai' chuniye)",
  (v: string) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) ||
    "Invalid GST format",
];

const panRules = [
  (v: string) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) || "Invalid PAN format",
];

// the role tab changes the lead's type, and the gst toggle resets with it
watch(selectedRole, () => {
  hasGst.value = false;
  form.gstNumber = "";
});

// every contact is saved the moment step 1 is done (even if the person never finishes)
const saveLead = async (stepNo: number) => {
  try {
    const api = useApi();
    await api.post("/signup_leads", {
      phone: form.phone,
      email: form.email,
      role: selectedRole.value,
      first_name: form.firstName || undefined,
      last_name: form.lastName || undefined,
      step: stepNo,
      source: "website",
    });
  } catch (e) {
    /* a lead that fails to save must never block registration */
  }
};

const goStep2 = async () => {
  const res = await form1.value?.validate();
  if (!res?.valid) return;
  savingLead.value = true;
  await saveLead(1);
  savingLead.value = false;
  step.value = 2;
};

// Inject snackbar
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

// Methods
declare const google: any;

useHead({
  script: [
    { src: 'https://accounts.google.com/gsi/client', async: true, defer: true }
  ]
});

const handleGoogleLogin = () => {
  if (typeof google === 'undefined') {
    showSnackbar("Google Login is loading. Please try again in a moment.", "info");
    return;
  }
  
  const client = google.accounts.oauth2.initTokenClient({
    client_id: '990776187523-31hv31ogtp5c4pdpf5t5f4d687ve4tct.apps.googleusercontent.com',
    scope: 'email profile',
    callback: async (response: any) => {
      if (response.access_token) {
        loading.value = true;
        const authStore = useAuthStore();
        try {
          // Fetch user info from Google
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }).then(res => res.json());
          
          if (userInfo.email) {
            const loginResult = await authStore.login(
              userInfo.email, 
              undefined, 
              selectedRole.value as "User" | "Distributor", 
              true, 
              "GOOGLE"
            );
            
            if (loginResult.success) {
              if (loginResult.is_new_user) {
                registeredUserName.value = userInfo.name || userInfo.email;
                showSuccessModal.value = true;
              } else {
                showSnackbar("Logged in successfully with Google!", "success");
                router.push("/");
              }
            } else {
              showSnackbar(loginResult.message || "Failed to log in with Google", "error");
            }
          } else {
             showSnackbar("Could not retrieve email from Google", "error");
          }
        } catch (e) {
          console.error("Google Login Error:", e);
          showSnackbar("Failed to fetch Google profile.", "error");
        } finally {
          loading.value = false;
        }
      }
    },
  });
  
  client.requestAccessToken();
};

const handleRegister = async () => {
  if (!formValid.value) return;

  loading.value = true;
  const authStore = useAuthStore();

  const payload = {
    first_name: form.firstName,
    last_name: form.lastName,
    email: form.email,
    phone: form.phone,
    password: form.password,
    role: selectedRole.value,
    ...(selectedRole.value === "Distributor" && {
      business_name: form.businessName,
      trade_name: form.tradeName,
      gst_number: hasGst.value ? form.gstNumber : "",
      pan_number: form.panNumber,
      business_address: form.businessAddress,
    }),
  };

  const result = await authStore.registerUser(payload);

  loading.value = false;

  if (result.success) {
    saveLead(2);
    registeredUserName.value = form.firstName;
    showSuccessModal.value = true;
  } else {
    showSnackbar(result.message || "Registration failed", "error");
  }
};
</script>

<style scoped>
.v-tabs :deep(.v-tab) {
  font-family: 'Urbanist', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.luxury-action-btn {
  background: var(--secondary) !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600 !important;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.luxury-action-btn:hover:not(:disabled) {
  background: var(--accent) !important;
  box-shadow: 0 8px 24px rgba(197, 168, 80, 0.25) !important;
}

.text-primary {
  color: var(--accent) !important;
}

.reg-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; background: #eceff1; color: #7a8288;
}
.reg-dot.on { background: var(--accent); color: #fff; }
.reg-line { width: 60px; height: 2px; background: #eceff1; margin: 0 8px; }
.reg-line.on { background: var(--accent); }
.reg-summary {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;
  padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; background: #fafbfa; font-size: 0.85rem;
}
.reg-change { color: var(--accent); font-weight: 700; cursor: pointer; font-size: 0.8rem; }
</style>
