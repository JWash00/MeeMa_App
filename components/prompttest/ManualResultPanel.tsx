'use client'

import { useState, useEffect } from 'react'
import { Image, Video, Volume2 } from 'lucide-react'
import ActionButton from '@/components/actions/ActionButton'

interface ManualResultPanelProps {
  modality: 'image' | 'video' | 'audio'
  snippetId: string
  testName?: string
}

export default function ManualResultPanel({
  modality,
  snippetId,
  testName
}: ManualResultPanelProps) {
  const [resultUrl, setResultUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isReviewed, setIsReviewed] = useState(false)

  const storageKey = `ptk_review_${snippetId}_${testName || 'default'}`

  // Load stored review on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setResultUrl(parsed.url || '')
        setNotes(parsed.notes || '')
        setIsReviewed(true)
      } catch (error) {
        console.error('Failed to load stored review:', error)
      }
    }
  }, [storageKey])

  const handleMarkReviewed = () => {
    const reviewData = {
      url: resultUrl,
      notes,
      at: new Date().toISOString()
    }
    localStorage.setItem(storageKey, JSON.stringify(reviewData))
    setIsReviewed(true)
  }

  const handleClearReview = () => {
    localStorage.removeItem(storageKey)
    setResultUrl('')
    setNotes('')
    setIsReviewed(false)
  }

  const Icon = modality === 'image' ? Image : modality === 'video' ? Video : Volume2

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-spotify-lightgray">
        <Icon size={18} />
        <h3 className="font-semibold text-white dark:text-white">Result Capture</h3>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300 dark:text-blue-300">
          {modality === 'image'
            ? 'Image providers often run outside Prompt Toolkit. Use Copy Prompt, run in your provider (e.g., Midjourney), then save the result URL or notes here.'
            : modality === 'video'
            ? 'Video providers often run outside Prompt Toolkit. Use Copy Prompt, run in your provider (e.g., Runway), then save the result URL or notes here.'
            : 'Audio providers often run outside Prompt Toolkit. Use Copy Prompt, run in your provider (e.g., ElevenLabs, Suno), then save the result URL or notes here.'
          }
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white dark:text-white mb-1">
            Result URL (optional)
          </label>
          <input
            type="url"
            value={resultUrl}
            onChange={(e) => setResultUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-spotify-gray dark:bg-spotify-gray border border-spotify-lightgray/20 dark:border-spotify-lightgray/20 rounded-lg text-white dark:text-white focus:border-spotify-green focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white dark:text-white mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add observations, quality notes, etc."
            rows={4}
            className="w-full px-3 py-2 bg-spotify-gray dark:bg-spotify-gray border border-spotify-lightgray/20 dark:border-spotify-lightgray/20 rounded-lg text-white dark:text-white focus:border-spotify-green focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-2">
          <ActionButton
            onClick={handleMarkReviewed}
            variant="run"
            className="flex-1 rounded-full"
          >
            {isReviewed ? 'Update Review' : 'Mark as Reviewed'}
          </ActionButton>

          {isReviewed && (
            <button
              onClick={handleClearReview}
              className="px-4 py-2 bg-spotify-gray dark:bg-spotify-gray hover:bg-spotify-lightgray/20 text-white dark:text-white rounded-full transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {isReviewed && (() => {
          try {
            const stored = localStorage.getItem(storageKey)
            const parsed = stored ? JSON.parse(stored) : {}
            const reviewDate = parsed.at ? new Date(parsed.at).toLocaleString() : 'Unknown'
            return (
              <div className="p-3 bg-status-success/10 border border-status-success/30 rounded-lg">
                <p className="text-sm text-status-success">
                  ✓ Reviewed {reviewDate}
                </p>
              </div>
            )
          } catch {
            return null
          }
        })()}
      </div>
    </div>
  )
}
