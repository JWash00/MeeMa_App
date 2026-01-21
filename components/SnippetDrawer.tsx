'use client'

import { useEffect, useCallback } from 'react'
import { Snippet } from '@/lib/types'
import { X } from 'lucide-react'
import SnippetDetail from './SnippetDetail'

interface SnippetDrawerProps {
  snippet: Snippet | null
  onClose: () => void
}

// Generate a consistent color based on snippet title for gradient
function getGradientColor(title: string): string {
  const colors = [
    'from-accent/30',
    'from-purple-500/30',
    'from-blue-500/30',
    'from-pink-500/30',
    'from-teal-500/30',
    'from-indigo-500/30',
    'from-brand/20',
    'from-cyan-500/30',
  ]
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function SnippetDrawer({ snippet, onClose }: SnippetDrawerProps) {
  const isOpen = !!snippet

  // Handle ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!snippet) return null

  const gradientColor = getGradientColor(snippet.title)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 dark:bg-black/80 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-2xl bg-background z-50
          transform transition-transform duration-300 ease-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Gradient header background */}
        <div className={`absolute top-0 left-0 right-0 h-80 bg-gradient-to-b ${gradientColor} via-background/50 to-background pointer-events-none`} />
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-transparent via-transparent to-background/90 pointer-events-none" />

        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2.5 bg-surface-hover hover:bg-surface-hover/80 hover:scale-105 rounded-full transition-all"
            aria-label="Close drawer"
          >
            <X size={22} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="relative px-6 lg:px-8 pb-10 -mt-2">
          <SnippetDetail snippet={snippet} />
        </div>
      </div>
    </>
  )
}
