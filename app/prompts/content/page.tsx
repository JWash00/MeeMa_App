'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CreateResponse, QAStatus } from '@/src/contracts/create'

export default function ContentQAPage() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qaStatus, setQaStatus] = useState<QAStatus | null>(null)

  async function onGenerate() {
    if (!prompt.trim()) return

    setIsLoading(true)
    setOutput('')
    setQaStatus(null)

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentText: prompt }),
      })
      const data: CreateResponse = await response.json()

      if (data.qa) {
        setQaStatus(data.qa)
      }

      if (data.qa?.error) {
        setOutput(`Error: ${data.qa.error}`)
      } else {
        setOutput(data.output)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setOutput(`Error: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">MeeMa</Link>
          <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Content QA</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Content Generation (QA)</h1>
          <p className="text-gray-600 mt-1">Direct Anthropic content generation. No routing, no Midjourney.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Explain how retrieval-augmented generation works"'
            className="w-full min-h-[88px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 bg-white"
          />
          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isLoading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>

        {/* QA Status Banner */}
        {qaStatus && (
          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs font-mono">
            <div className="font-semibold text-yellow-800 mb-2">QA Status</div>
            <div className="space-y-1 text-yellow-700">
              <div>API Key Present: {qaStatus.keyPresent ? 'true' : 'false'}</div>
              <div>Anthropic Called: {qaStatus.anthropicCalled ? 'true' : 'false'}</div>
              <div>Fallback Used: {qaStatus.fallbackUsed ? 'true' : 'false'}</div>
              {qaStatus.error && (
                <div className="text-red-600">Error: {qaStatus.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">Generated Content</p>
            </div>
            <pre className="w-full p-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 overflow-auto whitespace-pre-wrap max-h-[600px]">
              {output}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
