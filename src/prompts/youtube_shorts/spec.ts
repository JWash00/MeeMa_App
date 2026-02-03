/**
 * YouTube Shorts v0.1 - Specification
 *
 * Input/output schemas and validation helpers.
 */

import { z } from 'zod'

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const YouTubeShortsInputSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  durationSeconds: z.number().int().min(15).max(60).default(30),
  tone: z.enum(['direct', 'friendly', 'energetic', 'calm']).default('direct'),
  readingLevel: z.enum(['grade6', 'grade8', 'grade10', 'professional']).default('grade8'),
  style: z.enum(['fast-paced', 'measured', 'dramatic']).default('fast-paced'),
  audience: z.enum(['general', 'beginner', 'intermediate']).optional(),
})

export type YouTubeShortsInput = z.infer<typeof YouTubeShortsInputSchema>

// =============================================================================
// OUTPUT SCHEMA
// =============================================================================

export const ShotlistItemSchema = z.object({
  beat: z.number().int().min(1),
  visual: z.string().min(1),
  durationSeconds: z.number().int().min(1).optional(),
})

export const OnScreenTextItemSchema = z.object({
  atSeconds: z.number().min(0),
  text: z.string().min(1),
})

export const YouTubeShortsOutputSchema = z.object({
  title: z.string().max(70, 'Title must be 70 characters or less'),
  hook: z.string().max(180, 'Hook must be 180 characters or less'),
  script: z.string().min(1),
  shotlist: z.array(ShotlistItemSchema).min(1),
  onScreenText: z.array(OnScreenTextItemSchema).min(1),
  cta: z.string(),
})

export type YouTubeShortsOutput = z.infer<typeof YouTubeShortsOutputSchema>

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULTS = {
  durationSeconds: 30,
  tone: 'direct' as const,
  readingLevel: 'grade8' as const,
  style: 'fast-paced' as const,
} as const

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

const HASHTAG_PATTERN = /#\w+/g
const SOURCE_MARKER_PATTERNS = [
  /SOURCE:/gi,
  /\[SOURCE\]/gi,
  /<<SOURCE>>/gi,
  /<!--\s*SOURCE/gi,
]

export interface Issue {
  code: string
  message: string
  fieldPath: string
}

/**
 * Check if text contains hashtags. Throws if violation found.
 */
export function sanitizeNoHashtags(text: string, fieldPath: string): void {
  const matches = text.match(HASHTAG_PATTERN)
  if (matches && matches.length > 0) {
    throw new ValidationError({
      code: 'HASHTAG_VIOLATION',
      message: `Hashtags found: ${matches.join(', ')}`,
      fieldPath,
    })
  }
}

/**
 * Check if text contains SOURCE markers.
 */
export function containsSourceMarkers(text: string): boolean {
  return SOURCE_MARKER_PATTERNS.some(pattern => pattern.test(text))
}

/**
 * Check text for SOURCE markers. Returns issue if found.
 */
export function checkSourceMarkers(text: string, fieldPath: string): Issue | null {
  if (containsSourceMarkers(text)) {
    return {
      code: 'SOURCE_MARKER_VIOLATION',
      message: 'SOURCE marker found in output',
      fieldPath,
    }
  }
  return null
}

/**
 * Validation error with structured issue.
 */
export class ValidationError extends Error {
  public readonly issue: Issue

  constructor(issue: Issue) {
    super(`${issue.code}: ${issue.message} at ${issue.fieldPath}`)
    this.name = 'ValidationError'
    this.issue = issue
  }
}
