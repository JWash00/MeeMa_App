/**
 * YouTube Shorts v0.1 - Prompt Templates
 *
 * Deterministic prompt construction from YouTubeShortsInput.
 */

import type { YouTubeShortsInput } from './spec'
import { DEFAULTS } from './spec'

/**
 * Build the user prompt from input parameters.
 * Only includes fields that are explicitly provided.
 */
export function buildUserPrompt(input: YouTubeShortsInput): string {
  const parts: string[] = []

  // Topic is always required
  parts.push(`Create a YouTube Shorts script about: ${input.topic}`)

  // Platform constraints (always included)
  parts.push('')
  parts.push('PLATFORM: YouTube Shorts (vertical 9:16)')

  // Duration
  const duration = input.durationSeconds ?? DEFAULTS.durationSeconds
  parts.push(`TARGET DURATION: ${duration} seconds`)

  // Tone (only if different from default or explicitly set)
  const tone = input.tone ?? DEFAULTS.tone
  parts.push(`TONE: ${formatTone(tone)}`)

  // Reading level
  const readingLevel = input.readingLevel ?? DEFAULTS.readingLevel
  parts.push(`READING LEVEL: ${formatReadingLevel(readingLevel)}`)

  // Style
  const style = input.style ?? DEFAULTS.style
  parts.push(`STYLE: ${formatStyle(style)}`)

  // Audience (only if provided)
  if (input.audience) {
    parts.push(`AUDIENCE: ${formatAudience(input.audience)}`)
  }

  // Reminder of output format
  parts.push('')
  parts.push('Respond with ONLY the JSON object. No other text.')

  return parts.join('\n')
}

function formatTone(tone: YouTubeShortsInput['tone']): string {
  switch (tone) {
    case 'direct':
      return 'Direct and informative'
    case 'friendly':
      return 'Friendly and approachable'
    case 'energetic':
      return 'High-energy and enthusiastic'
    case 'calm':
      return 'Calm and measured'
    default:
      return 'Direct and informative'
  }
}

function formatReadingLevel(level: YouTubeShortsInput['readingLevel']): string {
  switch (level) {
    case 'grade6':
      return '6th grade (simple vocabulary, short sentences)'
    case 'grade8':
      return '8th grade (clear language, accessible to most)'
    case 'grade10':
      return '10th grade (moderate complexity)'
    case 'professional':
      return 'Professional (industry terminology acceptable)'
    default:
      return '8th grade (clear language, accessible to most)'
  }
}

function formatStyle(style: YouTubeShortsInput['style']): string {
  switch (style) {
    case 'fast-paced':
      return 'Fast-paced with quick cuts'
    case 'measured':
      return 'Measured and deliberate pacing'
    case 'dramatic':
      return 'Dramatic with tension-building pauses'
    default:
      return 'Fast-paced with quick cuts'
  }
}

function formatAudience(audience: YouTubeShortsInput['audience']): string {
  switch (audience) {
    case 'general':
      return 'General audience (no prior knowledge assumed)'
    case 'beginner':
      return 'Beginners (explain foundational concepts)'
    case 'intermediate':
      return 'Intermediate (some background knowledge assumed)'
    default:
      return 'General audience'
  }
}
