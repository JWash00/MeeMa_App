'use client'

import { Snippet, ProductionChecklistItem } from '@/lib/types'
import CopyButton from './CopyButton'
import ProductionChecklist from './ProductionChecklist'

interface SnippetDetailProps {
  snippet: Snippet
}

// Derive production checklist from snippet code and metadata
function getProductionChecklist(snippet: Snippet): ProductionChecklistItem[] {
  const code = snippet.code.toLowerCase()
  const description = snippet.description.toLowerCase()

  return [
    {
      label: 'Includes retry / backoff logic',
      checked: code.includes('retry') || code.includes('backoff') || code.includes('attempt'),
      description: 'Automatically retries failed requests with exponential backoff'
    },
    {
      label: 'Handles rate limits (429)',
      checked: code.includes('429') || description.includes('rate limit'),
      description: 'Properly detects and handles API rate limiting'
    },
    {
      label: 'Uses timeouts or cancellation',
      checked: code.includes('timeout') || code.includes('abort') || code.includes('cancel'),
      description: 'Prevents hanging requests with timeout protection'
    },
    {
      label: 'Comprehensive error handling',
      checked: code.includes('try') && code.includes('catch') && code.includes('error'),
      description: 'Catches and handles errors gracefully'
    },
    {
      label: 'Type-safe implementation',
      checked: snippet.language === 'typescript' || code.includes('interface') || code.includes('type'),
      description: 'Uses TypeScript for compile-time safety'
    },
    {
      label: 'Safe for production use',
      checked: snippet.scope === 'official',
      description: 'Vetted and approved for production environments'
    },
  ]
}

export default function SnippetDetail({ snippet }: SnippetDetailProps) {
  const checklist = getProductionChecklist(snippet)

  return (
    <div className="space-y-6">
      {/* Main snippet card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {snippet.title}
            </h1>
            {snippet.provider && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {snippet.provider}
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">
            {snippet.description}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 font-mono">
              {snippet.language}
            </span>
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
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <CopyButton code={snippet.code} snippetId={snippet.id} />
        </div>

        <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">{snippet.code}</code>
        </pre>
      </div>

      {/* Production Checklist */}
      <ProductionChecklist items={checklist} />
    </div>
  )
}
