<template>
  <v-container class="py-16">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-8" rounded="xl">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-secondary mb-2">
              Forgot Password?
            </h1>
            <p class="text-grey">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
            <v-text-field
              v-model="email"
              label="Email Address"
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
              class="mb-4"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!valid"
            >
              Send Reset Link
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            <NuxtLink
              to="/login"
              class="text-decoration-none font-weight-bold text-primary"
            >
              <v-icon start size="small">mdi-arrow-left</v-icon>
              Back to Login
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const valid = ref(false);
const loading = ref(false);
const email = ref("");
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const handleSubmit = async () => {
  if (!valid.value) return;

  loading.value = true;
  const api = useApi();

  // Simulated endpoint
  try {
    const response = await api.post("/forgot-password", { email: email.value });
    if (response.success) {
      showSnackbar("Reset link sent to your email", "success");
      email.value = "";
    } else {
      showSnackbar(response.message || "Failed to send reset link", "error");
    }
  } catch (e) {
    // Fallback simulation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showSnackbar("Reset link sent to your email", "success");
    email.value = "";
  }

  loading.value = false;
};
</script>
