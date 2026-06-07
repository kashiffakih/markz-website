<template>
  <v-card rounded="lg" class="pa-6">
    <!-- Role Switch Loading Overlay (Facebook-style) -->
    <v-dialog
      v-model="switchingRole"
      persistent
      fullscreen
      transition="fade-transition"
    >
      <v-card
        color="white"
        class="d-flex align-center justify-center flex-column"
      >
        <v-avatar size="80" color="primary" class="mb-6 elevation-4">
          <v-icon size="40" color="white">mdi-account-sync</v-icon>
        </v-avatar>
        <h3 class="text-h5 font-weight-bold mb-2">Switching Profile...</h3>
        <p class="text-grey mb-6">
          Please wait while we switch your experience
        </p>
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          width="4"
        />
      </v-card>
    </v-dialog>

    <!-- Role Switcher (Card) -->
    <v-card
      v-if="hasDistributorRole"
      class="mb-6 pa-4 border-thin"
      elevation="0"
      rounded="lg"
      :color="isDistributor ? 'blue-lighten-5' : 'grey-lighten-5'"
    >
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-avatar
            :color="isDistributor ? 'primary' : 'grey'"
            icon="mdi-account-switch"
            class="mr-4"
          />
          <div>
            <h3 class="text-subtitle-1 font-weight-bold">
              Active Profile: {{ isDistributor ? "Distributor" : "Personal" }}
            </h3>
            <p class="text-caption text-grey">
              {{
                isDistributor
                  ? "You are viewing as a Business/Distributor"
                  : "You are viewing as a Personal User"
              }}
            </p>
          </div>
        </div>
        <v-switch
          v-model="isDistributorModel"
          color="primary"
          hide-details
          inset
          :loading="switchingRole"
          @update:model-value="toggleRole"
        />
      </div>
    </v-card>

    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center">
        <div class="position-relative mr-4">
          <v-avatar size="80" color="grey-lighten-2" class="elevation-1">
            <v-img
              v-if="userAvatarUrl"
              :src="userAvatarUrl"
              cover
            />
            <span v-else class="text-h4 text-grey-darken-1 font-weight-bold">
              {{ profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U' }}
            </span>
          </v-avatar>
          <v-btn
            icon="mdi-camera"
            size="x-small"
            color="primary"
            class="position-absolute"
            style="bottom: -4px; right: -4px;"
            :loading="uploadingPhoto"
            @click="triggerPhotoUpload"
          />
          <input
            ref="photoInput"
            type="file"
            accept="image/*"
            class="d-none"
            @change="handlePhotoUpload"
          />
        </div>
        <div>
          <h2 class="text-h5 font-weight-bold">My Profile</h2>
          <p class="text-caption text-grey">
            Referral Code: <span class="font-weight-bold text-secondary">{{ myReferralCode }}</span>
          </p>
        </div>
      </div>
      <v-btn
        :variant="isEditing ? 'tonal' : 'text'"
        :color="isEditing ? 'error' : 'primary'"
        @click="isEditing = !isEditing"
      >
        {{ isEditing ? "Cancel" : "Edit Profile" }}
      </v-btn>
    </div>

    <v-form ref="form" v-model="valid" @submit.prevent="saveProfile">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="profile.first_name"
            label="First Name"
            :readonly="!isEditing"
            :variant="isEditing ? 'outlined' : 'plain'"
            :rules="[(v) => !!v || 'Required']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="profile.last_name"
            label="Last Name"
            :readonly="!isEditing"
            :variant="isEditing ? 'outlined' : 'plain'"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="profile.email"
            label="Email"
            readonly
            variant="plain"
            append-inner-icon="mdi-lock"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="profile.phone"
            label="Phone"
            :readonly="!isEditing"
            :variant="isEditing ? 'outlined' : 'plain'"
          />
        </v-col>

        <!-- Distributor Fields -->
        <template v-if="authStore.isDistributor">
          <v-col cols="12">
            <v-divider class="my-4" />
            <h3 class="text-h6 mb-4">Business Details</h3>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="profile.business_name"
              label="Business Name"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="profile.gst_number"
              label="GST Number"
              readonly
              variant="plain"
              append-inner-icon="mdi-lock"
            />
          </v-col>
        </template>
      </v-row>

      <div v-if="isEditing" class="d-flex justify-end mt-6">
        <v-btn
          type="submit"
          color="primary"
          :loading="saving"
          :disabled="!valid"
        >
          Save Changes
        </v-btn>
      </div>
    </v-form>

    <!-- Redeem Referral Card -->
    <v-card
      v-if="!hasReferral && !authStore.isDistributor"
      class="mt-6 pa-4 border-thin"
      elevation="0"
      rounded="lg"
      color="amber-lighten-5"
    >
      <div class="d-flex justify-space-between align-center flex-wrap ga-4">
        <div class="d-flex align-center">
          <v-avatar color="amber" icon="mdi-gift" class="mr-4 text-white" />
          <div>
            <h3 class="text-subtitle-1 font-weight-bold">
              Have a Referral Code?
            </h3>
            <p class="text-caption text-grey-darken-1">
              Redeem a friend's code to get instant reward points!
            </p>
          </div>
        </div>
        <v-btn
          color="amber-darken-2"
          @click="showReferralDialog = true"
        >
          Redeem Now
        </v-btn>
      </div>
    </v-card>

    <!-- Redeem Referral Dialog -->
    <v-dialog v-model="showReferralDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="px-4 py-3">Redeem Referral Code</v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-grey-darken-1 mb-4">
            Enter your friend's referral code below to receive rewards.
          </p>
          <v-text-field
            v-model="referralCodeInput"
            label="Referral Code"
            variant="outlined"
            density="compact"
            placeholder="e.g. AD12345"
            hide-details
            @keyup.enter="redeemReferralCode"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="showReferralDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="redeemingReferral"
            :disabled="!referralCodeInput.trim()"
            @click="redeemReferralCode"
          >
            Redeem
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { ref, reactive, computed, onMounted, inject } from "vue";

const authStore = useAuthStore();
const config = useRuntimeConfig();
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

const isEditing = ref(false);
const saving = ref(false);
const valid = ref(false);
const switchingRole = ref(false);

const uploadingPhoto = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);

const showReferralDialog = ref(false);
const referralCodeInput = ref("");
const redeemingReferral = ref(false);

const isDistributor = computed(() => authStore.isDistributor);
const hasDistributorRole = computed(
  () => authStore.user?.roles?.some((r) => r.name === "Distributor") ?? false,
);
const isDistributorModel = ref(authStore.isDistributor);

const userAvatarUrl = computed(() => {
  const path = authStore.user?.imagepath;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${config.public.mediaBase}${path}`;
});

const myReferralCode = computed(() => {
  const u = authStore.user as any;
  return u?.referral_code || u?.referralCode || "N/A";
});

const hasReferral = computed(() => {
  const u = authStore.user as any;
  return !!(u?.refered_by_id || u?.referedById || u?.referred_by_id);
});

const profile = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  business_name: "",
  gst_number: "",
});

// Initialize form
const initForm = () => {
  if (authStore.user) {
    profile.first_name = authStore.user.first_name || "";
    profile.last_name = authStore.user.last_name || "";
    profile.email = authStore.user.email || "";
    profile.phone = authStore.user.phone || "";
    profile.business_name = authStore.user.business_name || "";
    profile.gst_number = (authStore.user as any).gst_number || "";
  }
};

const toggleRole = async (val: boolean) => {
  switchingRole.value = true;

  // Artificial delay for better UX (Facebook style)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newRole = val ? "Distributor" : "User";
  const result = await authStore.switchRole(newRole);

  switchingRole.value = false;

  if (result.success) {
    showSnackbar(`Switched to ${newRole} mode`, "success");
    // Reload page to ensure all components refresh
    window.location.reload();
  } else {
    // Revert switch if failed
    isDistributorModel.value = !val;
    showSnackbar(result.message || "Failed to switch role", "error");
  }
};

const triggerPhotoUpload = () => {
  photoInput.value?.click();
};

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  uploadingPhoto.value = true;
  const api = useApi();

  const formData = new FormData();
  formData.append("userid", authStore.user?.id?.toString() || "");
  formData.append("imagepath", file);

  try {
    const response: any = await api.post("/upload_user_photo", formData);
    if (response.success) {
      showSnackbar("Profile picture updated successfully!", "success");
      await authStore.fetchUser();
    } else {
      showSnackbar(response.message || "Failed to upload profile picture.", "error");
    }
  } catch (e: any) {
    console.error("Photo upload error:", e);
    showSnackbar(e.message || "Failed to upload image", "error");
  } finally {
    uploadingPhoto.value = false;
  }
};

const saveProfile = async () => {
  if (!valid.value) return;

  saving.value = true;

  // Use store updateProfile action which calls PATCH /users/$userId
  const result = await authStore.updateProfile({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone,
    business_name: profile.business_name,
  });

  saving.value = false;

  if (result.success) {
    showSnackbar("Profile updated successfully", "success");
    isEditing.value = false;
  } else {
    showSnackbar(result.message || "Failed to update profile", "error");
  }
};

const redeemReferralCode = async () => {
  if (!referralCodeInput.value.trim() || !authStore.user) return;

  redeemingReferral.value = true;
  const api = useApi();

  try {
    const response: any = await api.get("/map_referrer", {
      referral_code: referralCodeInput.value.trim(),
      user_id: authStore.user.id,
    });

    if (response.success) {
      showSnackbar(response.message || "Referral code applied successfully!", "success");
      showReferralDialog.value = false;
      referralCodeInput.value = "";
      // Refresh user data to update referred state
      await authStore.fetchUser();
    } else {
      showSnackbar(response.message || "Failed to apply referral code.", "error");
    }
  } catch (e: any) {
    console.error("Referral error:", e);
    showSnackbar(e.message || "Failed to redeem code", "error");
  } finally {
    redeemingReferral.value = false;
  }
};

onMounted(() => {
  initForm();
});
</script>
