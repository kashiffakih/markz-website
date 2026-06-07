<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean; // v-model for visibility
  imageUrl: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const dialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    dialog.value = val;
  },
);

watch(dialog, (val) => {
  emit("update:modelValue", val);
});
</script>

<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card class="rounded-xl">
      <v-card-title
        class="d-flex justify-space-between align-center pl-4 pr-2 py-2"
      >
        <span class="text-h6 font-weight-bold">Size Guide</span>
        <v-btn icon variant="text" @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4 text-center">
        <v-img :src="imageUrl" contain max-height="70vh" class="mx-auto">
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </template>
          <template v-slot:error>
            <div
              class="d-flex align-center justify-center fill-height text-grey"
            >
              No size chart available.
            </div>
          </template>
        </v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
