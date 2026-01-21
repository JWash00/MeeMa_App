'use client'

import { useEffect, useCallback } from 'react'
import { Snippet } from '@/lib/types'
import { X, Sparkles } from 'lucide-react'
import SnippetCard from './SnippetCard'

interface RecommendedDrawerProps {
  snippets: Snippet[]
  isOpen: boolean
  onClose: () => void
  onSnippetClick: (snippet: Snippet) => void
}

export default function RecommendedDrawer({
  snippets,
  isOpen,
  onClose,
  onSnippetClick
}: RecommendedDrawerProps) {
  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer - slides from left */}
      <div className={`
        fixed top-0 left-0 h-full w-full max-w-md bg-spotify-black z-50
        transform transition-transform duration-300 ease-out overflow-y-auto
        lg:left-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-spotify-green/20 to-spotify-black p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-spotify-green" size={24} />
              <h2 className="text-xl font-bold text-white">Recommended</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          <p className="text-sm text-spotify-lightgray">
            Reliable prompts and workflows for professional results.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            {snippets.map(snippet => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onClick={() => {
                  onSnippetClick(snippet)
                  onClose()
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
