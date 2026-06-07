export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Initialize auth store from localStorage on client-side
  await authStore.init()
  
  // Optional: Fetch fresh user data if token exists
  if (authStore.token) {
    authStore.fetchUser()
  }
})
