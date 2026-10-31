// Markz delivery / return policy (public numbers). Cached for the whole session.
export const usePolicy = () => {
  const api = useApi()
  const policy = useState<any>('markz_policy', () => null)

  const load = async () => {
    if (policy.value) return policy.value
    const r: any = await api.get('/marketplace/policy')
    if (r && r.data) policy.value = r.data
    return policy.value
  }

  // delivery fee for a cart value (0 = free)
  const deliveryFor = (subtotal: number, fallback = 0) => {
    const p = policy.value
    if (!p) return fallback
    return subtotal >= Number(p.free_delivery_above) ? 0 : Number(p.delivery_fee)
  }

  // how much more to add for free delivery (0 when already free / no policy)
  const awayFromFree = (subtotal: number) => {
    const p = policy.value
    if (!p || subtotal <= 0) return 0
    const left = Number(p.free_delivery_above) - subtotal
    return left > 0 ? Math.ceil(left) : 0
  }

  return { policy, load, deliveryFor, awayFromFree }
}
