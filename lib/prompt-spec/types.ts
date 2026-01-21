import { Capability } from '@/lib/sidebar/types'

/**
 * Meema Prompt Spec (MPS) v0.1
 * Framework-agnostic prompt specification for production use
 */

export interface MeemaPrompt {
  // Schema metadata
  schemaVersion: 'mps.v0.1'

  // Core identification
  id: string
  title: string
  description: string
  version: string // MAJOR.MINOR (e.g., "1.0")

  // Classification
  type: 'prompt' | 'workflow'
  category: string
  capability?: Capability

  // Content structure
  content: PromptContent

  // Inputs/Outputs
  inputs?: PromptInput[]
  outputs?: PromptOutput

  // Quality & Trust
  quality: PromptQuality

  // Execution configuration
  execution: PromptExecution

  // Agent readiness
  agentReadiness?: AgentReadiness

  // Visual prompt pack configuration (optional)
  renderTargets?: RenderTarget[]
  promptPartsSpec?: PromptPartsSpec
  providerParamsSpec?: Record<string, unknown>

  // Metadata
  tags: string[]
  author?: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface PromptContent {
  // Raw text (prompt code or workflow template)
  text: string

  // Structured blocks (TASK, INPUTS, CONSTRAINTS, OUTPUT_FORMAT, QUALITY_CHECKS)
  blocks: PromptBlock[]

  // Language hint (e.g., "markdown", "prompt")
  language?: string
}

export interface PromptBlock {
  type:
    | 'TASK'
    | 'OBJECTIVE'
    | 'INPUTS'
    | 'CONSTRAINTS'
    | 'OUTPUT_FORMAT'
    | 'QUALITY_CHECKS'
    | 'QC'
    | 'ROLE'
    | 'UNCERTAINTY_POLICY'
  content: string
  required: boolean
}

export interface PromptInput {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean'
  placeholder?: string
  default?: any
  options?: string[] // For select type
  required?: boolean
  validation?: {
    pattern?: string // Regex
    min?: number
    max?: number
  }
}

export interface PromptOutput {
  format: 'text' | 'json' | 'markdown' | 'html' | 'structured'
  schema?: Record<string, any> // JSON Schema for structured outputs
  examples?: string[]
}

export interface PromptQuality {
  trustLevel: 'basic' | 'verified' | 'gold'
  status: 'draft' | 'published' | 'production'
  score?: number // 0-100 from QA system
  checks: {
    hasRequiredBlocks: boolean
    hasInputsSchema: boolean
    hasOutputFormat: boolean
    hasQualityChecks: boolean
    placeholderAlignment: boolean
  }
  issues: Array<{
    level: 'error' | 'warning'
    code: string
    message: string
  }>
  fallback?: {
    onSchemaFail?: 'none' | 'repair_json'
    maxRetries?: number // default 1
  }
}

export interface PromptExecution {
  provider?: 'openai' | 'anthropic' | 'google' | 'other'
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AgentReadiness {
  isReady: boolean
  automationPlatforms: Array<'n8n' | 'zapier' | 'make' | 'custom'>
  requiredCapabilities: string[]
  notes?: string
}

// Visual prompt pack types
export type RenderTarget = 'midjourney_v6' | 'sdxl' | 'dalle3' | 'ideogram'

export interface PromptPartsSpec {
  supportsNegative?: boolean
  supportsCamera?: boolean
  supportsLighting?: boolean
  supportsComposition?: boolean
}
