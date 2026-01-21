'use client'

import { Snippet } from '@/lib/types'
import SnippetCard from './SnippetCard'
import EmptyState from './ui/EmptyState'
import { LIBRARY } from '@/lib/voice/voice'

interface SnippetListProps {
  snippets: Snippet[]
  onSnippetClick?: (snippet: Snippet) => void
}

export default function SnippetList({ snippets, onSnippetClick }: SnippetListProps) {
  if (snippets.length === 0) {
    return (
      <EmptyState
        title={LIBRARY.search.noResults.title}
        subtitle={LIBRARY.search.noResults.hint}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {snippets.map(snippet => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onClick={() => onSnippetClick?.(snippet)}
        />
      ))}
    </div>
  )
}
