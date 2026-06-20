// Auth Store - Handles user authentication and role management
import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  business_name?: string
  trade_name?: string
  active_role: string
  roles: { name: string }[]
  is_approved?: number
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  activeRole: 'User' | 'Distributor'
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoggedIn: false,
    activeRole: 'User',
  }),
  
  getters: {
    isDistributor: (state) => state.activeRole === 'Distributor',
    displayName: (state) => {
      if (!state.user) return 'Guest'
      
      const u = state.user as any
      
      // For distributors, show business name
      if (state.activeRole === 'Distributor') {
        const businessName = u.business_name || u.businessName || u.trade_name
        if (businessName) return businessName
      }
      
      // Try all name combinations
      const firstName = u.first_name || u.firstName
      const lastName = u.last_name || u.lastName || ''
      const fullName = u.name || u.username
      
      if (firstName) {
        return `${firstName} ${lastName}`.trim()
      }
      
      if (fullName) {
        return fullName
      }
      
      // Ultimate fallback: Email username
      if (u.email) {
        return u.email.split('@')[0]
      }
      
      return 'User'
    },
  },
  
  actions: {
    // Initialize auth from localStorage
    async init() {
      if (typeof window === 'undefined') return
      
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      const savedRole = localStorage.getItem('active_role')
      
      if (token && userData && userData !== 'null' && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && typeof parsedUser === 'object') {
            this.token = token
            this.user = parsedUser
            this.isLoggedIn = true
            this.activeRole = (savedRole as 'User' | 'Distributor') || 'User'
            
            // Refresh user data in background
            this.fetchUser()
          } else {
             // Invalid user data, clear it
             this.logout()
          }
        } catch (e) {
          console.error('Auth Init Error:', e)
          this.logout()
        }
      }
    },
    
    // Login
    async login(email: string, password?: string, targetRole: 'User' | 'Distributor' = 'User', isSocialLogin: boolean = false, socialLoginName?: string) {
      const api = useApi()
      
      const payload: any = {
        email,
        active_role: targetRole,
        role: targetRole, // Backend LoginController expects 'role' for social login registration
      }
      
      if (password) payload.password = password
      if (isSocialLogin) {
        payload.is_social_login = true
        payload.social_login_name = socialLoginName || 'GOOGLE'
      }

      // Send active_role in login payload as requested
      const response: any = await api.post<any>('/login', payload)
      
      console.log('Login Response:', response)
      
      // Handle API response format: { token: "...", data: { ...user... }, success: true }
      // Token is often at root in this API
      const token = response.token || (response.data && response.data.token)
      
      // User might be in response.user, response.data.user, or response.data IS the user
      let user = response.user || (response.data && response.data.user)
      if (!user && response.data && (response.data.id || response.data.email)) {
        user = response.data
      }

      if (token) {
        // If we have a token, it's a success
        this.setUser(user || { email, id: 0, active_role: 'User', roles: [] }, token)
        
        // Fetch full profile to be sure
        await this.fetchUser()
        
        // Enforce Target Role
        if (targetRole && this.activeRole !== targetRole) {
           console.log(`Login role mismatch. Switching to ${targetRole}...`)
           const switchResult = await this.switchRole(targetRole)
           if (!switchResult.success) {
             console.warn('Failed to auto-switch role after login')
           }
        }
        
        return { success: true, is_new_user: response.is_new_user }
      }
      
      return { success: false, message: response.message || 'Login failed' }
    },
    
    // Set user data after successful login
    setUser(user: User, token: string) {
      console.log('Setting User:', user)
      if (!user) {
        console.error('Attempted to set null user')
        return
      }
      
      this.user = user
      this.token = token
      this.isLoggedIn = true
      
      // Safe access to active_role
      const role = user.active_role || (user as any).activeRole
      this.activeRole = (role as 'User' | 'Distributor') || 'User'
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))
        localStorage.setItem('active_role', this.activeRole)
      }
    },
    
    // Switch role with API persistence
    async switchRole(role: 'User' | 'Distributor') {
      const api = useApi()
      
      try {
        const response = await api.post('/users/update_active_role', {
          role: role
        })

        if (response.success) {
          this.activeRole = role
          if (this.user) {
            this.user.active_role = role
          }
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('active_role', role)
            // Update user data in local storage as well to keep it in sync
            if (this.user) {
              localStorage.setItem('user_data', JSON.stringify(this.user))
            }
          }
          return { success: true }
        }
        return { success: false, message: response.message || 'Failed to update role' }
      } catch (error) {
        console.error('Role switch error:', error)
        return { success: false, message: 'An error occurred while switching role' }
      }
    },
    
    // Logout
    logout() {
      this.user = null
      this.token = null
      this.isLoggedIn = false
      this.activeRole = 'User'
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('active_role')
      }
    },

    // Add role to user
    async addRole(role: 'User' | 'Distributor') {
      const api = useApi()
      const response = await api.post('/users/add_role', { role })
      if (response.success && response.data) {
        // Refresh user data or update locally
        if (this.user) {
           // Should ideally fetch fresh user data
           // For now, simple push if structure matches
           // this.user.roles.push({ name: role }) 
           // But best to wait for next login or profile fetch
        }
        return { success: true }
      }
      return { success: false, message: response.message || 'Failed to add role' }
    },

    // Fetch latest user data
    async fetchUser() {
      const api = useApi()
      if (!this.token) return { success: false }
      
      try {
        // Correct endpoint from legacy config
        const response = await api.get<any>('/me')
        console.log('FetchUser (/me) Response:', response)

        if (response.success) {
          // Legacy config said propertyName: "data", so user is likely in response.data
          // useApi usually unwraps response, so it might be response.data or just response
          const userData = response.data || response
          
          if (userData && (userData.id || userData.email)) {
             this.setUser(userData, this.token)
             return { success: true }
          }
        }
        // If fetch fails but we have a token, logic implies token might be stale
        // But let's NOT logout immediately in case of network glitch unless 401
        return { success: false }
      } catch (e) {
        console.error('Fetch user failed', e)
        return { success: false }
      }
    },

    // Register User (Matches Mobile App Logic)
    async registerUser(data: any) {
      const api = useApi()
      
      try {
        // 1. Call /register-user
        const response: any = await api.post('/register-user', data)
        console.log('Register Response:', response)

        if (response.success && response.data && response.data.id) {
          const userId = response.data.id
          const roleId = data.role === 'Distributor' ? 3 : 6 // 3=Distributor, 6=User (from mobile app)

          // 2. Call /role_user
          await api.post('/role_user', {
            role_id: roleId,
            user_id: userId
          })

          // 3. Call /company_user (Default company 1)
          await api.post('/company_user', {
            company_id: 1,
            user_id: userId
          })
          
          return { success: true, message: 'Registration successful' }
        }

        // Handle error messages
        return { 
          success: false, 
          message: response.message || 'Registration failed' 
        }

      } catch (error: any) {
        console.error('Registration Error:', error)
        // Check for specific error structures if needed
        return { success: false, message: error.message || 'An error occurred during registration' }
      }
    },

    // Update Profile with specific data (for upgrades)
    async updateProfile(data: any) {
      const api = useApi()
      if (!this.user) return { success: false, message: 'Not logged in' }
      
      const response = await api.patch(`/users/${this.user.id}`, data)
      if (response.success) {
         // Update local user
         this.user = { ...this.user, ...data }
         this.setUser(this.user, this.token!)
         return { success: true }
      }
      return { success: false, message: response.message || 'Update failed' }
    }
  },
})
