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
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card color="black">
      <v-toolbar color="transparent" density="compact" theme="dark">
        <v-spacer></v-spacer>
        <v-btn icon dark @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="d-flex align-center justify-center fill-height pa-0">
        <v-img
          :src="imageUrl"
          contain
          max-height="90vh"
          max-width="100vw"
          class="zoom-image"
        ></v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.zoom-image {
  /* Ensure image fits within boundaries */
  object-fit: contain;
}
</style>
