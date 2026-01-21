'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import { Copy, Check, Braces, Maximize2, Minimize2 } from 'lucide-react'

interface DevSchemaPanelProps {
  snippet: Snippet
}

export default function DevSchemaPanel({ snippet }: DevSchemaPanelProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const hasSchema = snippet.inputs_schema && Object.keys(snippet.inputs_schema).length > 0
  const schemaJson = hasSchema ? JSON.stringify(snippet.inputs_schema, null, 2) : null

  const handleCopy = async () => {
    if (!schemaJson) return
    await navigator.clipboard.writeText(schemaJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hasSchema) {
    return (
      <div className="text-spotify-lightgray text-sm p-4 bg-spotify-darkgray/40 rounded-lg">
        <p className="font-medium mb-1">No schema defined</p>
        <p className="text-xs text-spotify-lightgray/70">
          This is a prompt type without an inputs_schema. Workflows define their input fields in the schema.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action button */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-spotify-gray hover:bg-spotify-gray/80 text-white rounded-lg transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Schema JSON'}
        </button>
      </div>

      {/* Schema content */}
      <div className="bg-spotify-black/80 rounded-lg border border-spotify-gray/30 overflow-hidden">
        <div className="px-4 py-2 bg-spotify-gray/20 border-b border-spotify-gray/30 flex items-center gap-2">
          <Braces size={14} className="text-spotify-lightgray" />
          <span className="text-xs text-spotify-lightgray font-medium">inputs_schema</span>
          <span className="text-xs text-spotify-lightgray/50 ml-auto">
            {Object.keys(snippet.inputs_schema!).length} field(s)
          </span>
        </div>
        <pre className={`p-4 overflow-x-auto text-sm text-spotify-lightgray font-mono whitespace-pre-wrap transition-all ${isExpanded ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
          {schemaJson}
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
