/**
 * Orchestrator for MPS v0.1
 * Main pipeline: render → call LLM → validate → repair (if needed)
 */

import type { RenderedPrompt } from './renderer'
import type { QaResult } from './outputQaTypes'
import { validateModelOutput } from './outputQa'
import { shouldAttemptRepair, buildRepairMessages } from './repair'

/**
 * LLM caller interface for n8n nodes
 */
export type LlmCaller = (args: {
  messages: Array<{ role: 'system' | 'user'; content: string }>
  execution: {
    provider?: string
    model?: string
    temperature?: number
    maxTokens?: number
  }
}) => Promise<{ rawText: string }>

/**
 * Main orchestrator for prompt execution with QA + repair
 *
 * Flow:
 * 1. Call LLM with rendered messages
 * 2. Validate output
 * 3. If invalid and repair enabled, attempt repair (max retries)
 * 4. Return final QaResult
 */
export async function runPromptWithQa<T = unknown>(args: {
  rendered: RenderedPrompt
  callLlm: LlmCaller
}): Promise<QaResult<T>> {
  const { rendered, callLlm } = args
  let retriesUsed = 0

  // Initial LLM call
  const initialResponse = await callLlm({
    messages: rendered.messages,
    execution: rendered.executionConfig
  })

  // Validate initial output
  let qa = validateModelOutput<T>(rendered, initialResponse.rawText)

  // Repair loop (if needed)
  while (!qa.ok && shouldAttemptRepair(rendered, qa, retriesUsed)) {
    retriesUsed++

    // Build repair messages
    const repairMessages = buildRepairMessages({
      originalMessages: rendered.messages,
      rawOutput: qa.raw,
      outputSchema: rendered.outputs?.schema || {},
      issues: qa.issues
    })

    // Call LLM with repair messages and FORCED low temperature
    const repairResponse = await callLlm({
      messages: repairMessages,
      execution: {
        ...rendered.executionConfig,
        temperature: 0 // Force deterministic repair
      }
    })

    // Validate repaired output
    qa = validateModelOutput<T>(rendered, repairResponse.rawText)

    // Mark as repaired
    if (qa.ok) {
      return { ...qa, repaired: true }
    } else {
      qa = { ...qa, repaired: true }
    }
  }

  // Return final result (may be ok or failed)
  return qa
}
