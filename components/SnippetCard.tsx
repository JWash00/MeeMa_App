'use client'

import { Snippet } from '@/lib/types'
import { qaEvaluate } from '@/lib/qa/qaRouter'
import { computeTrustStatus } from '@/lib/trust/trustUtils'
import { TrustBadge } from '@/components/trust/TrustBadge'

interface SnippetCardProps {
  snippet: Snippet
  onClick?: () => void
}

export default function SnippetCard({ snippet, onClick }: SnippetCardProps) {
  // Compute trust status from QA evaluation
  const qaResult = qaEvaluate(snippet)
  const trustStatus = computeTrustStatus(qaResult)

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-lg p-6 hover:bg-surface-2 hover:border-accent/30 transition-all cursor-pointer h-full group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
          {snippet.title}
        </h3>
        <TrustBadge status={trustStatus} size="sm" />
      </div>
      <p className="text-muted mb-4 text-sm line-clamp-2">
        {snippet.description}
      </p>
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
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted font-mono">
          {snippet.language}
        </span>
        {snippet.provider && (
          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">
            {snippet.provider}
          </span>
        )}
      </div>
    </div>
  )
}
