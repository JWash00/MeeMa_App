import type { MeemaPrompt, RenderTarget } from './types'
import { validateInputs, type InputValidationResult } from './inputValidation'

export interface RenderOptions {
  /**
   * Include quality checks in output
   * @default true
   */
  includeQualityChecks?: boolean

  /**
   * Include output schema in output
   * @default true
   */
  includeOutputSchema?: boolean
}

export interface RenderedPrompt {
  /**
   * Messages array ready for LLM API
   */
  messages: Array<{
    role: 'system' | 'user'
    content: string
  }>

  /**
   * Execution configuration from prompt
   */
  executionConfig: {
    provider?: string
    model?: string
    temperature?: number
    maxTokens?: number
  }

  /**
   * Metadata about the render
   */
  metadata: {
    promptId: string
    promptVersion: string
    renderedAt: string // ISO 8601
    inputKeys: string[]
    renderTargets?: RenderTarget[] // For visual prompts
  }

  /**
   * Input validation result
   */
  inputValidation: InputValidationResult

  /**
   * Output expectations for validation
   */
  outputs?: {
    format: 'text' | 'json' | 'markdown' | 'html' | 'structured'
    schema?: Record<string, any>
  }

  /**
   * Quality fallback configuration
   */
  quality: {
    fallback?: {
      onSchemaFail?: 'none' | 'repair_json'
      maxRetries?: number
    }
  }
}

/**
 * Render MPS prompt with validated inputs into executable messages
 * Validates inputs, replaces placeholders, injects reserved keys, assembles messages
 * Returns RenderedPrompt with validation results and messages array
 */
export function renderPrompt(
  prompt: MeemaPrompt,
  userInputs: Record<string, unknown>,
  options: RenderOptions = {}
): RenderedPrompt {
  const opts = {
    includeQualityChecks: true,
    includeOutputSchema: true,
    ...options
  }

  // 1. Validate inputs
  const inputValidation = validateInputs(prompt, userInputs)

  // If validation fails, return early with empty messages
  if (!inputValidation.valid) {
    return {
      messages: [],
      executionConfig: extractExecutionConfig(prompt),
      metadata: {
        promptId: prompt.id,
        promptVersion: prompt.version,
        renderedAt: new Date().toISOString(),
        inputKeys: [],
        renderTargets: prompt.renderTargets
      },
      inputValidation,
      outputs: prompt.outputs,
      quality: {
        fallback: prompt.quality.fallback
      }
    }
  }

  // 2. Prepare replacement context
  const replacementContext: Record<string, unknown> = {
    ...inputValidation.resolvedInputs
  }

  // Add reserved keys
  if (opts.includeOutputSchema && prompt.outputs?.schema) {
    replacementContext.output_schema = JSON.stringify(prompt.outputs.schema, null, 2)
  }

  if (opts.includeQualityChecks) {
    const qcBlock = prompt.content.blocks.find(
      b => b.type === 'QUALITY_CHECKS' || b.type === 'QC'
    )
    if (qcBlock) {
      replacementContext.quality_checks = qcBlock.content
    }
  }

  // 3. Replace placeholders in template
  const renderedText = replacePlaceholders(prompt.content.text, replacementContext)

  // 4. Assemble messages
  const messages = assembleMessages(prompt, renderedText)

  // 5. Return rendered prompt
  return {
    messages,
    executionConfig: extractExecutionConfig(prompt),
    metadata: {
      promptId: prompt.id,
      promptVersion: prompt.version,
      renderedAt: new Date().toISOString(),
      inputKeys: Object.keys(inputValidation.resolvedInputs),
      renderTargets: prompt.renderTargets
    },
    inputValidation,
    outputs: prompt.outputs,
    quality: {
      fallback: prompt.quality.fallback
    }
  }
}

/**
 * Replace {{placeholders}} with values from context
 */
function replacePlaceholders(
  text: string,
  context: Record<string, unknown>
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim()
    const value = context[trimmedKey]

    if (value === undefined || value === null) {
      return match // Leave placeholder unchanged if no value
    }

    return String(value)
  })
}

/**
 * Assemble messages array (system + user)
 */
function assembleMessages(
  prompt: MeemaPrompt,
  renderedText: string
): Array<{ role: 'system' | 'user'; content: string }> {
  const messages: Array<{ role: 'system' | 'user'; content: string }> = []

  // Add system message if defined
  if (prompt.execution.systemPrompt) {
    messages.push({
      role: 'system',
      content: prompt.execution.systemPrompt
    })
  }

  // Add user message with rendered prompt
  messages.push({
    role: 'user',
    content: renderedText
  })

  return messages
}

/**
 * Extract execution config from prompt
 */
function extractExecutionConfig(prompt: MeemaPrompt) {
  return {
    provider: prompt.execution.provider,
    model: prompt.execution.model,
    temperature: prompt.execution.temperature,
    maxTokens: prompt.execution.maxTokens
  }
}
