<template>
  <div class="contact-page bg-surface min-vh-100">
    <!-- Hero Section -->
    <div class="contact-hero py-16 position-relative text-center">
      <div class="hero-bg position-absolute top-0 left-0 w-100 h-100"></div>
      <v-container class="position-relative z-1 pt-8 pb-4">
        <h1 class="text-h2 font-weight-black text-secondary mb-4 editorial-title">Let's Talk</h1>
        <p class="text-h6 text-grey-darken-1 font-weight-regular mx-auto" style="max-width: 600px; letter-spacing: 0.02em;">
          Whether you have a question about our products, need assistance with an order, or just want to say hello — we're here for you.
        </p>
      </v-container>
    </div>

    <!-- Content Section -->
    <v-container class="py-12 pb-16">
      <v-row class="gx-md-12">
        <!-- Contact Information -->
        <v-col cols="12" md="5" class="pr-md-8">
          <div class="sticky-top" style="top: 100px;">
            <h2 class="text-h4 font-weight-bold text-secondary mb-8" style="font-family: 'Cormorant Garamond', serif !important;">Get in touch</h2>
            
            <div class="contact-card mb-4">
              <div class="d-flex align-center ga-5">
                <v-avatar color="primary" variant="tonal" size="56" class="rounded-xl">
                  <v-icon size="28" color="primary">mdi-email-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1 mb-1" style="letter-spacing: 0.1em;">Email Us</div>
                  <a href="mailto:support@aadab.com" class="text-h6 text-secondary text-decoration-none font-weight-bold hover-primary transition-swing">support@aadab.com</a>
                </div>
              </div>
            </div>

            <div class="contact-card mb-4">
              <div class="d-flex align-center ga-5">
                <v-avatar color="primary" variant="tonal" size="56" class="rounded-xl">
                  <v-icon size="28" color="primary">mdi-phone-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1 mb-1" style="letter-spacing: 0.1em;">Call Us</div>
                  <a href="tel:+911234567890" class="text-h6 text-secondary text-decoration-none font-weight-bold hover-primary transition-swing">+91 1234 567 890</a>
                </div>
              </div>
            </div>

            <div class="contact-card mb-10">
              <div class="d-flex align-center ga-5">
                <v-avatar color="primary" variant="tonal" size="56" class="rounded-xl">
                  <v-icon size="28" color="primary">mdi-map-marker-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1 mb-1" style="letter-spacing: 0.1em;">Visit Us</div>
                  <div class="text-h6 text-secondary font-weight-bold" style="line-height: 1.4;">
                    123 Business Street,<br/>Tech Park, City - 123456
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="mb-8"></v-divider>

            <div>
              <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1 mb-4" style="letter-spacing: 0.1em;">Follow Our Journey</div>
              <div class="d-flex ga-3">
                <v-btn icon variant="outlined" color="secondary" class="social-btn" width="48" height="48">
                  <v-icon size="24">mdi-instagram</v-icon>
                </v-btn>
                <v-btn icon variant="outlined" color="secondary" class="social-btn" width="48" height="48">
                  <v-icon size="24">mdi-facebook</v-icon>
                </v-btn>
                <v-btn icon variant="outlined" color="secondary" class="social-btn" width="48" height="48">
                  <v-icon size="24">mdi-twitter</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Form Section -->
        <v-col cols="12" md="7" class="mt-8 mt-md-0">
          <v-card class="contact-form-card pa-6 pa-md-10" rounded="xl" elevation="0" border>
            <h3 class="text-h5 font-weight-bold text-secondary mb-2">Send a Message</h3>
            <p class="text-body-1 text-grey-darken-1 mb-8">We usually respond within 24 hours.</p>
            
            <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="name"
                    label="Full Name"
                    variant="outlined"
                    bg-color="white"
                    :rules="[(v) => !!v || 'Name is required']"
                    hide-details="auto"
                    class="luxury-input"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    bg-color="white"
                    :rules="emailRules"
                    hide-details="auto"
                    class="luxury-input"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="subject"
                label="Subject"
                variant="outlined"
                bg-color="white"
                :rules="[(v) => !!v || 'Subject is required']"
                hide-details="auto"
                class="luxury-input mt-6"
              />

              <v-textarea
                v-model="message"
                label="Your Message"
                rows="6"
                variant="outlined"
                bg-color="white"
                :rules="[(v) => !!v || 'Message is required']"
                hide-details="auto"
                class="luxury-input mt-6"
              />

              <v-btn
                type="submit"
                color="secondary"
                size="x-large"
                block
                class="luxury-action-btn font-weight-bold mt-8"
                :loading="loading"
                height="56"
                elevation="0"
                :disabled="!valid"
              >
                Send Message
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';

const valid = ref(false);
const loading = ref(false);
const name = ref("");
const email = ref("");
const subject = ref("");
const message = ref("");

// Inject snackbar
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

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  loading.value = false;
  showSnackbar("Message sent successfully!", "success");

  // Reset form
  name.value = "";
  email.value = "";
  subject.value = "";
  message.value = "";
};
</script>

<style scoped>
.editorial-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-size: 4rem !important;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

@media (max-width: 600px) {
  .editorial-title {
    font-size: 3rem !important;
  }
}

.hero-bg {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-secondary), 0.02) 100%);
  pointer-events: none;
}

.contact-card {
  padding: 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  margin-left: -16px; /* Offset the padding for alignment */
}

.contact-card:hover {
  background: #ffffff;
  border-color: rgba(0,0,0,0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transform: translateY(-2px);
}

.hover-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.social-btn {
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
}

.social-btn:hover {
  background: rgb(var(--v-theme-secondary)) !important;
  color: #fff !important;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.contact-form-card {
  background: #ffffff;
  border-color: rgba(0,0,0,0.06) !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.02) !important;
}

/* Luxury Input Styling */
:deep(.luxury-input .v-field) {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

:deep(.luxury-input .v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.05);
}

.luxury-action-btn {
  background: #000000 !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.luxury-action-btn:hover {
  background: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(var(--v-theme-primary), 0.2) !important;
}
</style>
