'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CreateResponse, QAStatus, CreateRequest, Audience, TikTokLength, Tone } from '@/src/contracts/create'

export default function TikTokPage() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qaStatus, setQaStatus] = useState<QAStatus | null>(null)

  // Constraint state
  const [audience, setAudience] = useState<Audience>('general')
  const [length, setLength] = useState<TikTokLength>('30s')
  const [tone, setTone] = useState<Tone>('punchy')

  async function onGenerate() {
    if (!prompt.trim()) return

    setIsLoading(true)
    setOutput('')
    setQaStatus(null)

    try {
      const request: CreateRequest = {
        userPrompt: prompt,
        domain: 'social_video',
        intent: 'tiktok_script',
        platform: 'tiktok',
        constraints: { audience, length, tone }
      }

      const response = await fetch('/api/tiktok/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
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
          <div className="flex items-center gap-4">
            <Link href="/prompts/content" className="text-sm text-gray-600 hover:text-gray-900">
              Content
            </Link>
            <Link href="/prompts" className="text-sm text-gray-600 hover:text-gray-900">
              Image Prompts
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">TikTok Script</h1>
          <p className="text-gray-600 mt-1">Generate an educational TikTok script with hook, beats, and shot suggestions.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Explain compound interest" or "3 morning habits that boost productivity"'
            className="w-full min-h-[88px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 bg-white"
          />

          {/* Constraint Controls */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Audience:</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as Audience)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="general">General</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Length:</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as TikTokLength)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="45s">45 seconds</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="neutral">Neutral</option>
                <option value="friendly">Friendly</option>
                <option value="punchy">Punchy</option>
              </select>
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isLoading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate Script'}
          </button>
        </div>

        {/* QA Status Banner - only visible when QA_MODE=true */}
        {qaStatus?.qaMode && (
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
              <p className="text-sm font-semibold text-gray-900">Generated Script</p>
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
