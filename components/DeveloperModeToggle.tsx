'use client'

import { Code } from 'lucide-react'
import { useDeveloperMode } from '@/lib/hooks/useDeveloperMode'

export default function DeveloperModeToggle() {
  const { isDeveloperMode, toggleDeveloperMode, mounted } = useDeveloperMode()

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-8 w-24 rounded-full bg-spotify-gray/50" />
    )
  }

  return (
    <button
      onClick={toggleDeveloperMode}
      aria-label={isDeveloperMode ? 'Disable developer mode' : 'Enable developer mode'}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${isDeveloperMode
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
          : 'bg-spotify-gray/60 text-spotify-lightgray hover:bg-spotify-gray hover:text-white'
        }
      `}
    >
      <Code size={14} strokeWidth={2.5} />
      <span>Dev</span>
    </button>
  )
}
