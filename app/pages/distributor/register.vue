<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" rounded="xl" elevation="3">
          <div class="text-center mb-6">
            <v-icon size="64" color="primary" class="mb-4"
              >mdi-store-plus</v-icon
            >
            <h2 class="text-h4 font-weight-bold">Become a Distributor</h2>
            <p class="text-subtitle-1 text-medium-emphasis mt-2">
              Expand your business with Aadab
            </p>
          </div>

          <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.business_name"
              label="Business Name"
              variant="outlined"
              :rules="[(v) => !!v || 'Business Name is required']"
              class="mb-2"
            />

            <v-text-field
              v-model="formData.gst_number"
              label="GST Number"
              variant="outlined"
              :rules="[(v) => !!v || 'GST Number is required']"
              class="mb-4"
            />

            <p class="text-subtitle-2 mb-2">Documents</p>

            <v-file-input
              v-model="formData.visiting_card"
              label="Visiting Card"
              variant="outlined"
              prepend-icon="mdi-card-account-details"
              accept="image/*"
              :rules="[(v) => !!v || 'Visiting Card is required']"
              class="mb-2"
            />

            <v-file-input
              v-model="formData.shop_image"
              label="Shop Image"
              variant="outlined"
              prepend-icon="mdi-store"
              accept="image/*"
              :rules="[(v) => !!v || 'Shop Image is required']"
              class="mb-6"
            />

            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
              :disabled="!valid"
            >
              Submit Application
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const api = useApi();
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

const valid = ref(false);
const loading = ref(false);
const formData = reactive({
  business_name: "",
  gst_number: "",
  visiting_card: null as File | null,
  shop_image: null as File | null,
});

const submitForm = async () => {
  if (!valid.value) return;
  if (!authStore.user) {
    showSnackbar("Please login first", "error");
    return;
  }

  loading.value = true;

  try {
    // 1. Upload Documents
    const formDataUpload = new FormData();
    formDataUpload.append("user_id", authStore.user.id.toString());
    if (formData.visiting_card) {
      // Handle Vuetify file input (returns array or single)
      const file = Array.isArray(formData.visiting_card)
        ? formData.visiting_card[0]
        : formData.visiting_card;
      formDataUpload.append("visiting_card", file);
    }
    if (formData.shop_image) {
      const file = Array.isArray(formData.shop_image)
        ? formData.shop_image[0]
        : formData.shop_image;
      formDataUpload.append("shop_image", file);
    }

    // Upload call using useApi which supports FormData natively
    const uploadRes = await api.post<any>('/upload_wholesaler_documents', formDataUpload);
    if (!uploadRes.success) {
      throw new Error(uploadRes.message || "Failed to upload wholesaler documents");
    }

    // 2. Update Profile (Business Name & GST)
    const updateRes = await authStore.updateProfile({
      business_name: formData.business_name,
      gst_number: formData.gst_number,
    });

    if (!updateRes.success) throw new Error(updateRes.message);

    // 3. Add Role
    const roleRes = await authStore.addRole("Distributor");
    if (!roleRes.success) throw new Error(roleRes.message);

    // 4. Switch Role
    await authStore.switchRole("Distributor");

    showSnackbar("Congratulations! You are now a Distributor.", "success");
    router.push("/");
  } catch (error: any) {
    console.error(error);
    showSnackbar(error.message || "Failed to upgrade account", "error");
  } finally {
    loading.value = false;
  }
};
</script>
