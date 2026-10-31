<template>
  <div class="contact-page bg-surface min-vh-100 py-12">
    <v-container style="max-width: 600px;">
      <div class="text-center mb-10">
        <h1 class="text-h4 font-weight-bold text-secondary mb-2" style="font-family: 'Urbanist', sans-serif !important;">
          Contact Us
        </h1>
        <div style="width: 40px; height: 3px; background-color: var(--accent); margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div v-if="loading" class="d-flex justify-center my-12">
        <v-progress-circular indeterminate color="accent" size="48" width="4"></v-progress-circular>
      </div>

      <div v-else class="contact-items d-flex flex-column gap-4">
        <!-- Email -->
        <a :href="`mailto:${email}?subject=Hello Aadab`" class="contact-item text-decoration-none">
          <div class="d-flex align-center w-100">
            <div class="icon-wrapper mr-4">
              <v-icon icon="mdi-email" color="accent" size="24"></v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="text-h6 font-weight-bold text-secondary mb-1" style="font-family: 'Urbanist', sans-serif !important;">Email</h3>
              <p class="text-body-2 font-weight-medium text-grey-darken-1 mb-0" style="font-family: 'Urbanist', sans-serif;">{{ email }}</p>
            </div>
            <v-icon icon="mdi-chevron-right" color="accent" size="20"></v-icon>
          </div>
        </a>

        <!-- WhatsApp -->
        <a :href="`https://wa.me/${cleanPhone}`" target="_blank" class="contact-item text-decoration-none">
          <div class="d-flex align-center w-100">
            <div class="icon-wrapper mr-4">
              <v-icon icon="mdi-whatsapp" color="accent" size="24"></v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="text-h6 font-weight-bold text-secondary mb-1" style="font-family: 'Urbanist', sans-serif !important;">WhatsApp</h3>
              <p class="text-body-2 font-weight-medium text-grey-darken-1 mb-0" style="font-family: 'Urbanist', sans-serif;">{{ displayPhone }}</p>
            </div>
            <v-icon icon="mdi-chevron-right" color="accent" size="20"></v-icon>
          </div>
        </a>

        <!-- Call Us -->
        <a :href="`tel:${cleanPhone}`" class="contact-item text-decoration-none">
          <div class="d-flex align-center w-100">
            <div class="icon-wrapper mr-4">
              <v-icon icon="mdi-phone" color="accent" size="24"></v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="text-h6 font-weight-bold text-secondary mb-1" style="font-family: 'Urbanist', sans-serif !important;">Call Us</h3>
              <p class="text-body-2 font-weight-medium text-grey-darken-1 mb-0" style="font-family: 'Urbanist', sans-serif;">{{ displayPhone }}</p>
            </div>
            <v-icon icon="mdi-chevron-right" color="accent" size="20"></v-icon>
          </div>
        </a>

        <!-- Address Card -->
        <div v-if="address" class="contact-item">
          <div class="d-flex align-start w-100">
            <div class="icon-wrapper mr-4 mt-1">
              <v-icon icon="mdi-map-marker" color="accent" size="24"></v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="text-h6 font-weight-bold text-secondary mb-1" style="font-family: 'Urbanist', sans-serif !important;">Our Address</h3>
              <p class="text-body-2 font-weight-medium text-grey-darken-1 mb-0" style="font-family: 'Urbanist', sans-serif; line-height: 1.5;">{{ address }}</p>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '~/stores/product';

const productStore = useProductStore();
const loading = ref(true);

onMounted(async () => {
  if (Object.keys(productStore.banners).length === 0) {
    await productStore.fetchBanners();
  }
  loading.value = false;
});

const email = computed(() => productStore.banners?.email || 'adaab.treder@gmail.com');
const rawPhone = computed(() => productStore.banners?.phone || '8600175751');

const displayPhone = computed(() => {
  const p = rawPhone.value ? rawPhone.value.toString() : '';
  if (!p) return '+91 86001 75751';
  return p.startsWith('+') ? p : '+91 ' + p;
});

const cleanPhone = computed(() => {
  const p = rawPhone.value ? rawPhone.value.toString().replace(/[^0-9]/g, '') : '';
  if (!p) return '918600175751';
  return p.startsWith('91') ? p : '91' + p;
});

const address = computed(() => {
  return productStore.banners?.contact || 
         productStore.banners?.address || 
         'RAZA TRADING CO - H.No 607 Khadan Road, Laxmi Sizing, Near Prime Hospital, Kalyan Road, Bhiwandi, Dist Thane, MH - 421302';
});

useHead({
  title: 'Contact Us - Aadab',
});
</script>

<style scoped>
.contact-page {
  background: linear-gradient(to bottom, #FFFFFE, #FFFFFF);
}

.gap-4 {
  gap: 16px;
}

.contact-item {
  display: flex;
  padding: 16px;
  background-color: white;
  border-radius: 16px;
  border: 1.5px solid rgba(238, 208, 86, 0.3);
  box-shadow: 0 6px 20px rgba(238, 208, 86, 0.12), 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(238, 208, 86, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  background-color: rgba(238, 208, 86, 0.1);
  border: 1px solid rgba(238, 208, 86, 0.3);
}
</style>
