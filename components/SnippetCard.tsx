'use client'

import Link from 'next/link'
import { Snippet } from '@/lib/types'

interface SnippetCardProps {
  snippet: Snippet
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
  return (
    <Link href={`/snippet/${snippet.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          {snippet.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          {snippet.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {snippet.tags.map(tag => (
            <span
              key={tag}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500 font-mono">
          {snippet.language}
        </div>
      </div>
    </Link>
  )
}
