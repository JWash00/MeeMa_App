'use client'

import { Check, X } from 'lucide-react'

const isContent = [
  "Production integration infrastructure",
  "Code you own and customize",
  "Best-practice patterns for AI calls",
  "Standard AI layer across your codebase"
]

const isNotContent = [
  "Consumer AI tool bundle/chat playground",
  "Prompt marketplace or template library",
  "Observability-only tooling",
  "AI usage analytics dashboard"
]

export default function ComparisonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Prompt Toolkit IS */}
      <div className="bg-spotify-darkgray rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Prompt Toolkit is</h3>
        <ul className="space-y-3">
          {isContent.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check size={18} className="text-spotify-green flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prompt Toolkit IS NOT */}
      <div className="bg-spotify-darkgray rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Prompt Toolkit is not</h3>
        <ul className="space-y-3">
          {isNotContent.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <X size={18} className="text-spotify-lightgray flex-shrink-0 mt-0.5" />
              <span className="text-sm text-spotify-lightgray">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
