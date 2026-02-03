/**
 * YouTube Shorts v0.1 - Generator
 *
 * Single LLM call with strict JSON parsing and validation.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { CreateRequest } from '@/src/contracts/create'
import {
  YouTubeShortsInputSchema,
  YouTubeShortsOutputSchema,
  type YouTubeShortsInput,
  type YouTubeShortsOutput,
  type Issue,
  DEFAULTS,
} from './spec'
import { YOUTUBE_SHORTS_SYSTEM_PROMPT } from './system'
import { buildUserPrompt } from './templates'

// =============================================================================
// TYPES
// =============================================================================

export interface GeneratorDeps {
  qaMode: boolean
  model?: string
}

export interface StageMetadata {
  stage: string
  model: string
  startedAt: string
  finishedAt: string
  durationMs: number
}

export interface GeneratedResult {
  success: true
  output: YouTubeShortsOutput
  metadata: StageMetadata
}

export interface GeneratedError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  metadata: StageMetadata
}

export type GenerateResult = GeneratedResult | GeneratedError

// =============================================================================
// IMPLEMENTATION
// =============================================================================

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

/**
 * Generate YouTube Shorts script from CreateRequest.
 *
 * - Makes exactly 1 LLM call
 * - Parses JSON strictly
 * - Validates with zod schema
 * - Returns structured error on failure (no auto-fix)
 */
export async function generateYouTubeShorts(
  req: CreateRequest,
  deps: GeneratorDeps
): Promise<GenerateResult> {
  const model = deps.model ?? DEFAULT_MODEL
  const startedAt = new Date().toISOString()
  const startTime = Date.now()

  // Build metadata helper
  const buildMetadata = (): StageMetadata => ({
    stage: 'generate',
    model,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  })

  try {
    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'ANTHROPIC_API_KEY environment variable is not set',
        },
        metadata: buildMetadata(),
      }
    }

    // Parse input from CreateRequest
    const input = parseInputFromRequest(req)
    const inputValidation = YouTubeShortsInputSchema.safeParse(input)

    if (!inputValidation.success) {
      return {
        success: false,
        error: {
          code: 'INPUT_VALIDATION_FAILED',
          message: 'Invalid input parameters',
          details: inputValidation.error.issues,
        },
        metadata: buildMetadata(),
      }
    }

    const validatedInput = inputValidation.data

    // Build prompt
    const userPrompt = buildUserPrompt(validatedInput)

    // Make LLM call
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature: 0.3,
      system: YOUTUBE_SHORTS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Extract text response
    const block = message.content[0]
    if (block.type !== 'text') {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_RESPONSE_TYPE',
          message: `Expected text response, got: ${block.type}`,
        },
        metadata: buildMetadata(),
      }
    }

    const rawText = block.text.trim()

    // Parse JSON
    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'JSON_PARSE_FAILED',
          message: 'LLM output is not valid JSON',
          details: {
            rawText: rawText.slice(0, 500),
            parseError: e instanceof Error ? e.message : String(e),
          },
        },
        metadata: buildMetadata(),
      }
    }

    // Validate with zod schema
    const outputValidation = YouTubeShortsOutputSchema.safeParse(parsed)

    if (!outputValidation.success) {
      return {
        success: false,
        error: {
          code: 'OUTPUT_VALIDATION_FAILED',
          message: 'LLM output does not match expected schema',
          details: outputValidation.error.issues,
        },
        metadata: buildMetadata(),
      }
    }

    return {
      success: true,
      output: outputValidation.data,
      metadata: buildMetadata(),
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error during generation',
        details: error,
      },
      metadata: buildMetadata(),
    }
  }
}

/**
 * Parse YouTubeShortsInput from CreateRequest.
 */
function parseInputFromRequest(req: CreateRequest): Partial<YouTubeShortsInput> {
  const constraints = req.constraints as Record<string, unknown> | undefined

  return {
    topic: req.userPrompt,
    durationSeconds: parseDuration(constraints?.length),
    tone: parseTone(constraints?.tone),
    readingLevel: DEFAULTS.readingLevel,
    style: DEFAULTS.style,
    audience: parseAudience(constraints?.audience),
  }
}

function parseDuration(length: unknown): number {
  if (typeof length === 'string') {
    // Handle TikTok-style lengths
    if (length === '15s') return 15
    if (length === '30s') return 30
    if (length === '45s') return 45
    // Handle content-style lengths
    if (length === 'short') return 20
    if (length === 'medium') return 30
    if (length === 'long') return 45
  }
  if (typeof length === 'number') return length
  return DEFAULTS.durationSeconds
}

function parseTone(tone: unknown): YouTubeShortsInput['tone'] {
  if (tone === 'friendly') return 'friendly'
  if (tone === 'punchy' || tone === 'energetic') return 'energetic'
  if (tone === 'neutral' || tone === 'calm') return 'calm'
  return DEFAULTS.tone
}

function parseAudience(audience: unknown): YouTubeShortsInput['audience'] | undefined {
  if (audience === 'general') return 'general'
  if (audience === 'beginner') return 'beginner'
  if (audience === 'intermediate') return 'intermediate'
  return undefined
}
