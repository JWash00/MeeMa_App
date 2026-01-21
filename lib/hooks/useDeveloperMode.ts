'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ptk_dev_mode'

export function useDeveloperMode() {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage and URL param
  useEffect(() => {
    setMounted(true)

    // Check URL param first (takes priority)
    const urlParams = new URLSearchParams(window.location.search)
    const viewParam = urlParams.get('view')

    if (viewParam === 'dev') {
      setIsDeveloperMode(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      return
    }

    // Fall back to localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsDeveloperMode(true)
    }
  }, [])

  // Persist to localStorage when changed
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, isDeveloperMode ? 'true' : 'false')
  }, [isDeveloperMode, mounted])

  const setDeveloperMode = (value: boolean) => {
    setIsDeveloperMode(value)
  }

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(prev => !prev)
  }

  return {
    isDeveloperMode: mounted ? isDeveloperMode : false,
    setDeveloperMode,
    toggleDeveloperMode,
    mounted
  }
}
