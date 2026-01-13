'use client'

import { Snippet } from '@/lib/types'
import SnippetCard from './SnippetCard'

interface SnippetListProps {
  snippets: Snippet[]
}

export default function SnippetList({ snippets }: SnippetListProps) {
  if (snippets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No snippets found matching your search.</p>
        <p className="text-sm mt-2">Try a different search term.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {snippets.map(snippet => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}
    </div>
  )
}
