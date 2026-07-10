// Small utility helpers shared across route modules.
// No Node.js APIs are used here - everything must run on Cloudflare Workers (Web APIs only).

/** Generate a cryptographically random hex token using Web Crypto API */
export function generateToken(bytes = 32): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Generate a numeric OTP code of given length (default 6 digits) */
export function generateOtp(length = 6): string {
  const digits = '0123456789'
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  let out = ''
  for (let i = 0; i < length; i++) out += digits[arr[i] % 10]
  return out
}

/** Generate a unique order number like GM-20260710-XXXXXX */
export function generateOrderNo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = generateToken(3).toUpperCase()
  return `GM${y}${m}${d}${rand}`
}

/** Basic phone number normalization/validation (10-15 digits, optional leading +) */
export function normalizePhone(phone: string): string | null {
  if (!phone) return null
  const trimmed = phone.trim().replace(/[\s-]/g, '')
  if (!/^\+?\d{10,15}$/.test(trimmed)) return null
  return trimmed
}

export function nowIso(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

export function addMinutesIso(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60000)
  return d.toISOString().replace('T', ' ').substring(0, 19)
}
