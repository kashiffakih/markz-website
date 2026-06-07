<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-8" rounded="xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-secondary mb-2">
              Welcome Back
            </h1>
            <p class="text-grey">Sign in to your account</p>
          </div>

          <!-- Form -->
          <!-- Login Role Selector -->
          <v-btn-toggle
            v-model="loginRole"
            color="primary"
            rounded="xl"
            group
            mandatory
            class="d-flex w-100 mb-6 border"
          >
            <v-btn value="User" class="flex-grow-1" height="48">
              Customer
            </v-btn>
            <v-btn value="Distributor" class="flex-grow-1" height="48">
              Distributor
            </v-btn>
          </v-btn-toggle>

          <v-form
            ref="formRef"
            v-model="formValid"
            @submit.prevent="handleLogin"
          >
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
              class="mb-4"
            />

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="passwordRules"
              class="mb-2"
              @click:append-inner="showPassword = !showPassword"
            />

            <!-- Forgot Password -->
            <div class="text-right mb-6">
              <NuxtLink
                to="/forgot-password"
                class="text-primary text-decoration-none"
              >
                Forgot Password?
              </NuxtLink>
            </div>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!formValid"
            >
              Sign In
            </v-btn>
          </v-form>

          <!-- Divider -->
          <div class="d-flex align-center my-6">
            <v-divider />
            <span class="mx-4 text-grey">or</span>
            <v-divider />
          </div>

          <!-- Social Login -->
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="grey"
              class="flex-grow-1"
              @click="handleGoogleLogin"
            >
              <v-icon start>mdi-google</v-icon>
              Google
            </v-btn>
            <v-btn
              variant="outlined"
              color="grey"
              class="flex-grow-1"
              @click="handlePhoneLogin"
            >
              <v-icon start>mdi-phone</v-icon>
              Phone
            </v-btn>
          </div>

          <!-- Register Link -->
          <p v-if="!authStore.isLoggedIn" class="text-center mt-6 text-grey">
            Don't have an account?
            <NuxtLink
              to="/register"
              class="text-primary font-weight-bold text-decoration-none"
            >
              Register
            </NuxtLink>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);

const loginRole = ref<"User" | "Distributor">("User");

const email = ref("");
const password = ref("");

// Validation rules
const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 6 || "Password must be at least 6 characters",
];

// Inject snackbar
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

// Methods
const handleLogin = async () => {
  if (!formValid.value) return;

  loading.value = true;

  // Pass selected role to login action
  const result = await authStore.login(
    email.value,
    password.value,
    loginRole.value,
  );

  loading.value = false;

  if (result.success) {
    showSnackbar("Login successful!", "success");
    const route = useRoute();
    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } else {
    showSnackbar(result.message || "Login failed", "error");
  }
};

const handleGoogleLogin = () => {
  // TODO: Implement Google login
  showSnackbar("Google login coming soon", "info");
};

const handlePhoneLogin = () => {
  // TODO: Implement Phone OTP login
  showSnackbar("Phone login coming soon", "info");
};

// Redirect if already logged in
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push("/");
  }
});
</script>
