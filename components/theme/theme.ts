/**
 * Core theme utilities (no React dependencies)
 * Used by both inline script and React components
 */

export type ThemePreference = 'system' | 'dark' | 'light'
export type ResolvedTheme = 'dark' | 'light'

const STORAGE_KEY = 'themePreference'

/**
 * Get stored theme preference from localStorage
 * Defaults to 'system' if not found or invalid
 */
export function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
  } catch (e) {
    // localStorage access might be blocked
  }

  return 'system'
}

/**
 * Save theme preference to localStorage
 */
export function setStoredPreference(preference: ThemePreference): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch (e) {
    // localStorage access might be blocked
  }
}

/**
 * Get system color scheme preference
 * Returns 'dark' or 'light' based on OS preference
 */
export function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolve theme preference to actual theme
 * If preference is 'system', resolve to OS preference
 */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemPreference()
  }
  return preference
}

/**
 * Apply theme to document
 * Applies both .dark class (Tailwind) and data-theme attribute
 * Also sets colorScheme style for native browser elements
 */
export function applyTheme(theme: ResolvedTheme): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Apply dark class for Tailwind compatibility
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Apply data-theme attribute for future flexibility
  root.dataset.theme = theme

  // Apply colorScheme for native browser elements (scrollbars, form inputs)
  root.style.colorScheme = theme
}
