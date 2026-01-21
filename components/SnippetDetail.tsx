'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import CopyButton from './CopyButton'
import { qaEvaluate } from '@/lib/qa/qaRouter'
import { computeTrustStatus } from '@/lib/trust/trustUtils'
import { TrustBadge } from '@/components/trust/TrustBadge'
import DevTabPanel from './dev/DevTabPanel'
import { useDeveloperMode } from '@/lib/hooks/useDeveloperMode'
import { Maximize2, Minimize2 } from 'lucide-react'

interface SnippetDetailProps {
  snippet: Snippet
}

export default function SnippetDetail({ snippet }: SnippetDetailProps) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false)
  // Compute trust status from QA evaluation
  const qaResult = qaEvaluate(snippet)
  const trustStatus = computeTrustStatus(qaResult)
  const { isDeveloperMode } = useDeveloperMode()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              {snippet.title}
            </h1>
            <TrustBadge status={trustStatus} size="md" />
          </div>
          {snippet.provider && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900/40 text-purple-300">
              {snippet.provider}
            </span>
          )}
        </div>
        <p className="text-muted mb-4">
          {snippet.description}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted font-mono bg-surface-2 px-2 py-1 rounded">
            {snippet.language}
          </span>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map(tag => (
              <span
                key={tag}
                className="inline-block bg-accent/10 text-accent border border-accent/30 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dev Tabs (when developer mode is ON) */}
      {isDeveloperMode ? (
        <DevTabPanel snippet={snippet} />
      ) : (
        /* Code block (only when dev mode is OFF - dev mode uses Template tab instead) */
        <div className="bg-surface-hover rounded-lg p-4 border border-surface-hover">
          <div className="mb-3 flex justify-end">
            <CopyButton code={snippet.code} snippetId={snippet.id} />
          </div>
          <pre className={`bg-background text-foreground p-4 rounded-lg overflow-x-auto border border-surface-hover transition-all ${isCodeExpanded ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
            <code className="font-mono text-sm">{snippet.code}</code>
          </pre>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setIsCodeExpanded(!isCodeExpanded)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-surface-hover hover:bg-surface-hover/80 text-text-secondary hover:text-foreground rounded-lg transition-colors"
            >
              {isCodeExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {isCodeExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      )}

      {/* Version info */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>Version {snippet.version || '1.0'}</span>
        {snippet.updated_at && (
          <span>Updated {new Date(snippet.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}
