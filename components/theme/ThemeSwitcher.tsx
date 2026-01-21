'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { ThemePreference } from './theme'
import { useState, useEffect } from 'react'

const options: { value: ThemePreference; icon: typeof Monitor; label: string }[] = [
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
]

export default function ThemeSwitcher() {
  const { preference, setPreference } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="h-9 bg-surface-hover rounded-lg animate-pulse" />
  }

  return (
    <div
      className="flex bg-surface-hover rounded-lg p-0.5 gap-0.5"
      role="radiogroup"
      aria-label="Theme preference"
    >
      {options.map(({ value, icon: Icon, label }) => {
        const isSelected = preference === value

        return (
          <button
            key={value}
            onClick={() => setPreference(value)}
            className={`
              flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md
              text-xs font-medium transition-all duration-200 flex-1
              focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-bg
              ${
                isSelected
                  ? 'bg-background text-foreground'
                  : 'text-text-secondary hover:text-foreground hover:bg-background/50'
              }
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Switch to ${label} theme`}
          >
            <Icon size={14} strokeWidth={2} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
