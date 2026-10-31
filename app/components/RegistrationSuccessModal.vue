<template>
  <v-dialog v-model="internalValue" max-width="400" persistent>
    <v-card class="pa-6 rounded-xl text-center shadow-lg" elevation="10">
      <!-- Wholesaler view -->
      <template v-if="isWholesaler">
        <div class="icon-container mx-auto mb-4" style="background-color: #F9A825;">
          <v-icon icon="mdi-hourglass-empty" size="40" color="white" />
        </div>
        <h2 class="text-h5 font-weight-black text-grey-darken-4 mb-2" style="font-family: 'Urbanist', sans-serif !important;">
          Registration Submitted!
        </h2>
        <p class="text-body-1 text-grey-darken-1 mb-6" style="font-family: 'Urbanist', sans-serif; line-height: 1.4;">
          Your registration has been submitted successfully. Please wait for admin approval. You will be notified once your account is approved and ready to use.
        </p>
        <v-btn 
          color="#c9b758" 
          block 
          size="large" 
          class="text-none font-weight-bold rounded-lg" 
          elevation="0"
          @click="close"
        >
          <span class="text-white" style="font-family: 'Urbanist', sans-serif; font-size: 16px;">
            Back to Login
          </span>
        </v-btn>
      </template>

      <!-- Customer view -->
      <template v-else>
        <v-btn icon="mdi-close" variant="text" size="small" class="position-absolute right-2 top-2 text-grey-darken-1" @click="close" />
        
        <div class="icon-container mx-auto mb-4" style="background: linear-gradient(135deg, #EED056, #FFC107);">
          <v-icon icon="mdi-party-popper" size="35" color="white" />
        </div>

        <h2 class="text-h5 font-weight-black text-grey-darken-4 mb-2" style="font-family: 'Urbanist', sans-serif !important;">
          Hurray! Congratulations!
        </h2>

        <p class="text-body-1 text-grey-darken-1 mb-6 font-weight-medium" style="font-family: 'Urbanist', sans-serif;">
          Welcome to Markz{{ userName ? ', ' + userName : '' }}! Your account has been created.
        </p>

        <div class="bonus-container d-flex align-center justify-center pa-4 mb-6 rounded-lg">
          <v-icon icon="mdi-gift" size="32" color="#EED056" class="mr-4" />
          <div class="text-left">
            <div class="text-caption text-grey-darken-1 font-weight-bold" style="font-family: 'Urbanist', sans-serif;">
              Welcome Bonus
            </div>
            <div class="d-flex align-center">
              <v-icon icon="mdi-star" color="#EED056" size="20" class="mr-1" />
              <span class="text-h6 font-weight-black text-grey-darken-4" style="font-family: 'Urbanist', sans-serif;">
                {{ bonusPoints }} Points
              </span>
            </div>
          </div>
        </div>

        <p class="text-caption text-grey-darken-1 mb-6" style="font-family: 'Urbanist', sans-serif; line-height: 1.4;">
          Use your bonus points to get discounts on your next purchase!
        </p>

        <v-btn 
          color="#c9b758" 
          block 
          size="large" 
          class="text-none font-weight-bold rounded-lg" 
          elevation="0"
          @click="close"
        >
          <span class="text-white" style="font-family: 'Urbanist', sans-serif; font-size: 16px;">
            Continue to Login
          </span>
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  userName: {
    type: String,
    default: ''
  },
  bonusPoints: {
    type: Number,
    default: 100
  },
  isWholesaler: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'closed']);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
  }
});

const close = () => {
  internalValue.value = false;
  emit('closed');
};
</script>

<style scoped>
.icon-container {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.bonus-container {
  background: linear-gradient(135deg, rgba(238, 208, 86, 0.15), rgba(255, 193, 7, 0.15));
  border: 1.5px solid rgba(238, 208, 86, 0.3);
}
</style>
