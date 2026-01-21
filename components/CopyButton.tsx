'use client'

import { useState } from 'react'

interface CopyButtonProps {
  code: string
  snippetId: string
}

export default function CopyButton({ code, snippetId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)

      // Track copy event
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snippetId,
          eventType: 'copy',
        }),
      }).catch(() => {
        // Silently fail - analytics shouldn't break UX
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-5 py-2.5 bg-accent text-white font-semibold text-sm rounded-lg shadow-[0_2px_8px_rgba(28,215,96,0.2)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(28,215,96,0.25)] active:bg-accent-active active:translate-y-0 active:shadow-[0_1px_4px_rgba(28,215,96,0.15)] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all flex items-center gap-2 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"
    >
      {copied ? (
        <>
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Code
        </>
      )}
    </button>
  )
}
