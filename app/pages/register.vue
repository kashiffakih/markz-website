<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="7" lg="6">
        <v-card class="pa-8" rounded="xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-secondary mb-2">
              Create Account
            </h1>
            <p class="text-grey">Join Aadab today</p>
          </div>

          <!-- Role Tabs -->
          <v-tabs v-model="selectedRole" class="mb-6" grow>
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
              <p class="text-subtitle-2 font-weight-bold text-secondary mb-4">
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
              :rules="[(v) => !!v || 'You must accept the terms']"
            >
              <template v-slot:label>
                <span>
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
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!formValid"
            >
              Create Account
            </v-btn>
          </v-form>

          <!-- Login Link -->
          <p class="text-center mt-6 text-grey">
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
