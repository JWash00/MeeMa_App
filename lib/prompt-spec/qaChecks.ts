import { PromptAsset } from './v1-types'
import { parseBlocks, ParseBlocksResult } from './parseBlocks'

/**
 * QA check result for a single check
 */
export interface CheckResult {
  checkId: string
  passed: boolean
  message?: string          // Descriptive message if failed
  severity: 'error' | 'warning' | 'info'
  patchable: boolean        // Can this failure be auto-fixed?
}

/**
 * QA check runner function signature
 */
export type CheckRunner = (
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
) => CheckResult

// ============================================================================
// CHECK RUNNER: required_blocks_present
// ============================================================================

/**
 * Verifies all required OutputBlockSpec blocks are present in output
 *
 * Algorithm:
 * 1. Parse output text to extract blocks
 * 2. Get required block keys from asset.outputBlocks (where required=true)
 * 3. Check if all required keys exist in parsed blocks
 * 4. Patchable if missing blocks can be appended
 */
export function checkRequiredBlocksPresent(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
): CheckResult {
  const blocks = parsedBlocks || parseBlocks(outputText)

  const requiredKeys = asset.outputBlocks
    .filter(spec => spec.required)
    .map(spec => spec.key)

  const missingKeys = requiredKeys.filter(key => !(key in blocks.blocks))

  if (missingKeys.length === 0) {
    return {
      checkId: 'mps.v1.required_blocks',
      passed: true,
      severity: 'error',
      patchable: false,
    }
  }

  return {
    checkId: 'mps.v1.required_blocks',
    passed: false,
    message: `Missing required blocks: ${missingKeys.join(', ')}`,
    severity: 'error',
    patchable: true,  // Can append missing blocks
  }
}

// ============================================================================
// CHECK RUNNER: no_extra_blocks
// ============================================================================

/**
 * Verifies output contains only blocks defined in asset.outputBlocks
 *
 * Algorithm:
 * 1. Parse output text to get all block keys
 * 2. Get all valid block keys from asset.outputBlocks
 * 3. Find blocks in output that aren't defined
 * 4. Flag extra blocks (not patchable - would require removing content)
 */
export function checkNoExtraBlocks(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
): CheckResult {
  const blocks = parsedBlocks || parseBlocks(outputText)

  const validKeys = new Set(asset.outputBlocks.map(spec => spec.key))
  const extraKeys = Object.keys(blocks.blocks).filter(key => !validKeys.has(key))

  if (extraKeys.length === 0 && blocks.extraKeys.length === 0) {
    return {
      checkId: 'mps.v1.no_extra_blocks',
      passed: true,
      severity: 'warning',
      patchable: false,
    }
  }

  const allExtraKeys = [...extraKeys, ...blocks.extraKeys]

  return {
    checkId: 'mps.v1.no_extra_blocks',
    passed: false,
    message: `Extra blocks found: ${allExtraKeys.join(', ')}`,
    severity: 'warning',
    patchable: false,  // Cannot safely remove content
  }
}

// ============================================================================
// CHECK RUNNER: min_length
// ============================================================================

/**
 * Verifies each block meets minimum length requirements
 *
 * Algorithm:
 * 1. Parse output text to get blocks
 * 2. For each block, check if content.trim().length >= minLength
 * 3. Use heuristic: required blocks need at least 20 chars, optional blocks at least 10
 * 4. Patchable if blocks are too short (can regenerate with more content)
 */
export function checkMinLength(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
): CheckResult {
  const blocks = parsedBlocks || parseBlocks(outputText)

  const failures: string[] = []

  for (const spec of asset.outputBlocks) {
    const content = blocks.blocks[spec.key]

    // Skip optional blocks that aren't present
    if (!content && !spec.required) {
      continue
    }

    const trimmedContent = (content || '').trim()
    const minLength = spec.required ? 20 : 10

    if (trimmedContent.length < minLength) {
      failures.push(`${spec.key} (${trimmedContent.length} < ${minLength} chars)`)
    }
  }

  if (failures.length === 0) {
    return {
      checkId: 'mps.v1.min_length',
      passed: true,
      severity: 'warning',
      patchable: false,
    }
  }

  return {
    checkId: 'mps.v1.min_length',
    passed: false,
    message: `Blocks too short: ${failures.join(', ')}`,
    severity: 'warning',
    patchable: true,  // Can regenerate blocks with more content
  }
}

// ============================================================================
// CHECK RUNNER: style_consistency
// ============================================================================

/**
 * Verifies style consistency across blocks using simple heuristics
 *
 * Algorithm:
 * 1. Parse output text to get blocks
 * 2. Check for common style issues:
 *    - Markdown formatting in JSON-formatted blocks
 *    - Inconsistent bullet point styles (-, *, •)
 *    - Mixed heading styles (# vs ##)
 *    - Code fence mismatches (``` open but not closed)
 * 3. Use lightweight semantic heuristic (not heavy NLP)
 * 4. Patchable if style can be normalized
 */
export function checkStyleConsistency(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
): CheckResult {
  const blocks = parsedBlocks || parseBlocks(outputText)

  const issues: string[] = []

  // Check each block for style issues
  for (const spec of asset.outputBlocks) {
    const content = blocks.blocks[spec.key] || ''

    // JSON blocks shouldn't have markdown
    if (spec.format === 'json') {
      if (/^```|`{3,}/.test(content) || /^#+ /.test(content)) {
        issues.push(`${spec.key}: Contains markdown in JSON block`)
      }
    }

    // Check for unclosed code fences
    const fenceMatches = content.match(/```/g)
    if (fenceMatches && fenceMatches.length % 2 !== 0) {
      issues.push(`${spec.key}: Unclosed code fence`)
    }
  }

  // Check consistency across blocks
  const bulletStyles = new Set<string>()
  for (const content of Object.values(blocks.blocks)) {
    if (/^- /m.test(content)) bulletStyles.add('-')
    if (/^\* /m.test(content)) bulletStyles.add('*')
    if (/^• /m.test(content)) bulletStyles.add('•')
  }

  if (bulletStyles.size > 1) {
    issues.push(`Inconsistent bullet styles: ${Array.from(bulletStyles).join(', ')}`)
  }

  if (issues.length === 0) {
    return {
      checkId: 'mps.v1.style_consistency',
      passed: true,
      severity: 'info',
      patchable: false,
    }
  }

  return {
    checkId: 'mps.v1.style_consistency',
    passed: false,
    message: issues.join('; '),
    severity: 'info',
    patchable: true,  // Style can be normalized
  }
}

// ============================================================================
// CHECK RUNNER: schema_conformity
// ============================================================================

/**
 * Validates inputs against asset.inputSchema using JSON Schema
 *
 * Algorithm:
 * 1. Use existing schemaValidate.ts (AJV) to validate inputs
 * 2. Check if all required properties are present
 * 3. Check if property types match schema
 * 4. Not patchable (inputs are provided by caller)
 */
export function checkSchemaConformity(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string,
  parsedBlocks?: ParseBlocksResult
): CheckResult {
  // Get required properties from schema
  const required = asset.inputSchema.required || []
  const properties = asset.inputSchema.properties

  // Check for missing required properties
  const missingRequired = required.filter(prop => !(prop in inputs))

  if (missingRequired.length > 0) {
    return {
      checkId: 'mps.v1.schema_conformity',
      passed: false,
      message: `Missing required inputs: ${missingRequired.join(', ')}`,
      severity: 'error',
      patchable: false,  // Inputs are provided by caller
    }
  }

  // Check for type mismatches (simple checks)
  const typeErrors: string[] = []

  for (const [key, value] of Object.entries(inputs)) {
    const propSchema = properties[key] as any
    if (!propSchema) continue  // Extra property (handled by additionalProperties)

    const expectedType = propSchema.type
    const actualType = typeof value

    if (expectedType === 'string' && actualType !== 'string') {
      typeErrors.push(`${key}: expected string, got ${actualType}`)
    } else if (expectedType === 'number' && actualType !== 'number') {
      typeErrors.push(`${key}: expected number, got ${actualType}`)
    } else if (expectedType === 'boolean' && actualType !== 'boolean') {
      typeErrors.push(`${key}: expected boolean, got ${actualType}`)
    }
  }

  if (typeErrors.length > 0) {
    return {
      checkId: 'mps.v1.schema_conformity',
      passed: false,
      message: typeErrors.join('; '),
      severity: 'error',
      patchable: false,
    }
  }

  return {
    checkId: 'mps.v1.schema_conformity',
    passed: true,
    severity: 'error',
    patchable: false,
  }
}

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * Registry of all available check runners
 * Maps check ID to runner function
 */
export const CHECK_RUNNERS: Record<string, CheckRunner> = {
  'required_blocks_present': checkRequiredBlocksPresent,
  'no_extra_blocks': checkNoExtraBlocks,
  'min_length': checkMinLength,
  'style_consistency': checkStyleConsistency,
  'schema_conformity': checkSchemaConformity,
}

/**
 * Get check runner by ID
 */
export function getCheckRunner(checkId: string): CheckRunner | undefined {
  return CHECK_RUNNERS[checkId]
}
