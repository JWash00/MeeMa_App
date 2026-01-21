import { Snippet } from '@/lib/types'
import { getRawTemplateText } from './snippetHelpers'

/**
 * Extract all {{placeholder}} tokens from a template string
 */
export function extractPlaceholders(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const matches: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1])
    }
  }

  return matches
}

export interface PlaceholderValidationResult {
  /** Schema keys that are defined but not used in template */
  unusedSchemaKeys: string[]
  /** Placeholders in template that are not in schema */
  missingSchemaKeys: string[]
  /** Whether validation passed (no issues) */
  isValid: boolean
}

/**
 * Validate placeholders in template against inputs_schema
 * Only meaningful for workflows with inputs_schema
 */
export function validatePlaceholders(snippet: Snippet): PlaceholderValidationResult {
  const template = getRawTemplateText(snippet)
  const placeholders = extractPlaceholders(template)

  // Get schema keys
  const schemaKeys = snippet.inputs_schema
    ? Object.keys(snippet.inputs_schema)
    : []

  // Find schema keys not used in template
  const unusedSchemaKeys = schemaKeys.filter(key => !placeholders.includes(key))

  // Find placeholders not in schema
  const missingSchemaKeys = placeholders.filter(key => !schemaKeys.includes(key))

  return {
    unusedSchemaKeys,
    missingSchemaKeys,
    isValid: unusedSchemaKeys.length === 0 && missingSchemaKeys.length === 0
  }
}
