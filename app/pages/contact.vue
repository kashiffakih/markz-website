<template>
  <v-container class="py-12">
    <v-row>
      <!-- Contact Info -->
      <v-col cols="12" md="5">
        <h1 class="text-h4 font-weight-bold text-secondary mb-6">Contact Us</h1>
        <p class="text-body-1 text-grey mb-8">
          Have questions or feedback? We'd love to hear from you. Fill out the
          form or reach out to us using the contact details below.
        </p>

        <div class="d-flex ga-4 mb-6">
          <v-avatar color="primary" size="small">
            <v-icon color="white">mdi-email</v-icon>
          </v-avatar>
          <div>
            <h3 class="font-weight-bold">Email Us</h3>
            <p class="text-grey">support@aadab.com</p>
          </div>
        </div>

        <div class="d-flex ga-4 mb-6">
          <v-avatar color="primary" size="small">
            <v-icon color="white">mdi-phone</v-icon>
          </v-avatar>
          <div>
            <h3 class="font-weight-bold">Call Us</h3>
            <p class="text-grey">+91 1234567890</p>
          </div>
        </div>

        <div class="d-flex ga-4 mb-8">
          <v-avatar color="primary" size="small">
            <v-icon color="white">mdi-map-marker</v-icon>
          </v-avatar>
          <div>
            <h3 class="font-weight-bold">Visit Us</h3>
            <p class="text-grey">
              123 Business Street,<br />
              Tech Park, City - 123456
            </p>
          </div>
        </div>

        <!-- Social Media -->
        <div>
          <h3 class="font-weight-bold mb-4">Follow Us</h3>
          <div class="d-flex ga-2">
            <v-btn icon variant="tonal" color="primary">
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon variant="tonal" color="primary">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon variant="tonal" color="primary">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn icon variant="tonal" color="primary">
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>

      <!-- Contact Form -->
      <v-col cols="12" md="7">
        <v-card class="pa-8" rounded="xl" elevation="2">
          <h2 class="text-h5 font-weight-bold mb-6">Send us a Message</h2>
          <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="name"
                  label="Your Name"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  :rules="[(v) => !!v || 'Name is required']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="email"
                  label="Your Email"
                  type="email"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  :rules="emailRules"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="subject"
              label="Subject"
              variant="outlined"
              bg-color="grey-lighten-5"
              :rules="[(v) => !!v || 'Subject is required']"
            />

            <v-textarea
              v-model="message"
              label="Message"
              rows="5"
              variant="outlined"
              bg-color="grey-lighten-5"
              :rules="[(v) => !!v || 'Message is required']"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!valid"
            >
              Send Message
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
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
