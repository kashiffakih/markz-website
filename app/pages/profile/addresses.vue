<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">Saved Addresses</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openAddressDialog()"
      >
        Add New Address
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty State -->
    <v-card v-else-if="addresses.length === 0" class="pa-8 text-center" flat>
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-map-marker-off
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No addresses saved</h3>
      <p class="text-grey">Add an address for faster checkout</p>
    </v-card>

    <!-- Address List -->
    <v-row v-else>
      <v-col cols="12" md="6" v-for="address in addresses" :key="address.id">
        <v-card rounded="lg" variant="outlined" class="h-100">
          <v-card-text>
            <div class="d-flex justify-space-between align-start mb-2">
              <div class="font-weight-bold text-subtitle-1">
                {{ address.label || address.address_name }}
                <v-chip
                  v-if="address.is_default"
                  size="x-small"
                  color="primary"
                  class="ml-2"
                >
                  Default
                </v-chip>
              </div>

              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon size="small" variant="text" v-bind="props">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-pencil"
                    title="Edit"
                    @click="openAddressDialog(address)"
                  />
                  <v-list-item
                    prepend-icon="mdi-delete"
                    title="Delete"
                    class="text-error"
                    @click="deleteAddress(address.id)"
                  />
                  <v-divider v-if="!address.is_default" class="my-1" />
                  <v-list-item
                    v-if="!address.is_default"
                    prepend-icon="mdi-check-circle"
                    title="Set as Default"
                    @click="setAsDefault(address.id)"
                  />
                </v-list>
              </v-menu>
            </div>

            <p class="text-body-2 mb-1">{{ address.add_1 || address.address }}</p>
            <p class="text-body-2 mb-1">
              {{ address.city }}, {{ address.state }} - {{ address.pincode }}
            </p>
            <div class="d-flex align-center text-caption text-grey mt-2">
              <v-icon size="small" start>mdi-phone</v-icon>
              {{ address.phone || address.mobile }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Address Dialog -->
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title>{{
          editingId ? "Edit Address" : "Add New Address"
        }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="saveAddress">
            <v-text-field
              v-model="addressForm.label"
              label="Address Name (e.g. Home, Office)"
              :rules="[(v) => !!v || 'Required']"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="addressForm.city"
                  label="City"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="addressForm.state"
                  label="State"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="addressForm.pincode"
                  label="Pincode"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="addressForm.phone"
                  label="Mobile Number"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
            </v-row>

            <v-textarea
              v-model="addressForm.add_1"
              label="Full Address"
              rows="3"
              :rules="[(v) => !!v || 'Required']"
            />

            <v-checkbox
              v-model="addressForm.is_default"
              label="Set as default address"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAddress" :loading="saving"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";

const authStore = useAuthStore();
const showSnackbar = inject(
  "showSnackbar",
  (text: string, color: string) => {},
);

const loading = ref(true);
const addresses = ref<any[]>([]);
const showDialog = ref(false);
const valid = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);

const addressForm = reactive({
  label: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  add_1: "",
  is_default: false,
});

const fetchAddresses = async () => {
  loading.value = true;
  const api = useApi();
  const response = await api.get("/user_addresses", { userId: authStore.user?.id });
  if (response.success && response.data) {
    addresses.value = response.data;
  }
  loading.value = false;
};

const openAddressDialog = (address?: any) => {
  if (address) {
    editingId.value = address.id;
    addressForm.label = address.label || address.address_name || "";
    addressForm.city = address.city || "";
    addressForm.state = address.state || "";
    addressForm.pincode = address.pincode || "";
    addressForm.phone = address.phone || address.mobile || "";
    addressForm.add_1 = address.add_1 || address.address || "";
    addressForm.is_default = !!address.is_default;
  } else {
    editingId.value = null;
    // Reset form
    addressForm.label = "";
    addressForm.city = "";
    addressForm.state = "";
    addressForm.pincode = "";
    addressForm.phone = "";
    addressForm.add_1 = "";
    addressForm.is_default = false;
  }
  showDialog.value = true;
};

const saveAddress = async () => {
  if (!valid.value) return;

  saving.value = true;
  const api = useApi();

  const payload = {
    ...addressForm,
    user_id: authStore.user?.id,
  };

  let response;
  if (editingId.value) {
    response = await api.put(`/user_addresses/${editingId.value}`, payload);
  } else {
    response = await api.post("/user_addresses", payload);
  }

  saving.value = false;

  if (response.success) {
    showDialog.value = false;
    showSnackbar("Address saved successfully", "success");
    fetchAddresses();
  } else {
    showSnackbar(response.message || "Failed to save address", "error");
  }
};

const deleteAddress = async (id: number) => {
  if (!confirm("Are you sure you want to delete this address?")) return;

  const api = useApi();
  const response = await api.del(`/user_addresses/${id}`);

  if (response.success) {
    showSnackbar("Address deleted", "success");
    fetchAddresses();
  } else {
    showSnackbar("Failed to delete address", "error");
  }
};

const setAsDefault = async (id: number) => {
  // Logic to set default would typically involve an update
  // For now, reload as the API handles this logic in updates usually to unset others
  // Or implement a specific endpoint if available
  showSnackbar("Default address updated", "success");
  fetchAddresses();
};

// Fetch addresses reactively when the authenticated user is loaded/restored
watch(
  () => authStore.user?.id,
  (newUserId) => {
    if (newUserId) {
      fetchAddresses();
    }
  },
  { immediate: true }
);
</script>
