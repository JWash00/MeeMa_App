'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PATTERNS } from './patterns'
import { routeIntent } from './intentRouter'
import { generatePrompt } from './adapters'
import type { IntentPattern, PlatformId, RouteResult } from './types'

// QA status type (mirrors server)
interface QAStatus {
  qaMode: boolean
  keyPresent: boolean
  anthropicCalled: boolean
  fallbackUsed: boolean
  error?: string
}

// Internal defaults for each pattern (never shown to user)
const INTERNAL_DEFAULTS: Record<IntentPattern, Record<string, string>> = {
  thumbnail: {
    subject: 'the subject',
    style: 'eye-catching',
    text: '',
  },
  portrait: {
    subject: 'person',
    mood: 'dramatic',
    lighting: 'cinematic',
  },
  product: {
    product: 'the product',
    background: 'clean studio',
    style: 'minimal',
  },
  landscape: {
    environment: 'scenic vista',
    time: 'golden hour',
    atmosphere: 'epic',
  },
  poster: {
    subject: 'the subject',
    era: 'modern minimal',
    colors: 'vibrant',
  },
  abstract: {
    colors: 'vibrant colors',
    shapes: 'fluid',
    mood: 'balanced',
  },
  food: {
    dish: 'the dish',
    setting: 'elegant table',
    style: 'editorial',
  },
  architecture: {
    building: 'the building',
    angle: 'eye level',
    time: 'golden hour',
  },
  fashion: {
    subject: 'model',
    outfit: 'stylish attire',
    setting: 'studio backdrop',
  },
  animation: {
    subject: 'the scene',
    motion: 'subtle',
    camera: 'slow pan',
  },
}

export default function PromptsClient() {
  const [intentText, setIntentText] = useState('')
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [platform] = useState<PlatformId>('midjourney')
  const [outputPrompt, setOutputPrompt] = useState('')
  const [videoVisualPrompt, setVideoVisualPrompt] = useState('')
  const [feedCoverPrompt, setFeedCoverPrompt] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [qaStatus, setQaStatus] = useState<QAStatus | null>(null)

  // Detect if this is a TikTok promo
  const isTikTokPromo = route?.status === 'routed' &&
    route.extracted?.platformUse === 'tiktok' &&
    route.extracted?.intent === 'product_promo'

  async function onGenerate() {
    if (!intentText.trim()) return

    const r = routeIntent(intentText)
    setRoute(r)

    if (r.status !== 'routed') return

    // Handle content channel (async LLM call via API route)
    if (r.channel === 'content') {
      setIsLoading(true)
      setOutputPrompt('')
      setVideoVisualPrompt('')
      setFeedCoverPrompt('')
      setQaStatus(null)
      try {
        const response = await fetch('/api/content/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentText }),
        })
        const data = await response.json()
        // Capture QA status if present
        if (data.qa) {
          setQaStatus(data.qa)
        }
        if (!response.ok) {
          throw new Error(data.error || 'Content generation failed')
        }
        // In QA mode with error, show error message
        if (data.qa?.error) {
          setOutputPrompt(`Error: ${data.qa.error}`)
        } else {
          setOutputPrompt(data.article)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setOutputPrompt(`Error generating content: ${message}`)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Image channel (sync)
    const patternDef = PATTERNS[r.pattern]
    const defaults = INTERNAL_DEFAULTS[r.pattern] || {}

    // Check if TikTok promo
    const isTikTok = r.extracted?.platformUse === 'tiktok' &&
      r.extracted?.intent === 'product_promo'

    if (isTikTok) {
      // Generate both prompts for TikTok Promo Kit
      const videoExtracted = { ...r.extracted, platformUse: 'tiktok' }
      const coverExtracted = { ...r.extracted, platformUse: 'instagram' }

      setVideoVisualPrompt(generatePrompt(patternDef, platform, defaults, videoExtracted))
      setFeedCoverPrompt(generatePrompt(patternDef, platform, defaults, coverExtracted))
      setOutputPrompt('')
    } else {
      // Generate single prompt
      setOutputPrompt(generatePrompt(patternDef, platform, defaults, r.extracted))
      setVideoVisualPrompt('')
      setFeedCoverPrompt('')
    }
  }

  async function copyToClipboard(text: string, label: string) {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasOutput = outputPrompt || videoVisualPrompt || feedCoverPrompt

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">MeeMa</Link>
          <Link href="/my-prompts" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Saved
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">What are you trying to create?</h1>
          <p className="text-gray-600 mt-1">Describe it. MeeMa formats the prompt for Midjourney.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <textarea
            value={intentText}
            onChange={(e) => setIntentText(e.target.value)}
            placeholder='e.g. "A cyberpunk YouTube thumbnail" or "A vertical TikTok product promo"'
            className="w-full min-h-[88px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 bg-white"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onGenerate}
              disabled={!intentText.trim() || isLoading}
              className="inline-flex px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
            <span className="text-xs text-gray-500">No templates. One flow.</span>
          </div>
        </div>

        {/* QA Status Banner - only visible when QA_MODE=true */}
        {qaStatus?.qaMode && (
          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs font-mono">
            <div className="font-semibold text-yellow-800 mb-2">QA Status</div>
            <div className="space-y-1 text-yellow-700">
              <div>QA_MODE: {qaStatus.qaMode ? 'true' : 'false'}</div>
              <div>API Key Present: {qaStatus.keyPresent ? 'true' : 'false'}</div>
              <div>Anthropic Called: {qaStatus.anthropicCalled ? 'true' : 'false'}</div>
              <div>Fallback Used: {qaStatus.fallbackUsed ? 'true' : 'false'}</div>
              {qaStatus.error && (
                <div className="text-red-600">Error: {qaStatus.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Output Section */}
        {hasOutput && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            {isTikTokPromo ? (
              <>
                <p className="text-sm font-semibold text-gray-900 mb-4">TikTok Promo Kit</p>

                <div className="space-y-4">
                  {/* Video Visual Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">Video Visual Prompt</p>
                      <button
                        onClick={() => copyToClipboard(videoVisualPrompt, 'video')}
                        className="px-3 py-1 text-xs rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                      >
                        {copied === 'video' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={videoVisualPrompt}
                      className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* Feed Cover Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">Feed Cover Prompt</p>
                      <button
                        onClick={() => copyToClipboard(feedCoverPrompt, 'cover')}
                        className="px-3 py-1 text-xs rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                      >
                        {copied === 'cover' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={feedCoverPrompt}
                      className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Generated Prompt</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(outputPrompt, 'main')}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                    >
                      {copied === 'main' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={outputPrompt}
                  className={`w-full p-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 overflow-auto resize-none ${
                    isExpanded ? 'h-[400px]' : 'h-[120px]'
                  }`}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
