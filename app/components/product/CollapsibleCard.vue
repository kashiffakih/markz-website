<template>
  <div class="collapsible-card mb-3">
    <div
      class="card-header d-flex align-center justify-space-between pa-4 cursor-pointer"
      @click="toggle"
      :class="{ expanded: isOpen }"
    >
      <div class="d-flex align-center">
        <div
          class="icon-box d-flex align-center justify-center rounded pa-2 mr-3"
          :class="{ 'icon-box-expanded': isOpen }"
        >
          <v-icon
            :icon="icon"
            :color="isOpen ? '#D4A840' : '#D4A840'"
            size="small"
          />
        </div>
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      </div>
      <v-icon
        :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        color="#D4A840"
        class="transition-transform"
      />
    </div>

    <v-expand-transition>
      <div v-show="isOpen" class="card-content pa-4 pt-0">
        <div v-html="content" class="text-body-2 text-grey-darken-2"></div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  title: string;
  icon: string;
  content: string;
  expanded?: boolean;
}>();

const isOpen = ref(props.expanded || false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.collapsible-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(238, 208, 86, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-header {
  transition: background-color 0.2s;
}

.card-header:hover {
  background-color: rgba(238, 208, 86, 0.05);
}

.icon-box {
  background: rgba(238, 208, 86, 0.12);
  transition: all 0.3s ease;
}

.icon-box-expanded {
  background: rgba(238, 208, 86, 0.25);
}
</style>
