'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  ThemePreference,
  ResolvedTheme,
  getStoredPreference,
  setStoredPreference,
  resolveTheme,
  applyTheme,
} from './theme'

interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true)

    // Check for old 'theme' key and migrate to 'themePreference'
    try {
      const oldTheme = localStorage.getItem('theme')
      if (oldTheme && (oldTheme === 'dark' || oldTheme === 'light')) {
        // Migrate old value
        localStorage.setItem('themePreference', oldTheme)
        localStorage.removeItem('theme')
        setPreferenceState(oldTheme)
        setResolvedTheme(oldTheme)
        applyTheme(oldTheme)
        return
      }
    } catch (e) {
      // localStorage access might be blocked
    }

    // Normal initialization
    const stored = getStoredPreference()
    setPreferenceState(stored)
    const resolved = resolveTheme(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Listen to system preference changes when preference is 'system'
  useEffect(() => {
    if (!mounted || preference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      applyTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preference, mounted])

  const setPreference = (newPreference: ThemePreference) => {
    setPreferenceState(newPreference)
    setStoredPreference(newPreference)
    const resolved = resolveTheme(newPreference)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
