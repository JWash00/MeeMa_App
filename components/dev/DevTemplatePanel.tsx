'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import { getRawTemplateText } from '@/lib/utils/snippetHelpers'
import { getTemplateAsMarkdown } from '@/lib/utils/exportHelpers'
import { Copy, Check, FileCode, Maximize2, Minimize2 } from 'lucide-react'

interface DevTemplatePanelProps {
  snippet: Snippet
}

export default function DevTemplatePanel({ snippet }: DevTemplatePanelProps) {
  const [copiedRaw, setCopiedRaw] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const template = getRawTemplateText(snippet)

  const handleCopyRaw = async () => {
    await navigator.clipboard.writeText(template)
    setCopiedRaw(true)
    setTimeout(() => setCopiedRaw(false), 2000)
  }

  const handleCopyMarkdown = async () => {
    const markdown = getTemplateAsMarkdown(snippet)
    await navigator.clipboard.writeText(markdown)
    setCopiedMd(true)
    setTimeout(() => setCopiedMd(false), 2000)
  }

  if (!template) {
    return (
      <div className="text-spotify-lightgray text-sm p-4 bg-spotify-darkgray/40 rounded-lg">
        No template content available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyRaw}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-spotify-gray hover:bg-spotify-gray/80 text-white rounded-lg transition-colors"
        >
          {copiedRaw ? <Check size={14} /> : <Copy size={14} />}
          {copiedRaw ? 'Copied!' : 'Copy Template'}
        </button>
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-spotify-gray hover:bg-spotify-gray/80 text-white rounded-lg transition-colors"
        >
          {copiedMd ? <Check size={14} /> : <FileCode size={14} />}
          {copiedMd ? 'Copied!' : 'Copy as Markdown'}
        </button>
      </div>

      {/* Template content */}
      <div className="bg-spotify-black/80 rounded-lg border border-spotify-gray/30 overflow-hidden">
        <div className="px-4 py-2 bg-spotify-gray/20 border-b border-spotify-gray/30 flex items-center gap-2">
          <FileCode size={14} className="text-spotify-lightgray" />
          <span className="text-xs text-spotify-lightgray font-medium">Raw Template</span>
        </div>
        <pre className={`p-4 overflow-x-auto text-sm text-spotify-lightgray font-mono whitespace-pre-wrap transition-all ${isExpanded ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
          {template}
        </pre>
        <div className="flex justify-center py-2 border-t border-spotify-gray/30">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-surface-hover hover:bg-surface-hover/80 text-text-secondary hover:text-foreground rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
    </div>
  )
}
