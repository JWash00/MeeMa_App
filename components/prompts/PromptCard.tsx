'use client'

import { useState } from 'react'
import { CanonicalPrompt, Platform } from '@/lib/types/prompts'
import { transformPrompt } from '@/lib/adapters'
import { savePrompt, unsavePrompt } from '@/lib/supabase/prompts'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import PlatformSelect from './PlatformSelect'

interface PromptCardProps {
  prompt: CanonicalPrompt
  initialPlatform?: Platform
  initialSaved?: boolean
  showSaveButton?: boolean
}

export default function PromptCard({
  prompt,
  initialPlatform = 'midjourney',
  initialSaved = false,
  showSaveButton = true,
}: PromptCardProps) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform)
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const transformedPrompt = transformPrompt(prompt, platform)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transformedPrompt)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleSave = async () => {
    if (!user) {
      router.push('/login?redirect=/prompts')
      return
    }

    setSaving(true)

    try {
      if (saved) {
        const success = await unsavePrompt(user.id, prompt.id, platform)
        if (success) {
          setSaved(false)
          toast.success('Removed from saved')
        }
      } else {
        const success = await savePrompt(user.id, prompt.id, platform)
        if (success) {
          setSaved(true)
          toast.success('Saved to library')
        }
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{prompt.use_case}</p>
        </div>
        <PlatformSelect value={platform} onChange={setPlatform} />
      </div>

      {/* Prompt Output */}
      <textarea
        readOnly
        value={transformedPrompt}
        className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm font-mono resize-none focus:outline-none"
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <CopyIcon />
          Copy
        </button>

        {showSaveButton && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
              saved
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HeartIcon filled={saved} />
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}
