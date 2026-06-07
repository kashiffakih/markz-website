import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export interface UserWallet {
  id: number
  user_id: number
  source: string
  amount: string
  created_at: string
  updated_at: string
  no_of_days?: number
  order_id?: number
}

interface WalletState {
  wallets: UserWallet[]
  loading: boolean
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    wallets: [],
    loading: false,
  }),

  getters: {
    // Calculate total earned points (positive transactions)
    totalEarned: (state) => {
      return state.wallets
        .filter(w => !w.source.toLowerCase().includes('used') && !w.source.toLowerCase().includes('deducted'))
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)
    },
    
    // Calculate total used points (negative transactions)
    totalUsed: (state) => {
      return state.wallets
        .filter(w => w.source.toLowerCase().includes('used') || w.source.toLowerCase().includes('deducted'))
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)
    },
    
    // Calculate remaining balance
    balance: (state) => {
      // Logic based on app's calculation (Total Earned - Total Used)
      // Check if API returns amount relative to type or absolute
      // Based on app, it calculates Earned and Used separately.
      
      const earned = state.wallets
        .filter(w => !w.source.toLowerCase().includes('used') && !w.source.toLowerCase().includes('deducted'))
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)
        
      const used = state.wallets
        .filter(w => w.source.toLowerCase().includes('used') || w.source.toLowerCase().includes('deducted'))
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)
        
      return earned - used
    }
  },

  actions: {
    async fetchWallets() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.loading = true
      const api = useApi()

      try {
        // App logic: getMyUserWallets calls /user_wallets?userId=...
        const response = await api.get<{ data: UserWallet[] }>(`/user_wallets?userId=${authStore.user.id}`)

        if (response.success && response.data) {
          // Response data might be wrapped or list directly depending on API helper
          // user_wallet_s.dart: _responseData['data'] is list
          this.wallets = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
