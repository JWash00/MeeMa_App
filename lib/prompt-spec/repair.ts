/**
 * Repair System for MPS v0.1
 * Builds repair messages and manages retry logic for invalid outputs
 */

import type { QaIssue } from './outputQaTypes'
import type { RenderedPrompt } from './renderer'
import type { QaResult } from './outputQaTypes'

export interface RepairMessageArgs {
  originalMessages: Array<{ role: 'system' | 'user'; content: string }>
  rawOutput: string
  outputSchema: unknown
  issues: QaIssue[]
}

/**
 * Build deterministic repair messages
 * Includes: original context + failed output + schema + issues
 */
export function buildRepairMessages(
  args: RepairMessageArgs
): Array<{ role: 'system' | 'user'; content: string }> {
  const { originalMessages, rawOutput, outputSchema, issues } = args

  // System message for repair
  const repairSystemMessage = {
    role: 'system' as const,
    content: `You are a JSON repair engine. Your task is to fix the previous output to match the required schema EXACTLY.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no code fences, no commentary
2. Match the schema exactly - all required fields must be present
3. Preserve the original intent and data where possible
4. Fix only what's broken - don't change correct parts

The output will be validated programmatically. Any deviation from pure JSON or schema mismatch will fail.`
  }

  // Limit issues to 6 to avoid token bloat
  const limitedIssues = issues.slice(0, 6)
  const issuesSummary = limitedIssues.map(issue =>
    `- [${issue.id}] ${issue.message}${issue.path ? ` (at ${issue.path})` : ''}`
  ).join('\n')

  // User message with repair instructions
  const repairUserMessage = {
    role: 'user' as const,
    content: `The previous output failed validation with these issues:

${issuesSummary}

FAILED OUTPUT:
${rawOutput}

REQUIRED SCHEMA:
${JSON.stringify(outputSchema, null, 2)}

Please output ONLY the corrected JSON that matches this schema exactly. No explanations, no markdown - just pure JSON.`
  }

  // Return: original context + repair instructions
  return [
    ...originalMessages,
    repairSystemMessage,
    repairUserMessage
  ]
}

/**
 * Determine if repair should be attempted
 * Conditions:
 * - Output format is json/structured
 * - QA failed
 * - Fallback is enabled (onSchemaFail = 'repair_json')
 * - Retries remaining
 */
export function shouldAttemptRepair(
  rendered: RenderedPrompt,
  qa: QaResult,
  retriesUsed: number
): boolean {
  // Must be JSON format
  const outputFormat = rendered.outputs?.format
  if (outputFormat !== 'json' && outputFormat !== 'structured') {
    return false
  }

  // Must have failed
  if (qa.ok) {
    return false
  }

  // Must have fallback enabled
  const fallback = rendered.quality?.fallback
  if (fallback?.onSchemaFail !== 'repair_json') {
    return false
  }

  // Must have retries remaining
  const maxRetries = fallback.maxRetries ?? 1 // default 1
  if (retriesUsed >= maxRetries) {
    return false
  }

  return true
}
