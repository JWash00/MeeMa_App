/**
 * YouTube Shorts v0.1 - Main Entry Point
 *
 * Orchestrates: generate -> validate -> qa
 */

import type { CreateRequest, CreateResponse, Domain } from '@/src/contracts/create'
import { generateYouTubeShorts, type GeneratorDeps } from './generate'
import { qaYouTubeShorts, type QAResult } from './qa'
import type { YouTubeShortsOutput, Issue } from './spec'
import { DEFAULTS, containsSourceMarkers } from './spec'

// =============================================================================
// TYPES
// =============================================================================

export interface YouTubeShortsCreateResponse extends Omit<CreateResponse, 'output'> {
  output: string // Serialized JSON output
  structuredOutput?: YouTubeShortsOutput
  qaResult?: QAResult
  issues?: Issue[]
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

/**
 * Create YouTube Shorts script from CreateRequest.
 *
 * Flow:
 * 1. Generate via LLM
 * 2. Validate schema
 * 3. Run QA checks
 * 4. Return CreateResponse (compatible with shared contract)
 *
 * If QA fails: status includes issues, no auto-fix in v0.1
 * If pass: status="ok", output contains clean JSON
 */
export async function createYouTubeShorts(
  req: CreateRequest,
  deps: GeneratorDeps
): Promise<CreateResponse> {
  const domain: Domain = 'social_video'

  // Stage 1: Generate
  const generateResult = await generateYouTubeShorts(req, deps)

  if (!generateResult.success) {
    return {
      success: false,
      domain,
      output: '',
      qa: {
        qaMode: deps.qaMode,
        keyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicCalled: false,
        fallbackUsed: false,
        error: `${generateResult.error.code}: ${generateResult.error.message}`,
      },
    }
  }

  // Stage 2: Run QA checks
  const targetDuration = parseDurationFromRequest(req)
  const qaResult = qaYouTubeShorts(generateResult.output, targetDuration)

  // Stage 3: Sanitize output (ensure no SOURCE markers)
  const sanitizedOutput = sanitizeOutput(generateResult.output)

  // Stage 4: Build response
  if (!qaResult.pass) {
    // QA failed - return with issues (no auto-fix in v0.1)
    return {
      success: false,
      domain,
      output: JSON.stringify(sanitizedOutput, null, 2),
      qa: {
        qaMode: deps.qaMode,
        keyPresent: true,
        anthropicCalled: true,
        fallbackUsed: false,
        error: `QA failed: ${qaResult.issues.map(i => i.code).join(', ')}`,
      },
    }
  }

  // QA passed
  return {
    success: true,
    domain,
    output: JSON.stringify(sanitizedOutput, null, 2),
    qa: {
      qaMode: deps.qaMode,
      keyPresent: true,
      anthropicCalled: true,
      fallbackUsed: false,
    },
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function parseDurationFromRequest(req: CreateRequest): number {
  const constraints = req.constraints as Record<string, unknown> | undefined
  const length = constraints?.length

  if (typeof length === 'string') {
    if (length === '15s') return 15
    if (length === '30s') return 30
    if (length === '45s') return 45
    if (length === 'short') return 20
    if (length === 'medium') return 30
    if (length === 'long') return 45
  }
  if (typeof length === 'number') return length

  return DEFAULTS.durationSeconds
}

/**
 * Sanitize output to ensure no SOURCE markers appear anywhere.
 * This is a final safety net - LLM should not produce these.
 */
function sanitizeOutput(output: YouTubeShortsOutput): YouTubeShortsOutput {
  return {
    title: stripSourceMarkers(output.title),
    hook: stripSourceMarkers(output.hook),
    script: stripSourceMarkers(output.script),
    shotlist: output.shotlist.map(item => ({
      ...item,
      visual: stripSourceMarkers(item.visual),
    })),
    onScreenText: output.onScreenText.map(item => ({
      ...item,
      text: stripSourceMarkers(item.text),
    })),
    cta: stripSourceMarkers(output.cta),
  }
}

function stripSourceMarkers(text: string): string {
  return text
    .replace(/SOURCE:/gi, '')
    .replace(/\[SOURCE\]/gi, '')
    .replace(/<<SOURCE>>/gi, '')
    .replace(/<!--\s*SOURCE[^>]*-->/gi, '')
    .trim()
}

// =============================================================================
// EXPORTS
// =============================================================================

export { generateYouTubeShorts } from './generate'
export { qaYouTubeShorts } from './qa'
export type { YouTubeShortsInput, YouTubeShortsOutput, Issue } from './spec'
export type { QAResult } from './qa'
export type { GeneratorDeps, GenerateResult } from './generate'
