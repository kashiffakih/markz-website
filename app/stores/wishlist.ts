import { defineStore } from 'pinia';

interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    updated_at: string;
    product?: any;
}

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
}

export const useWishlistStore = defineStore('wishlist', {
    state: (): WishlistState => ({
        items: [],
        loading: false,
    }),

    getters: {
        wishlistIds: (state) => {
            const ids = new Set<number>();
            state.items.forEach(item => {
                if (item.product_id) ids.add(item.product_id);
            });
            return ids;
        },
        hasConfig: (state) => (productId: number) => { 
             // Helper if needed, but getters with arguments are not cached efficiently.
             // Better to use wishlistIds in component.
             return state.items.some(item => item.product_id === productId);
        }
    },

    actions: {
        async fetchWishlist() {
            const authStore = useAuthStore();
            if (!authStore.isLoggedIn) return;

            const api = useApi();
            this.loading = true;
            try {
                // Fetch all wishlist items
                const response: any = await api.get("/wishlists", {
                    userId: authStore.user?.id,
                    productId: '' 
                });
                
                const payload = response.data || response;
                if (Array.isArray(payload)) {
                    this.items = payload;
                } else if (response.success && response.data) {
                    this.items = response.data;
                }
            } catch (e) {
                console.error("Failed to fetch wishlist:", e);
            } finally {
                this.loading = false;
            }
        },

        async toggleWishlist(productId: number) {
            const authStore = useAuthStore();
            if (!authStore.isLoggedIn) return false;

            const api = useApi();
            // Optimistic update
            const existingIndex = this.items.findIndex(i => i.product_id === productId);
            const wasWishlisted = existingIndex !== -1;
            
            // Temporary object for optimistic add (will be replaced by fetch)
            if (wasWishlisted) {
                this.items.splice(existingIndex, 1);
            } else {
                this.items.push({
                    id: Date.now(), // Temp ID
                    user_id: authStore.user?.id!,
                    product_id: productId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            try {
               const response: any = await api.get("/wishlists", {
                    userId: authStore.user?.id,
                    productId: productId
               });
               
               // The API returns the updated list?
               const payload = response.data || response;
               if (Array.isArray(payload)) {
                   this.items = payload;
               } else {
                   // Fallback: re-fetch
                   await this.fetchWishlist();
               }
               return true;
            } catch (e) {
                console.error("Failed to toggle wishlist:", e);
                // Revert if needed (fetching usually fixes state)
                await this.fetchWishlist();
                return false;
            }
        }
    }
});
