<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card
          class="pa-8"
          flat
          style="
            border: 1px solid var(--border-color) !important;
            background-color: #ffffff;
            box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.04) !important;
          "
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <h1
              class="text-h3 font-weight-medium text-secondary font-serif mb-2"
              style="font-size: 2rem !important"
            >
              Welcome Back
            </h1>
            <div
              style="
                width: 30px;
                height: 1.5px;
                background-color: var(--accent);
                margin: 8px auto 16px;
              "
            ></div>
            <p
              class="text-grey text-caption font-weight-bold"
              style="
                letter-spacing: 0.08em;
                text-transform: uppercase;
                opacity: 0.8;
              "
            >
              Sign in to your account
            </p>
          </div>

          <!-- Form -->
          <!-- Login Role Selector -->
          <v-btn-toggle
            v-model="loginRole"
            color="accent"
            mandatory
            class="d-flex w-100 mb-6 custom-toggle-group"
          >
            <v-btn
              value="User"
              class="flex-grow-1 custom-toggle-btn"
              height="42"
            >
              Customer
            </v-btn>
            <v-btn
              value="Distributor"
              class="flex-grow-1 custom-toggle-btn"
              height="42"
            >
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
                class="text-primary text-decoration-none font-weight-bold text-caption"
                style="letter-spacing: 0.02em"
              >
                Forgot Password?
              </NuxtLink>
            </div>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="secondary"
              size="large"
              block
              class="luxury-action-btn font-weight-bold"
              :loading="loading"
              :disabled="!formValid"
            >
              Sign In
            </v-btn>
          </v-form>

          <!-- Divider -->
          <div class="d-flex align-center my-6">
            <v-divider />
            <span
              class="mx-4 text-grey text-caption"
              style="text-transform: uppercase; letter-spacing: 0.05em"
              >or</span
            >
            <v-divider />
          </div>

          <!-- Social Login -->
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              color="secondary"
              class="flex-grow-1"
              style="
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

          <!-- Register Link -->
          <p
            v-if="!authStore.isLoggedIn"
            class="text-center mt-6 text-grey text-body-2"
          >
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

    <!-- Success Modal -->
    <ClientOnly>
      <RegistrationSuccessModal
        v-model="showSuccessModal"
        :userName="registeredUserName"
        :isWholesaler="loginRole === 'Distributor'"
        :bonusPoints="100"
        @closed="router.push('/')"
      />
    </ClientOnly>
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

const showSuccessModal = ref(false);
const registeredUserName = ref("");

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
        try {
          // Fetch user info from Google
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }).then(res => res.json());
          
          if (userInfo.email) {
            const loginResult = await authStore.login(
              userInfo.email, 
              undefined, 
              loginRole.value, 
              true, 
              "GOOGLE"
            );
            
            if (loginResult.success) {
              if (loginResult.is_new_user) {
                registeredUserName.value = userInfo.name || userInfo.email;
                showSuccessModal.value = true;
              } else {
                showSnackbar("Logged in successfully with Google!", "success");
                const route = useRoute();
                const redirectPath = (route.query.redirect as string) || "/";
                router.push(redirectPath);
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

// Redirect if already logged in
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push("/");
  }
});
</script>

<style scoped>
.custom-toggle-group {
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: #fcfcf9;
  overflow: hidden;
}

.custom-toggle-btn {
  border-radius: 0 !important;
  font-family: "Urbanist", sans-serif;
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.v-btn--selected {
  background-color: var(--accent) !important;
  color: #ffffff !important;
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
