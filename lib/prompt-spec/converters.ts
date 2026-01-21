import type { Snippet } from '@/lib/types'
import type { MeemaPrompt, PromptBlock, PromptInput } from './types'
import { qaEvaluate } from '@/lib/qa/qaRouter'
import { evaluateCompliance } from '@/lib/spec/specCompliance'

/**
 * Convert Snippet to MeemaPrompt
 */
export function snippetToMps(snippet: Snippet): MeemaPrompt {
  const qaResult = qaEvaluate(snippet)
  const complianceIssues = evaluateCompliance(snippet)

  const contentText = snippet.template || snippet.code || ''
  const blocks = parseBlocksFromText(contentText)

  // Map trust level from QA
  const trustLevel =
    qaResult.level === 'verified' && qaResult.score >= 90 ? 'gold' :
    qaResult.level === 'verified' ? 'verified' :
    'basic'

  return {
    schemaVersion: 'mps.v0.1',
    id: snippet.id,
    title: snippet.title,
    description: snippet.description,
    version: snippet.version || '1.0',
    type: snippet.type || 'prompt',
    category: snippet.category || 'Uncategorized',
    content: {
      text: contentText,
      blocks,
      language: snippet.language || 'prompt'
    },
    inputs: snippet.inputs_schema ? convertInputsSchema(snippet.inputs_schema) : undefined,
    outputs: snippet.outputsSchema ? {
      format: 'structured',
      schema: snippet.outputsSchema
    } : { format: 'text' },
    quality: {
      trustLevel,
      status: snippet.scope === 'official' ? 'production' : 'published',
      score: qaResult.score,
      checks: {
        hasRequiredBlocks: qaResult.checks.hasObjective && qaResult.checks.hasOutputFormat,
        hasInputsSchema: !!snippet.inputs_schema,
        hasOutputFormat: qaResult.checks.hasOutputFormat,
        hasQualityChecks: qaResult.checks.hasQc,
        placeholderAlignment: true // Computed from QA
      },
      issues: qaResult.issues.concat(complianceIssues)
    },
    execution: {
      provider: snippet.provider as any || undefined
    },
    agentReadiness: snippet.isAgentReady ? {
      isReady: snippet.isAgentReady,
      automationPlatforms: ['n8n'],
      requiredCapabilities: []
    } : undefined,
    tags: snippet.tags || [],
    author: snippet.owner_id || undefined,
    createdAt: snippet.created_at || new Date().toISOString(),
    updatedAt: snippet.updated_at || new Date().toISOString()
  }
}

/**
 * Convert MeemaPrompt to Snippet (partial)
 */
export function mpsToSnippet(mps: MeemaPrompt): Partial<Snippet> {
  return {
    id: mps.id,
    title: mps.title,
    description: mps.description,
    tags: mps.tags,
    language: mps.content.language || 'prompt',
    code: mps.type === 'prompt' ? mps.content.text : '',
    template: mps.type === 'workflow' ? mps.content.text : undefined,
    provider: mps.execution.provider || null,
    scope: mps.quality.status === 'production' ? 'official' : 'public',
    type: mps.type,
    version: mps.version,
    category: mps.category,
    inputs_schema: mps.inputs ? convertInputsToSchema(mps.inputs) : undefined,
    isAgentReady: mps.agentReadiness?.isReady,
    outputsSchema: mps.outputs?.schema
  }
}

/**
 * Parse structured blocks from text using regex
 */
function parseBlocksFromText(text: string): PromptBlock[] {
  const blockTypes = [
    'TASK', 'OBJECTIVE', 'INPUTS', 'CONSTRAINTS',
    'OUTPUT FORMAT', 'QUALITY CHECKS', 'QC',
    'ROLE', 'UNCERTAINTY POLICY'
  ]

  const blocks: PromptBlock[] = []

  for (const type of blockTypes) {
    const pattern = new RegExp(
      `##?\\s*${type}\\s*:?\\s*([\\s\\S]*?)(?=\\n##?\\s*[A-Z]|$)`,
      'i'
    )
    const match = text.match(pattern)

    if (match) {
      const normalizedType = type.replace(/\s+/g, '_').toUpperCase()
      blocks.push({
        type: normalizedType as any,
        content: match[1].trim(),
        required: ['TASK', 'OUTPUT_FORMAT', 'QUALITY_CHECKS'].includes(type)
      })
    }
  }

  return blocks
}

/**
 * Convert inputs_schema to PromptInput[]
 */
function convertInputsSchema(schema: Record<string, any>): PromptInput[] {
  return Object.entries(schema).map(([key, config]) => ({
    key,
    label: config.label,
    type: config.type,
    placeholder: config.placeholder,
    default: config.default,
    options: config.options,
    required: true
  }))
}

/**
 * Convert PromptInput[] to inputs_schema
 */
function convertInputsToSchema(inputs: PromptInput[]): Record<string, any> {
  const schema: Record<string, any> = {}

  for (const input of inputs) {
    schema[input.key] = {
      label: input.label,
      type: input.type,
      placeholder: input.placeholder,
      default: input.default,
      options: input.options
    }
  }

  return schema
}
