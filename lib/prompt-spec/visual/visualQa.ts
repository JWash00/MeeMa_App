/**
 * Visual Prompt Pack QA for MPS v0.1
 * Validates visual prompt packs against schema and quality heuristics
 */

import type { QaIssue } from '../outputQaTypes'
import type { RenderTarget } from '../types'
import type { VisualPromptPack } from './promptPackSchema'
import { visualPromptPackSchema, PROVIDER_PARAM_BOUNDS } from './promptPackSchema'
import { validateAgainstSchema } from '../schemaValidate'

// Visual-specific check IDs
export const VISUAL_CHECKS = {
  PACK_VALID: 'mps.visual.pack.valid',
  HAS_SUBJECT: 'mps.visual.has.subject',
  HAS_STYLE: 'mps.visual.has.style',
  PARAMS_VALID: 'mps.visual.params.valid',
  NO_MARKDOWN: 'mps.no.markdown'
} as const

// Subject detection patterns
const SUBJECT_PATTERNS = [
  /\b(a|an|the)\s+\w+/i,
  /\b(person|woman|man|child|people|group)\b/i,
  /\b(object|product|item|device|gadget)\b/i,
  /\b(logo|brand|icon|symbol|emblem)\b/i,
  /\b(scene|landscape|environment|setting|background)\b/i,
  /\b(portrait|headshot|photo of|image of|picture of)\b/i,
  /\b(car|phone|watch|bottle|shoe|bag)\b/i
]

// Style keywords for quality check
const STYLE_KEYWORDS = [
  'photorealistic', 'cinematic', 'studio', 'natural', 'dramatic',
  'soft', 'high contrast', 'minimalist', 'professional', 'editorial',
  'commercial', 'artistic', 'modern', 'vintage', 'retro', 'sleek',
  'elegant', 'bold', 'clean', 'crisp', 'vibrant', 'muted', 'moody',
  'bright', 'dark', 'warm', 'cool', 'golden hour', 'blue hour'
]

/**
 * Check if text contains a clear subject
 */
function hasSubjectIndicators(text: string): boolean {
  return SUBJECT_PATTERNS.some(pattern => pattern.test(text))
}

/**
 * Check if text contains style indicators
 */
function hasStyleIndicators(text: string): boolean {
  const lower = text.toLowerCase()
  return STYLE_KEYWORDS.some(keyword => lower.includes(keyword))
}

/**
 * Check if text contains markdown formatting
 */
function containsMarkdown(text: string): boolean {
  return text.includes('```') || /^#{1,6}\s/m.test(text)
}

/**
 * Validate provider-specific parameters against bounds
 */
function validateProviderParams(
  provider: RenderTarget,
  params: Record<string, unknown>
): QaIssue[] {
  const issues: QaIssue[] = []
  const bounds = PROVIDER_PARAM_BOUNDS[provider]

  if (!bounds) return issues

  for (const [param, value] of Object.entries(params)) {
    if (typeof value !== 'number') continue
    const paramBounds = bounds[param]
    if (!paramBounds) continue

    const { min, max } = paramBounds
    if (value < min || value > max) {
      issues.push({
        id: VISUAL_CHECKS.PARAMS_VALID,
        severity: 'warn',
        message: `[${provider}] ${param}=${value} outside recommended range [${min}-${max}]`,
        path: `providers.${provider}.params.${param}`
      })
    }
  }

  return issues
}

/**
 * Main validation function for visual prompt packs
 * Returns array of QaIssues (error/warn)
 */
export function runVisualPackChecks(
  parsed: unknown,
  expectedTargets?: RenderTarget[]
): QaIssue[] {
  const issues: QaIssue[] = []

  // 1. Schema validation
  const schemaResult = validateAgainstSchema(visualPromptPackSchema, parsed)
  if (!schemaResult.ok) {
    issues.push({
      id: VISUAL_CHECKS.PACK_VALID,
      severity: 'error',
      message: 'Visual prompt pack does not match required schema'
    })
    // Return early on schema failure - can't validate further
    return issues
  }

  const pack = parsed as VisualPromptPack

  // 2. Check each provider output
  for (const [provider, output] of Object.entries(pack.providers)) {
    if (!output) continue

    // Subject check
    if (!hasSubjectIndicators(output.positive)) {
      issues.push({
        id: VISUAL_CHECKS.HAS_SUBJECT,
        severity: 'warn',
        message: `[${provider}] Positive prompt may be missing clear subject`,
        path: `providers.${provider}.positive`
      })
    }

    // Style check
    if (!hasStyleIndicators(output.positive)) {
      issues.push({
        id: VISUAL_CHECKS.HAS_STYLE,
        severity: 'warn',
        message: `[${provider}] Consider adding style keywords for consistency`,
        path: `providers.${provider}.positive`
      })
    }

    // Markdown check in positive prompt
    if (containsMarkdown(output.positive)) {
      issues.push({
        id: VISUAL_CHECKS.NO_MARKDOWN,
        severity: 'error',
        message: `[${provider}] Positive prompt contains markdown formatting`,
        path: `providers.${provider}.positive`
      })
    }

    // Markdown check in negative prompt
    if (output.negative && containsMarkdown(output.negative)) {
      issues.push({
        id: VISUAL_CHECKS.NO_MARKDOWN,
        severity: 'error',
        message: `[${provider}] Negative prompt contains markdown formatting`,
        path: `providers.${provider}.negative`
      })
    }

    // Params validation
    const paramIssues = validateProviderParams(
      provider as RenderTarget,
      output.params
    )
    issues.push(...paramIssues)
  }

  // 3. Check expected targets are present
  if (expectedTargets && expectedTargets.length > 0) {
    for (const target of expectedTargets) {
      if (!pack.providers[target]) {
        issues.push({
          id: VISUAL_CHECKS.PACK_VALID,
          severity: 'warn',
          message: `Expected provider "${target}" not present in output`
        })
      }
    }
  }

  return issues
}

/**
 * Check if an object looks like a visual prompt pack
 */
export function isVisualPromptPack(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return 'intent' in o && 'providers' in o && typeof o.providers === 'object'
}
