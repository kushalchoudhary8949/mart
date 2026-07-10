// Live order tracking is simulated using elapsed time since the order was placed.
// This works within Cloudflare Pages' stateless request model (no long-lived
// connections/websockets needed) - each GET /api/orders/:id/track call computes
// the "current" status deterministically from elapsed time and eta_minutes,
// and persists status transitions (+ notifications) the first time they are observed.

export const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Preparing your order',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered'
}

export const STATUS_MESSAGES: Record<OrderStatus, string> = {
  placed: 'We have received your order and it is being processed.',
  confirmed: 'Your order has been confirmed by the store.',
  preparing: 'Our team is packing your items with care.',
  out_for_delivery: 'Your order is on the way! It will arrive shortly.',
  delivered: 'Your order has been delivered. Enjoy your groceries!'
}

// Fraction of total eta_minutes at which each status begins
const STATUS_THRESHOLDS: Record<OrderStatus, number> = {
  placed: 0,
  confirmed: 0.1,
  preparing: 0.3,
  out_for_delivery: 0.6,
  delivered: 1.0
}

export function computeCurrentStatus(placedAt: string, etaMinutes: number, cancelled: boolean): {
  status: OrderStatus | 'cancelled'
  progressPercent: number
  minutesElapsed: number
  minutesRemaining: number
} {
  if (cancelled) {
    return { status: 'cancelled', progressPercent: 0, minutesElapsed: 0, minutesRemaining: 0 }
  }

  const placedTime = new Date(placedAt + 'Z').getTime()
  const minutesElapsed = Math.max(0, (Date.now() - placedTime) / 60000)
  const fraction = Math.min(1, minutesElapsed / etaMinutes)

  let status: OrderStatus = 'placed'
  for (const s of ORDER_STATUSES) {
    if (fraction >= STATUS_THRESHOLDS[s]) status = s
  }

  return {
    status,
    progressPercent: Math.round(fraction * 100),
    minutesElapsed: Math.round(minutesElapsed * 10) / 10,
    minutesRemaining: Math.max(0, Math.round((etaMinutes - minutesElapsed) * 10) / 10)
  }
}

export function statusIndex(status: string): number {
  return ORDER_STATUSES.indexOf(status as OrderStatus)
}
