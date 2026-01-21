'use client'

import { Snippet } from '@/lib/types'
import { Play } from 'lucide-react'

interface DevUsePanelProps {
  snippet: Snippet
}

export default function DevUsePanel({ snippet }: DevUsePanelProps) {
  return (
    <div className="bg-spotify-black/80 rounded-lg border border-spotify-gray/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Play size={16} className="text-accent" />
        <span className="text-sm font-medium text-white">How to Use</span>
      </div>
      <ol className="space-y-2 text-sm text-spotify-lightgray">
        <li className="flex gap-2">
          <span className="text-accent font-medium">1.</span>
          <span>Copy the prompt using the Copy Code button below</span>
        </li>
        <li className="flex gap-2">
          <span className="text-accent font-medium">2.</span>
          <span>Paste into your preferred AI assistant (Claude, ChatGPT, etc.)</span>
        </li>
        {snippet.inputs_schema && Object.keys(snippet.inputs_schema).length > 0 && (
          <li className="flex gap-2">
            <span className="text-accent font-medium">3.</span>
            <span>Fill in the required variables (see Schema tab for details)</span>
          </li>
        )}
        <li className="flex gap-2">
          <span className="text-accent font-medium">{snippet.inputs_schema && Object.keys(snippet.inputs_schema).length > 0 ? '4.' : '3.'}</span>
          <span>Review and customize the output as needed</span>
        </li>
      </ol>
    </div>
  )
}
