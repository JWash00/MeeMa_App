// Parameterized copy helpers for dynamic content

import { VOICE_COPY } from './voice'

/**
 * Results count with proper pluralization
 */
export function resultsCount(count: number, noun: string = 'result'): string {
  if (count === 0) return `No ${noun}s`
  if (count === 1) return `1 ${noun}`
  return `${count} ${noun}s`
}

/**
 * Error message formatter
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return VOICE_COPY.ERRORS.generic.title
}

/**
 * Loading state text
 */
export function loadingState(action?: string): string {
  return action ? `${action}...` : VOICE_COPY.UI.status.loading
}
