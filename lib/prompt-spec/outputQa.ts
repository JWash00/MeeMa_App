/**
 * Output QA Module for MPS v0.1
 * Validates LLM outputs: parse JSON, run quality checks, validate against schema
 */

import type { QaIssue, QaResult } from './outputQaTypes'
import type { RenderedPrompt } from './renderer'
import { validateAgainstSchema } from './schemaValidate'
import { runVisualPackChecks, isVisualPromptPack } from './visual/visualQa'
import type { RenderTarget } from './types'

/**
 * Parse JSON with strict requirements:
 * - No leading/trailing markdown fences (```json ... ```)
 * - No non-JSON text
 * - Must be valid JSON
 */
export function parseJsonStrict(
  raw: string
): { ok: true; value: unknown } | { ok: false; issue: QaIssue } {
  // Trim whitespace
  const trimmed = raw.trim()

  // Detect markdown fences
  if (trimmed.startsWith('```')) {
    return {
      ok: false,
      issue: {
        id: 'mps.json.valid',
        severity: 'error',
        message: 'Output contains markdown code fences. Must return pure JSON only.'
      }
    }
  }

  // Attempt JSON parse
  try {
    const parsed = JSON.parse(trimmed)
    return { ok: true, value: parsed }
  } catch (error) {
    return {
      ok: false,
      issue: {
        id: 'mps.json.valid',
        severity: 'error',
        message: `Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`
      }
    }
  }
}

/**
 * Run additional quality checks on parsed output and raw text
 */
export function runQualityChecks(
  rendered: RenderedPrompt,
  parsed: unknown,
  raw: string
): QaIssue[] {
  const issues: QaIssue[] = []

  // Check for markdown in raw output (warning only)
  if (raw.includes('```') || raw.match(/^#{1,6}\s/m)) {
    issues.push({
      id: 'mps.no.markdown',
      severity: 'warn',
      message: 'Output contains markdown formatting. Consider removing for consistency.'
    })
  }

  // Future: Add more quality checks here
  // - required fields present
  // - data type consistency
  // - value ranges
  // etc.

  return issues
}

/**
 * Main validation entry point
 * Validates LLM output against RenderedPrompt expectations
 */
export function validateModelOutput<T = unknown>(
  rendered: RenderedPrompt,
  raw: string
): QaResult<T> {
  const issues: QaIssue[] = []

  // Determine output format from rendered.outputs
  const outputFormat = rendered.outputs?.format || 'text'

  // For non-JSON formats, return raw (no schema validation)
  if (outputFormat !== 'json' && outputFormat !== 'structured') {
    return {
      ok: true,
      parsed: raw as T,
      raw,
      issues: [],
      repaired: false
    }
  }

  // JSON format validation
  const parseResult = parseJsonStrict(raw)
  if (!parseResult.ok) {
    return {
      ok: false,
      raw,
      issues: [parseResult.issue],
      repaired: false
    }
  }

  const parsed = parseResult.value

  // Quality checks (warnings)
  const qualityIssues = runQualityChecks(rendered, parsed, raw)
  issues.push(...qualityIssues)

  // Visual prompt pack checks (if detected)
  if (isVisualPromptPack(parsed)) {
    const renderTargets = (rendered.metadata as { renderTargets?: RenderTarget[] }).renderTargets
    const visualIssues = runVisualPackChecks(parsed, renderTargets)
    issues.push(...visualIssues)
  }

  // Schema validation (if schema present)
  if (rendered.outputs?.schema) {
    const schemaResult = validateAgainstSchema(rendered.outputs.schema, parsed)
    if (!schemaResult.ok) {
      return {
        ok: false,
        raw,
        issues: [...issues, ...schemaResult.issues],
        repaired: false,
        lastParsed: parsed
      }
    }
  }

  // Success
  return {
    ok: true,
    parsed: parsed as T,
    raw,
    issues, // May include warnings
    repaired: false
  }
}
