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
            <p class="text-grey text-caption font-weight-bold" style="letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;">Join Aadab today</p>
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

          <!-- Form -->
          <v-form
            ref="formRef"
            v-model="formValid"
            @submit.prevent="handleRegister"
          >
            <!-- Common Fields -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.firstName"
                  label="First Name"
                  :rules="requiredRules"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.lastName"
                  label="Last Name"
                  :rules="requiredRules"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
            />

            <v-text-field
              v-model="form.phone"
              label="Phone Number"
              prepend-inner-icon="mdi-phone"
              :rules="phoneRules"
            />

            <!-- Distributor-specific fields -->
            <template v-if="selectedRole === 'Distributor'">
              <v-divider class="my-4" />
              <p class="text-subtitle-2 font-weight-bold text-secondary mb-4" style="letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.75rem !important;">
                Business Information
              </p>

              <v-text-field
                v-model="form.businessName"
                label="Business/Shop Name"
                prepend-inner-icon="mdi-store"
                :rules="requiredRules"
              />

              <v-text-field
                v-model="form.tradeName"
                label="Trade Name (Optional)"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.gstNumber"
                    label="GST Number"
                    :rules="gstRules"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.panNumber"
                    label="PAN Number"
                    :rules="panRules"
                  />
                </v-col>
              </v-row>

              <v-textarea
                v-model="form.businessAddress"
                label="Business Address"
                rows="3"
                :rules="requiredRules"
              />
            </template>

            <v-divider class="my-4" />

            <v-text-field
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="passwordRules"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-text-field
              v-model="form.confirmPassword"
              label="Confirm Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :rules="confirmPasswordRules"
            />

            <!-- Terms -->
            <v-checkbox
              v-model="form.acceptTerms"
              color="accent"
              :rules="[(v) => !!v || 'You must accept the terms']"
            >
              <template v-slot:label>
                <span class="text-caption font-weight-bold">
                  I agree to the
                  <NuxtLink to="/terms" class="text-primary"
                    >Terms & Conditions</NuxtLink
                  >
                </span>
              </template>
            </v-checkbox>

            <!-- Submit -->
            <v-btn
              type="submit"
              color="secondary"
              size="large"
              block
              class="luxury-action-btn font-weight-bold"
              :loading="loading"
              :disabled="!formValid"
            >
              Create Account
            </v-btn>
          </v-form>

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
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const router = useRouter();

const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const selectedRole = ref("User");

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

// Validation rules
const requiredRules = [(v: string) => !!v || "This field is required"];

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const phoneRules = [
  (v: string) => !!v || "Phone is required",
  (v: string) => /^[0-9]{10}$/.test(v) || "Phone must be 10 digits",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 6 || "Password must be at least 6 characters",
];

const confirmPasswordRules = [
  (v: string) => !!v || "Please confirm your password",
  (v: string) => v === form.password || "Passwords do not match",
];

const gstRules = [
  (v: string) => !!v || "GST Number is required",
  (v: string) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) ||
    "Invalid GST format",
];

const panRules = [
  (v: string) => !!v || "PAN Number is required",
  (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) || "Invalid PAN format",
];

// Inject snackbar
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

// Methods
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
      gst_number: form.gstNumber,
      pan_number: form.panNumber,
      business_address: form.businessAddress,
    }),
  };

  const result = await authStore.registerUser(payload);

  loading.value = false;

  if (result.success) {
    showSnackbar("Registration successful! Please login.", "success");
    router.push("/login");
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
</style>
