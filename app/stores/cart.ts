// Cart Store - Manages shopping cart
import { defineStore } from 'pinia'

interface CartItem {
  id: number
  productId: number
  productName: string
  productImage?: string
  pack: string
  packId?: string
  price: number
  quantity: number
  originalItem?: any
}

interface CartState {
  items: CartItem[]
  loading: boolean
  selectedIds: number[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false,
    selectedIds: [],
  }),
  
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    
    totalAmount: (state) => state.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    ),
    
    isEmpty: (state) => state.items.length === 0,

    selectedItems: (state) => state.items.filter(item => state.selectedIds.includes(item.id)),
    
    selectedItemCount: (state) => state.items
      .filter(item => state.selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.quantity, 0),
      
    selectedTotalAmount: (state) => state.items
      .filter(item => state.selectedIds.includes(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0),
  },
  
  actions: {
    // Fetch cart items from API
    async fetchCart() {
      const api = useApi()
      const authStore = useAuthStore()
      const productStore = useProductStore()
      
      if (!authStore.isLoggedIn || !authStore.user) return
      
      this.loading = true
      try {
        // Fetch from the working /add_to_cart endpoint
        const response: any = await api.get<any>(`/add_to_cart`, {
           userId: authStore.user.id,
           role: authStore.activeRole,
           productId: '',
           type: '',
           is_add_to_cart: 'false'
        })
        
        const payload = response.data || response
        const cartItems = Array.isArray(payload) ? payload : (payload.data || [])

        // Fetch all product details in parallel to resolve pack names and fallback prices
        const uniqueProductIds = [...new Set(cartItems.map((item: any) => item.product_id))] as number[]
        const productsMap: Record<number, any> = {}
        
        await Promise.all(
          uniqueProductIds.map(async (id) => {
            const product = await productStore.fetchProduct(id)
            if (product) {
              productsMap[id] = product
            }
          })
        )

        this.items = cartItems.map((item: any) => {
          const product = productsMap[item.product_id] || item.product
          const packs = product?.product_packs || []
          const prices = product?.product_prices || []
          
          // 1. Pack Name Display Resolution
          // Find matching pack in product_packs using pack ID from cart item
          const matchingPack = packs.find(
            (p: any) => p.id?.toString() === item.pack?.toString()
          )
          const packName = matchingPack ? matchingPack.value : item.pack

          // 2. Dynamic Fallback Price Resolution (Retail vs Distributor)
          let resolvedPrice = parseFloat(item.product_price || '0')
          if (resolvedPrice <= 0 && product) {
            // Find price object matching this pack
            let priceObj = prices.find(
              (p: any) => p.product_pack_id?.toString() === item.pack?.toString()
            )
            if (!priceObj && prices.length > 0) {
              priceObj = prices[0]
            }
            if (priceObj) {
              const isDistributor = authStore.activeRole === 'Distributor'
              let priceVal = parseFloat(priceObj.price || '0')
              let offerVal = parseFloat(priceObj.offer_price || '0')
              
              if (isDistributor) {
                const dPrice = parseFloat(priceObj.distributor_price || '0')
                const dOffer = parseFloat(priceObj.distributor_offer_price || '0')
                if (dPrice > 0) priceVal = dPrice
                if (dOffer > 0) offerVal = dOffer
              }
              
              resolvedPrice = offerVal > 0 && offerVal < priceVal ? offerVal : priceVal
            }
          }

          return {
            id: item.id,
            productId: item.product_id,
            productName: item.product?.name || product?.name || 'Unknown',
            productImage: item.product?.imagepath1 || product?.imagepath1,
            pack: packName,
            packId: item.pack, // Retain original pack ID for operations
            price: resolvedPrice,
            quantity: item.qty || 1,
            // Store original object if needed
            originalItem: {
              ...item,
              product: {
                ...(item.product || {}),
                ...product
              }
            }
          }
        })

        // Sync selected IDs
        this.selectedIds = this.selectedIds.filter(id => this.items.some(i => i.id === id))
        if (this.selectedIds.length === 0 && this.items.length > 0) {
          this.selectedIds = this.items.map(item => item.id)
        }
      } catch (e) {
        console.error('Fetch cart failed:', e)
      } finally {
        this.loading = false
      }
    },
    
    // Add item (Increment)
    async addToCart(productId: number, pack: string, quantity: number = 1, price?: number) {
      // Mobile app logic: type=true adds item/increments
      return this.modifyCart(productId, pack, true, price)
    },

    // Completely remove/delete item from cart using DELETE endpoint via Method Spoofing
    async removeItem(itemId: number) {
      const api = useApi()
      this.loading = true
      
      // Optimistic update: backup original items for instant removal visual
      const originalItems = [...this.items]
      this.items = this.items.filter(i => i.id !== itemId)
      
      try {
        // Spoof standard HTTP DELETE with POST body containing _method: DELETE
        const response: any = await api.post(`/carts/${itemId}`, { _method: 'DELETE' })
        if (response.success) {
          return { success: true }
        }
        // Rollback on failure
        this.items = originalItems
        return { success: false, message: response.message || 'Failed to remove item' }
      } catch (e) {
        console.error('Delete cart item failed:', e)
        // Rollback on error
        this.items = originalItems
        return { success: false, message: 'Network error' }
      } finally {
        this.loading = false
      }
    },

    // Action to increment/decrement quantity sequentially (optimistic)
    async updateQuantity(itemId: number, newQty: number) {
      const item = this.items.find(i => i.id === itemId)
      if (!item || newQty < 1) return { success: false }

      const oldQty = item.quantity
      const diff = newQty - oldQty
      if (diff === 0) return { success: true }

      // Optimistic update
      item.quantity = newQty

      const isAdd = diff > 0
      const steps = Math.abs(diff)

      try {
        let lastResult = { success: true }
        for (let i = 0; i < steps; i++) {
          lastResult = await this.modifyCart(item.productId, item.packId || item.pack, isAdd, item.price)
          if (!lastResult.success) {
            // Rollback on failure
            item.quantity = oldQty
            break
          }
        }
        return lastResult
      } catch (error) {
        // Rollback on error
        item.quantity = oldQty
        console.error('Update quantity failed:', error)
        return { success: false, message: 'Failed to update quantity' }
      }
    },

    // General method to modify cart
    async modifyCart(productId: number, pack: string, isAdd: boolean, price?: number) {
      const api = useApi()
      const authStore = useAuthStore()
      if (!authStore.user) return { success: false, message: 'Login required' }

      this.loading = true
      try {
        const response: any = await api.get<any>('/add_to_cart', {
          userId: authStore.user.id,
          productId: productId,
          type: isAdd ? 'true' : 'false',
          pack: pack,
          role: authStore.activeRole,
          is_add_to_cart: 'true',
          // Additional params matching mobile
          kind_of_flower: '',
          flavour: '',
          write_on_cake: '',
          points: 0,
          product_price: price !== undefined ? price.toString() : '',
        })

        // Fetch fully populated cart items with product_packs and product_prices
        await this.fetchCart()

        return { success: true }
      } catch (e) {
         console.error('Modify cart failed:', e)
         return { success: false, message: 'Network error' }
      } finally {
        this.loading = false
      }
    },
    
    // Clear cart (Not explicitly supported by endpoint? Maybe loop remove?)
    clearCart() {
       this.items = []
       this.selectedIds = []
    },

    toggleSelection(itemId: number) {
      const index = this.selectedIds.indexOf(itemId)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(itemId)
      }
    },

    toggleSelectAll(checked: boolean) {
      if (checked) {
        this.selectedIds = this.items.map(item => item.id)
      } else {
        this.selectedIds = []
      }
    },
  },
})
