import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './schema.json'
import type { MeemaPrompt } from './types'

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)

const validateSchema = ajv.compile(schema)

export interface ValidationResult {
  valid: boolean
  errors: Array<{
    path: string
    message: string
    code: string
  }>
}

/**
 * Validate MeemaPrompt against JSON Schema
 * Returns structured errors, never throws
 */
export function validateMps(prompt: unknown): ValidationResult {
  const valid = validateSchema(prompt)

  if (valid) {
    return { valid: true, errors: [] }
  }

  const errors = (validateSchema.errors || []).map(err => ({
    path: err.instancePath || err.schemaPath,
    message: err.message || 'Validation error',
    code: err.keyword || 'VALIDATION_ERROR'
  }))

  return { valid: false, errors }
}

/**
 * Validate prompt structure (blocks and placeholders)
 */
export function validateStructure(prompt: MeemaPrompt): ValidationResult {
  const errors: ValidationResult['errors'] = []

  // Required blocks by type
  const requiredBlocks: Record<string, string[]> = {
    prompt: ['OUTPUT_FORMAT'],
    workflow: ['TASK', 'INPUTS', 'CONSTRAINTS', 'OUTPUT_FORMAT', 'QUALITY_CHECKS']
  }

  const required = requiredBlocks[prompt.type] || []
  const blockTypes = prompt.content.blocks.map(b => b.type)

  // Check for missing required blocks
  for (const requiredBlock of required) {
    if (!blockTypes.includes(requiredBlock as any)) {
      errors.push({
        path: '/content/blocks',
        message: `Missing required block: ${requiredBlock}`,
        code: `MISSING_BLOCK_${requiredBlock}`
      })
    }
  }

  // Workflow-specific validation
  if (prompt.type === 'workflow') {
    // Must have inputs
    if (!prompt.inputs || prompt.inputs.length === 0) {
      errors.push({
        path: '/inputs',
        message: 'Workflows must define at least one input',
        code: 'MISSING_INPUTS'
      })
    }

    // Placeholder alignment check
    const placeholders = extractPlaceholders(prompt.content.text)
    const inputKeys = (prompt.inputs || []).map(i => i.key)

    for (const placeholder of placeholders) {
      if (!inputKeys.includes(placeholder)) {
        errors.push({
          path: '/inputs',
          message: `Placeholder {{${placeholder}}} not defined in inputs`,
          code: 'PLACEHOLDER_MISMATCH'
        })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Full validation (schema + structure)
 */
export function validateFull(prompt: unknown): ValidationResult {
  // 1. JSON Schema validation
  const schemaResult = validateMps(prompt)
  if (!schemaResult.valid) {
    return schemaResult
  }

  // 2. Structure validation
  const structureResult = validateStructure(prompt as MeemaPrompt)
  if (!structureResult.valid) {
    return structureResult
  }

  return { valid: true, errors: [] }
}

/**
 * Extract {{placeholder}} keys from template text
 */
function extractPlaceholders(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const matches: string[] = []
  let match

  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim()
    if (key && !matches.includes(key)) {
      matches.push(key)
    }
  }

  return matches
}
