/**
 * Anonymous session ID management.
 * Used for logging when user is not authenticated.
 */

const STORAGE_KEY = 'meema_anon_session_id'

/**
 * Get or create anonymous session ID.
 * Persists in localStorage for session correlation.
 */
export function getAnonSessionId(): string {
  if (typeof window === 'undefined') return ''

  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

/**
 * Clear anonymous session ID.
 * Call when user logs in to transition to authenticated tracking.
 */
export function clearAnonSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
