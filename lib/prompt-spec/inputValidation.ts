import type { MeemaPrompt, PromptInput } from './types'

export interface InputValidationResult {
  valid: boolean
  resolvedInputs: Record<string, unknown>
  errors: Array<{
    field: string
    code: string
    message: string
  }>
}

/**
 * Validate user inputs against prompt's inputs[] schema
 * Applies defaults, validates types, enums, and constraints
 * Never throws - returns structured errors
 */
export function validateInputs(
  prompt: MeemaPrompt,
  userInputs: Record<string, unknown>
): InputValidationResult {
  const errors: InputValidationResult['errors'] = []
  const resolvedInputs: Record<string, unknown> = {}

  // Workflows must have inputs defined
  if (prompt.type === 'workflow' && (!prompt.inputs || prompt.inputs.length === 0)) {
    return {
      valid: false,
      resolvedInputs: {},
      errors: [{
        field: '_workflow',
        code: 'NO_INPUTS_DEFINED',
        message: 'Workflow has no inputs defined'
      }]
    }
  }

  // For prompts without inputs, return empty resolved
  if (!prompt.inputs) {
    return { valid: true, resolvedInputs: {}, errors: [] }
  }

  // Validate each input definition
  for (const inputDef of prompt.inputs) {
    const { key, required, default: defaultValue } = inputDef
    const userValue = userInputs[key]

    // Apply default if missing
    const value = userValue !== undefined && userValue !== null && userValue !== '' ? userValue : defaultValue

    // Check required (after applying default)
    if (required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: key,
        code: 'REQUIRED_FIELD',
        message: `Input "${key}" is required`
      })
      continue
    }

    if (value === undefined) {
      continue // Optional field not provided
    }

    // Type validation
    const typeError = validateType(inputDef, value)
    if (typeError) {
      errors.push({ field: key, ...typeError })
      continue
    }

    // Enum validation (for select type)
    if (inputDef.type === 'select' && inputDef.options) {
      if (!inputDef.options.includes(String(value))) {
        errors.push({
          field: key,
          code: 'INVALID_OPTION',
          message: `"${value}" is not a valid option. Must be one of: ${inputDef.options.join(', ')}`
        })
        continue
      }
    }

    // Constraint validation
    if (inputDef.validation) {
      const constraintError = validateConstraints(inputDef, value)
      if (constraintError) {
        errors.push({ field: key, ...constraintError })
        continue
      }
    }

    // Add to resolved
    resolvedInputs[key] = value
  }

  return {
    valid: errors.length === 0,
    resolvedInputs,
    errors
  }
}

/**
 * Validate value matches input type
 */
function validateType(
  inputDef: PromptInput,
  value: unknown
): { code: string; message: string } | null {
  const { type, key } = inputDef

  switch (type) {
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return {
          code: 'INVALID_TYPE',
          message: `Input "${key}" must be a string`
        }
      }
      break
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return {
          code: 'INVALID_TYPE',
          message: `Input "${key}" must be a number`
        }
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return {
          code: 'INVALID_TYPE',
          message: `Input "${key}" must be a boolean`
        }
      }
      break
  }

  return null
}

/**
 * Validate constraints (pattern, min, max)
 */
function validateConstraints(
  inputDef: PromptInput,
  value: unknown
): { code: string; message: string } | null {
  const { validation, key } = inputDef
  if (!validation) return null

  // Pattern (regex) validation for strings
  if (validation.pattern && typeof value === 'string') {
    const regex = new RegExp(validation.pattern)
    if (!regex.test(value)) {
      return {
        code: 'INVALID_FORMAT',
        message: `Input "${key}" does not match required format`
      }
    }
  }

  // Min/Max for numbers
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return {
        code: 'VALUE_TOO_SMALL',
        message: `Input "${key}" must be at least ${validation.min}`
      }
    }
    if (validation.max !== undefined && value > validation.max) {
      return {
        code: 'VALUE_TOO_LARGE',
        message: `Input "${key}" must be at most ${validation.max}`
      }
    }
  }

  // Min/Max for string length
  if (typeof value === 'string') {
    if (validation.min !== undefined && value.length < validation.min) {
      return {
        code: 'STRING_TOO_SHORT',
        message: `Input "${key}" must be at least ${validation.min} characters`
      }
    }
    if (validation.max !== undefined && value.length > validation.max) {
      return {
        code: 'STRING_TOO_LONG',
        message: `Input "${key}" must be at most ${validation.max} characters`
      }
    }
  }

  return null
}
