import type { RenderedPrompt } from './renderer'
import type { QaResult } from './outputQaTypes'

export interface N8nPayload {
  /**
   * Messages array for LLM node
   */
  messages: Array<{
    role: 'system' | 'user'
    content: string
  }>

  /**
   * Execution configuration
   */
  executionConfig: {
    provider?: string
    model?: string
    temperature?: number
    maxTokens?: number
  }

  /**
   * Metadata for tracking
   */
  metadata: {
    promptId: string
    promptVersion: string
    renderedAt: string
  }
}

/**
 * Convert RenderedPrompt to lightweight n8n execution payload
 * Strips out inputValidation and inputKeys (not needed for n8n execution)
 */
export function toN8nPayload(rendered: RenderedPrompt): N8nPayload {
  return {
    messages: rendered.messages,
    executionConfig: rendered.executionConfig,
    metadata: {
      promptId: rendered.metadata.promptId,
      promptVersion: rendered.metadata.promptVersion,
      renderedAt: rendered.metadata.renderedAt
    }
  }
}

/**
 * Convert RenderedPrompt + QaResult to n8n routing contract
 * This is what downstream n8n nodes will use for conditional logic
 */
export function toN8nRunContract(args: {
  rendered: RenderedPrompt
  qa: QaResult
}): {
  promptId: string
  version: string
  resolvedInputs: Record<string, unknown>
  outputOk: boolean
  repaired: boolean
  issues: Array<{
    id: string
    severity: string
    message: string
    path?: string
  }>
  output?: unknown
  rawOutput: string
} {
  const { rendered, qa } = args

  return {
    promptId: rendered.metadata.promptId,
    version: rendered.metadata.promptVersion,
    resolvedInputs: rendered.inputValidation.resolvedInputs,
    outputOk: qa.ok,
    repaired: qa.repaired,
    issues: qa.issues,
    output: qa.ok ? qa.parsed : undefined,
    rawOutput: qa.raw
  }
}
