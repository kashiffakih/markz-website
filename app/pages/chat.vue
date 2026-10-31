<template>
  <v-container class="py-6">
    <h1 class="text-h5 font-weight-medium mb-4">My Chats</h1>

    <v-alert v-if="needLogin" type="info" variant="tonal">
      Chat ke liye pehle <NuxtLink to="/login">login</NuxtLink> karo.
    </v-alert>

    <v-card v-else flat style="border: 1px solid var(--border-color) !important;">
      <v-row no-gutters style="height: 70vh;">
        <!-- list -->
        <v-col cols="12" md="4" class="d-flex flex-column" :class="{ 'd-none d-md-flex': activeId }" style="border-right:1px solid #eee; height:100%;">
          <div style="overflow-y:auto; flex:1;">
            <div v-if="loadingList" class="text-center pa-4"><v-progress-circular indeterminate size="24" /></div>
            <div v-else-if="!conversations.length" class="text-center text-grey pa-6">
              Abhi koi chat nahi. Product page par "Chat with seller" dabao.
            </div>
            <div v-for="c in conversations" :key="c.id" class="conv pa-3" :class="{ active: c.id === activeId }" @click="open(c)">
              <div class="d-flex justify-space-between">
                <strong class="text-truncate">{{ c.company?.name || 'Seller' }}</strong>
                <v-chip v-if="c.customer_unread > 0" size="x-small" color="error">{{ c.customer_unread }}</v-chip>
              </div>
              <div class="text-caption text-grey text-truncate">{{ c.product?.name ? c.product.name + ' · ' : '' }}{{ c.last_message_preview || 'Start the conversation' }}</div>
            </div>
          </div>
        </v-col>

        <!-- thread -->
        <v-col cols="12" md="8" class="d-flex flex-column" :class="{ 'd-none d-md-flex': !activeId }" style="height:100%;">
          <div v-if="!active" class="ma-auto text-grey">Chat select karo</div>
          <template v-else>
            <div class="pa-3 d-flex align-center" style="border-bottom:1px solid #eee;">
              <v-btn icon="mdi-arrow-left" variant="text" class="d-md-none mr-2" @click="activeId = null; active = null" />
              <div>
                <strong>{{ active.company?.name || 'Seller' }}</strong>
                <div v-if="active.product" class="text-caption text-grey">{{ active.product.name }}</div>
              </div>
            </div>
            <div ref="thread" class="pa-3" style="overflow-y:auto; flex:1; background:#f7f7f8;">
              <div v-for="m in messages" :key="m.id" class="d-flex mb-2" :class="m.sender_type === 'customer' ? 'justify-end' : 'justify-start'">
                <div class="bubble" :class="m.sender_type === 'customer' ? 'mine' : 'theirs'">
                  <div style="white-space:pre-wrap;">{{ m.body }}</div>
                  <div class="text-caption text-right" style="opacity:.7">{{ fmt(m.created_at) }}</div>
                </div>
              </div>
            </div>
            <form class="d-flex pa-2" style="border-top:1px solid #eee;" @submit.prevent="send">
              <v-text-field v-model="draft" density="compact" hide-details variant="outlined" maxlength="2000"
                :disabled="active.status === 'closed'"
                :placeholder="active.status === 'closed' ? 'Chat closed' : 'Message likho...'" />
              <v-btn type="submit" color="accent" class="ml-2" height="40" icon="mdi-send" :disabled="!draft.trim() || sending || active.status === 'closed'" />
            </form>
          </template>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi();
const route = useRoute();

const needLogin = ref(false);
const conversations = ref<any[]>([]);
const loadingList = ref(true);
const active = ref<any>(null);
const activeId = ref<number | null>(null);
const messages = ref<any[]>([]);
const lastId = ref(0);
const draft = ref("");
const sending = ref(false);
const thread = ref<HTMLElement | null>(null);
let poll: any = null;

const fmt = (d: string) => (d ? new Date(d.replace(" ", "T")).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const scrollDown = () => nextTick(() => { if (thread.value) thread.value.scrollTop = thread.value.scrollHeight; });

const loadList = async () => {
  const res: any = await api.get("/chat/conversations", { as: "customer" });
  if (res?.message === "Unauthenticated." ) { needLogin.value = true; return; }
  conversations.value = res?.data || [];
};

const fetchMessages = async (initial: boolean) => {
  if (!activeId.value) return;
  const params: any = { };
  if (!initial && lastId.value) params.after_id = lastId.value;
  const res: any = await api.get(`/chat/conversations/${activeId.value}/messages`, params);
  if (!res?.messages) return;
  if (res.conversation) active.value = res.conversation;
  if (initial) messages.value = res.messages;
  else if (res.messages.length) messages.value = messages.value.concat(res.messages);
  if (messages.value.length) lastId.value = messages.value[messages.value.length - 1].id;
  if (initial || res.messages.length) scrollDown();
};

const open = async (c: any) => {
  active.value = c; activeId.value = c.id; messages.value = []; lastId.value = 0;
  await fetchMessages(true);
  loadList();
};

const send = async () => {
  const body = draft.value.trim();
  if (!body) return;
  sending.value = true;
  const res: any = await api.post(`/chat/conversations/${activeId.value}/messages`, { body });
  sending.value = false;
  if (res?.data) { draft.value = ""; await fetchMessages(false); loadList(); }
};

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { needLogin.value = true; loadingList.value = false; return; }

  // coming from a product page: start (or reuse) the conversation first
  if (route.query.company) {
    const res: any = await api.post("/chat/conversations", {
      company_id: Number(route.query.company),
      product_id: route.query.product ? Number(route.query.product) : null,
    });
    await loadList();
    if (res?.data?.id) {
      const found = conversations.value.find((c) => c.id === res.data.id) || res.data;
      await open(found);
    }
  } else {
    await loadList();
  }
  loadingList.value = false;
  poll = setInterval(() => { fetchMessages(false); loadList(); }, 6000);
});

onBeforeUnmount(() => clearInterval(poll));
</script>

<style scoped>
.conv { cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.conv:hover { background: #fafafa; }
.conv.active { background: #f1f5ff; }
.bubble { max-width: 75%; padding: 6px 10px; border-radius: 10px; }
.bubble.mine { background: var(--accent, #c9a45c); color: #fff; }
.bubble.theirs { background: #fff; border: 1px solid #e5e5e5; }
</style>
