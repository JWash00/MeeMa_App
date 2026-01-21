import { z } from 'zod'

/**
 * MeeMa Prompt Spec v1.0 - Type Definitions
 * Zod schemas with runtime validation
 */

// ============================================================================
// ENUMS
// ============================================================================

export const CapabilitySchema = z.enum([
  'text-generation',
  'code-generation',
  'data-extraction',
  'classification',
  'summarization',
  'translation',
  'image-generation',
  'image-analysis',
  'audio-generation',
  'audio-transcription',
  'multimodal',
])
export type Capability = z.infer<typeof CapabilitySchema>

export const ModalitySchema = z.enum([
  'text',
  'image',
  'audio',
  'video',
  'code',
  'structured-data',
])
export type Modality = z.infer<typeof ModalitySchema>

export const StatusSchema = z.enum([
  'draft',
  'testing',
  'production',
  'deprecated',
  'archived',
])
export type Status = z.infer<typeof StatusSchema>

export const VisibilitySchema = z.enum([
  'public',
  'private',
  'organization',
  'team',
])
export type Visibility = z.infer<typeof VisibilitySchema>

export const RiskTierSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
])
export type RiskTier = z.infer<typeof RiskTierSchema>

// ============================================================================
// INPUT SCHEMA
// ============================================================================

/**
 * JSON Schema definition for prompt inputs
 * Uses standard JSON Schema Draft 7
 */
export const InputSchemaSchema = z.object({
  type: z.literal('object'),
  properties: z.record(z.string(), z.unknown()), // JSON Schema properties
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
})
export type InputSchema = z.infer<typeof InputSchemaSchema>

// ============================================================================
// OUTPUT BLOCKS
// ============================================================================

/**
 * Specification for structured output blocks
 */
export const OutputBlockSpecSchema = z.object({
  key: z.string().regex(/^[A-Z_]+$/, 'Block key must be uppercase with underscores'),
  description: z.string(),
  required: z.boolean().default(true),
  format: z.string().optional(), // e.g., "markdown", "json", "yaml"
})
export type OutputBlockSpec = z.infer<typeof OutputBlockSpecSchema>

// ============================================================================
// QA CHECKS
// ============================================================================

/**
 * Quality assurance check definition
 */
export const QaCheckSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['structure', 'content', 'format', 'semantic']),
  severity: z.enum(['error', 'warning', 'info']),
  autoFix: z.boolean().default(false),
})
export type QaCheck = z.infer<typeof QaCheckSchema>

// ============================================================================
// ADAPTER
// ============================================================================

/**
 * Model/API adapter configuration
 */
export const AdapterSchema = z.object({
  provider: z.string(), // e.g., "openai", "anthropic", "gemini"
  model: z.string(), // e.g., "gpt-4", "claude-sonnet-4.5"
  systemPromptTemplate: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
})
export type Adapter = z.infer<typeof AdapterSchema>

// ============================================================================
// PROMPT ASSET (Main Type)
// ============================================================================

/**
 * MeeMa Prompt Asset v1.0
 * Complete specification for a prompt
 */
export const PromptAssetSchema = z.object({
  // Metadata
  id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver (e.g., 1.0.0)'),
  name: z.string().min(1),
  description: z.string(),
  author: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Classification
  capability: CapabilitySchema,
  modality: ModalitySchema,
  status: StatusSchema,
  visibility: VisibilitySchema,
  riskTier: RiskTierSchema,
  tags: z.array(z.string()).default([]),

  // Prompt Content
  systemPrompt: z.string().optional(),
  userPromptTemplate: z.string(),

  // Input/Output
  inputSchema: InputSchemaSchema,
  outputBlocks: z.array(OutputBlockSpecSchema).min(1),

  // Quality & Compliance
  qaChecks: z.array(QaCheckSchema).default([]),

  // Adapter Configuration
  adapters: z.array(AdapterSchema).default([]),

  // Extensions (for future use)
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type PromptAsset = z.infer<typeof PromptAssetSchema>

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  ok: boolean
  errors: string[]
}
