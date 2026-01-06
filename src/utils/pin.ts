/**
 * PIN Security Utilities
 * 
 * Uses Web Crypto API to hash PINs securely.
 * Never stores raw PINs - only hashed values.
 */

/**
 * Hash a PIN using SHA-256
 * @param pin - The raw PIN string (4-6 digits)
 * @returns Promise resolving to hex-encoded hash
 */
export async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a PIN against a stored hash
 * @param pin - The PIN to verify
 * @param storedHash - The stored hash to compare against
 * @returns Promise resolving to true if PIN matches
 */
export async function verifyPIN(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPIN(pin);
  return hash === storedHash;
}

/**
 * Validate PIN format (4-6 numeric digits)
 * @param pin - The PIN to validate
 * @returns true if valid format
 */
export function validatePINFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

