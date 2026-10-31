// API Service for Markz Website
// Connects to the existing Laravel API

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  
  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'company-id': '1', // Default company ID (company 1 = Aadab, the owner's own store)
    }
    
    if (typeof window === 'undefined') return headers
    
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }
  
  // Generic fetch wrapper
  const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string }> => {
    try {
      const isFormData = options.body instanceof FormData
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      }
      
      if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      })
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('API Error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }
  
  // GET request
  const get = <T>(endpoint: string, params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch<T>(endpoint + queryString, { method: 'GET' })
  }
  
  // POST request
  const post = <T>(endpoint: string, body?: any) => {
    return apiFetch<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    })
  }
  
  // PUT request
  const put = <T>(endpoint: string, body?: any) => {
    return apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    })
  }

  // PATCH request
  const patch = <T>(endpoint: string, body?: any) => {
    return apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }
  
  // DELETE request
  const del = <T>(endpoint: string) => {
    return apiFetch<T>(endpoint, { method: 'DELETE' })
  }
  
  return {
    get,
    post,
    put,
    patch,
    del,
    baseURL,
  }
}
