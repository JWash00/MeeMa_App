'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { PatchRequirement } from '@/lib/prompttest/patch'

interface PatchButtonProps {
  requirements: PatchRequirement[]
  disabled: boolean
  onPatchComplete: (patchText: string) => void
  snippetId: string
  inputValues: Record<string, string>
  originalOutput: string
  snippetContext?: {
    title: string
    description: string
    category?: string
  }
}

export default function PatchButton({
  requirements,
  disabled,
  onPatchComplete,
  snippetId,
  inputValues,
  originalOutput,
  snippetContext
}: PatchButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePatch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/prompttest/patch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippetId,
          inputValues,
          originalOutput,
          requirements,
          snippetContext
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Patch failed')
      }

      const data = await response.json()
      onPatchComplete(data.patchText)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate patch'
      setError(message)
      console.error('Patch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sectionCount = requirements.length
  const sectionLabel = sectionCount === 1 ? 'section' : 'sections'

  return (
    <div className="space-y-2">
      <button
        onClick={handlePatch}
        disabled={disabled || isLoading}
        className={`w-full px-4 py-3 rounded-full font-semibold transition-colors text-sm flex items-center justify-center gap-2 ${
          disabled || isLoading
            ? 'bg-spotify-gray/50 text-spotify-lightgray cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        <Wand2 size={16} className={isLoading ? 'animate-spin' : ''} />
        {isLoading ? 'Patching...' : `Patch Missing Sections (${sectionCount})`}
      </button>

      <p className="text-xs text-spotify-lightgray text-center">
        Appends missing {sectionLabel} without rewriting your existing output
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
