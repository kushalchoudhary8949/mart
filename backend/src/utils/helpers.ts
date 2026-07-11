import crypto from 'crypto';

/**
 * Normalizes phone numbers (keeps last 10 digits, removes +91, spaces, etc.)
 */
export function normalizePhone(phone: string | number): string | null {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length < 10) return null;
  return cleaned.slice(-10);
}

/**
 * Checks if a string is a valid 10-digit phone number
 */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates a random numeric OTP of specified length
 */
export function generateOtp(length = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }
  return otp;
}

/**
 * Generates a secure random hex token of specified length
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a unique order number (e.g. VM-20231024-XXXXX)
 */
export function generateOrderNo(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VM-${dateStr}-${randomHex}`;
}
