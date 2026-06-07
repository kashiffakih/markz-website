<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-6">My Rewards</h2>

    <v-row>
      <!-- Points Summary Card -->
      <v-col cols="12" md="8">
        <v-card
          rounded="xl"
          class="pa-6 text-white position-relative overflow-hidden"
          style="background: linear-gradient(135deg, #EED056 0%, #C7B456 100%);"
          elevation="4"
        >
          <!-- Dynamic gold glow background micro-interactions -->
          <div class="position-absolute" style="top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.15); border-radius: 50%;"></div>
          <div class="position-absolute" style="bottom: -40px; left: -10px; width: 180px; height: 180px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>

          <div class="d-flex align-center mb-6">
            <v-avatar color="rgba(255, 255, 255, 0.2)" size="64" class="mr-4">
              <v-icon size="36" color="white">mdi-star-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-uppercase tracking-wider opacity-90">
                Total Earned Points
              </div>
              <h3 class="text-h3 font-weight-bold">
                {{ totalEarned.toLocaleString() }} <span class="text-subtitle-1">pts</span>
              </h3>
            </div>
          </div>

          <v-row class="mt-4">
            <!-- Used Sub-card -->
            <v-col cols="6">
              <v-card
                flat
                rounded="lg"
                color="rgba(255, 255, 255, 0.15)"
                class="pa-4 text-white"
              >
                <div class="text-caption opacity-80 font-weight-medium text-uppercase mb-1">
                  Used
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ totalUsed.toLocaleString() }} <span class="text-caption">pts</span>
                </div>
              </v-card>
            </v-col>

            <!-- Remaining Sub-card -->
            <v-col cols="6">
              <v-card
                flat
                rounded="lg"
                color="white"
                class="pa-4 text-grey-darken-4"
                elevation="1"
              >
                <div class="text-caption text-secondary font-weight-bold text-uppercase mb-1">
                  Remaining
                </div>
                <div class="text-h5 font-weight-bold text-secondary">
                  {{ remaining.toLocaleString() }} <span class="text-caption text-grey">pts</span>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <h3 class="text-h6 font-weight-bold mt-8 mb-4">History</h3>

    <!-- History List -->
    <v-card rounded="lg" variant="outlined" :loading="loading" class="border-thin">
      <div
        v-if="transactions.length === 0 && !loading"
        class="text-center pa-12 text-grey d-flex flex-column align-center"
      >
        <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-history-toggle-off</v-icon>
        <div class="text-subtitle-1 font-weight-medium">No rewards history yet</div>
      </div>
      <v-list v-else lines="two" class="pa-0">
        <template v-for="(txn, i) in transactions" :key="txn.id">
          <v-list-item class="py-3">
            <template v-slot:prepend>
              <v-avatar
                :color="isCredit(txn) ? 'success' : 'error'"
                variant="tonal"
                size="44"
              >
                <v-icon size="20">
                  {{
                    isCredit(txn) ? "mdi-plus-circle" : "mdi-minus-circle"
                  }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold text-body-1">
              {{ getTitle(txn) }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey mt-1">
              {{ formatDate(txn.created_at) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="text-right">
                <span
                  class="font-weight-bold text-subtitle-1"
                  :class="isCredit(txn) ? 'text-success' : 'text-error'"
                >
                  {{ isCredit(txn) ? "+ " : "- " }}{{ Math.abs(parseFloat(txn.amount)) }}
                </span>
                <div class="text-caption text-grey">Points</div>
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="i < transactions.length - 1" class="border-opacity-50" />
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import { useWalletStore } from "@stores/wallet";

const authStore = useAuthStore();
const walletStore = useWalletStore();
const router = useRouter();

// Computed properties from store
const balance = computed(() => walletStore.balance);
const transactions = computed(() => walletStore.wallets);
const loading = computed(() => walletStore.loading);

const totalEarned = computed(() => walletStore.totalEarned);
const totalUsed = computed(() => walletStore.totalUsed);
const remaining = computed(() => walletStore.balance);

// Redirect if distributor (User only feature)
onMounted(() => {
  if (authStore.isDistributor) {
    router.push("/profile");
    return;
  }

  // Fetch real data
  walletStore.fetchWallets();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isCredit = (txn: any) => {
  const source = txn.source?.toLowerCase() || "";
  return !source.includes("used") && !source.includes("deducted");
};

const getTitle = (txn: any) => {
  const source = txn.source?.toLowerCase() || "";
  if (source.includes("referral")) return "Referral Bonus";
  if (source.includes("register")) return "Registration Bonus";
  if (source === "points return") return "Points Returned";
  if (source === "points deducted") return "Points Deducted";
  return `Order Reward ${txn.source?.split(" ").pop() || ""}`;
};
</script>
