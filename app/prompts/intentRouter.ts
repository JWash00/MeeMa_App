import type { IntentPattern, RouteResult } from './types'
import { PATTERNS } from './patterns'

// Content detection keywords - triggers content channel
const CONTENT_SIGNALS = [
  'explain', 'break down', 'what is', 'what are', 'how does', 'how do',
  'why is', 'why are', 'article', 'guide', 'tutorial', 'essay',
  'write about', 'describe', 'overview', 'introduction', 'summary'
]

/**
 * Routes user intent to best-matching pattern.
 * CORE CONTRACT: Always returns 'routed' status. Never asks clarifying questions.
 */
export function routeIntent(text: string): RouteResult {
  const lower = text.toLowerCase()
  const extracted: Record<string, string> = {}

  // PRIORITY: Check for content channel first
  const isContentRequest = CONTENT_SIGNALS.some(signal => lower.includes(signal))

  if (isContentRequest) {
    return {
      status: 'routed',
      channel: 'content',
      contentType: 'article',
      confidence: 1,
      extracted,
    }
  }

  // Extract platform signals (used for aspect ratio mapping)
  if (lower.includes('youtube') || lower.includes('yt') || lower.includes('thumbnail')) {
    extracted.platformUse = 'youtube'
  } else if (lower.includes('tiktok') || lower.includes('reels') || lower.includes('shorts')) {
    extracted.platformUse = 'tiktok'
  } else if (lower.includes('instagram') || lower.includes('ig post') || lower.includes('insta post')) {
    extracted.platformUse = 'instagram'
  }

  // Extract intent signals
  if (lower.includes('promo') || lower.includes('product')) {
    extracted.intent = 'product_promo'
  }
  if (lower.includes('vertical') || lower.includes('9:16') || lower.includes('portrait')) {
    extracted.isVertical = 'true'
  }

  // Score each pattern by keyword matches
  const scores: { pattern: IntentPattern; score: number; matches: number }[] = []

  for (const [patternId, def] of Object.entries(PATTERNS)) {
    let matches = 0
    for (const keyword of def.keywords) {
      if (lower.includes(keyword)) {
        matches++
      }
    }
    const score = def.keywords.length > 0 ? matches / def.keywords.length : 0
    scores.push({ pattern: patternId as IntentPattern, score, matches })
  }

  // Sort by score descending, then by matches as tiebreaker
  scores.sort((a, b) => b.score - a.score || b.matches - a.matches)

  // ALWAYS route to best match (default to 'thumbnail' if no matches)
  const bestPattern = scores[0]?.pattern || 'thumbnail'

  return {
    status: 'routed',
    channel: 'image',
    pattern: bestPattern,
    confidence: 1,
    extracted,
  }
}
