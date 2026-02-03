/**
 * Prompt hashing utility for privacy-light logging.
 * Normalizes and hashes user prompts using SHA-256.
 */

/**
 * Normalize prompt text for consistent hashing.
 * - Trims whitespace
 * - Collapses multiple spaces to single space
 * - Converts to lowercase
 */
export function normalizePrompt(input: string): string {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Generate SHA-256 hash of normalized prompt.
 * Works in browser via Web Crypto API.
 */
export async function hashPrompt(input: string): Promise<string> {
  const normalized = normalizePrompt(input)
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
