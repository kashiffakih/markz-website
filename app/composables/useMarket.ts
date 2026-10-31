// Helpers + public marketplace API calls (no login needed)
export const useMarket = () => {
  const config = useRuntimeConfig()
  const api = useApi()
  const mediaBase = config.public.mediaBase as string

  const img = (path?: string | null) => {
    if (!path) return ''
    return path.startsWith('http') ? path : `${mediaBase}${path}`
  }

  const money = (n?: number | string | null) => {
    if (n === null || n === undefined || n === '') return ''
    return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  const clean = (params: Record<string, any> = {}) => {
    const out: Record<string, string> = {}
    Object.keys(params).forEach((k) => {
      const v = params[k]
      if (v !== undefined && v !== null && v !== '') out[k] = String(v)
    })
    return out
  }

  const home = () => api.get<any>('/marketplace/home') as Promise<any>
  const products = (params: Record<string, any> = {}) => api.get<any>('/marketplace/products', clean(params)) as Promise<any>
  const sellers = (params: Record<string, any> = {}) => api.get<any>('/marketplace/sellers', clean(params)) as Promise<any>
  const seller = (id: number | string) => api.get<any>(`/marketplace/sellers/${id}`) as Promise<any>

  return { img, money, home, products, sellers, seller }
}
