import { PromptAssetSchema, PromptAsset, ValidationResult } from './v1-types'

/**
 * Validates a PromptAsset against MeeMa Prompt Spec v1.0
 *
 * Checks:
 * 1. Zod schema validation (structure, types, enums)
 * 2. Template variable consistency
 * 3. Block key format (uppercase underscore)
 * 4. Semver version format
 * 5. Required blocks presence
 *
 * @param asset - The prompt asset to validate
 * @returns ValidationResult with ok flag and error list
 */
export function validatePromptAsset(asset: unknown): ValidationResult {
  const errors: string[] = []

  // ============================================================================
  // 1. Zod Schema Validation
  // ============================================================================
  const zodResult = PromptAssetSchema.safeParse(asset)

  if (!zodResult.success) {
    zodResult.error.issues.forEach(issue => {
      const path = issue.path.join('.')
      errors.push(`${path}: ${issue.message}`)
    })

    // If basic schema fails, return early
    return { ok: false, errors }
  }

  const validAsset = zodResult.data as PromptAsset

  // ============================================================================
  // 2. Template Variable Validation
  // ============================================================================

  // Extract template variables from userPromptTemplate
  const templateVarRegex = /\{\{(\w+)\}\}/g
  const templateVars = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = templateVarRegex.exec(validAsset.userPromptTemplate)) !== null) {
    templateVars.add(match[1])
  }

  // Check if all template variables exist in inputSchema.properties
  const inputProperties = Object.keys(validAsset.inputSchema.properties || {})
  const missingVars = Array.from(templateVars).filter(v => !inputProperties.includes(v))

  if (missingVars.length > 0) {
    errors.push(
      `Template variables not defined in inputSchema: ${missingVars.join(', ')}`
    )
  }

  // Check for unused input properties (warning)
  const unusedVars = inputProperties.filter(p => !templateVars.has(p))
  if (unusedVars.length > 0) {
    errors.push(
      `Input properties not used in template: ${unusedVars.join(', ')}`
    )
  }

  // ============================================================================
  // 3. Block Key Validation (already checked by Zod regex)
  // ============================================================================

  // Additional check: ensure no duplicate block keys
  const blockKeys = validAsset.outputBlocks.map(b => b.key)
  const duplicates = blockKeys.filter((key, index) => blockKeys.indexOf(key) !== index)

  if (duplicates.length > 0) {
    errors.push(`Duplicate output block keys: ${Array.from(new Set(duplicates)).join(', ')}`)
  }

  // ============================================================================
  // 4. Semver Version Validation (already checked by Zod regex)
  // ============================================================================

  // Additional check: version parts are valid numbers
  const [major, minor, patch] = validAsset.version.split('.').map(Number)
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    errors.push(`Invalid semver version: ${validAsset.version}`)
  }

  // ============================================================================
  // 5. Required Blocks Check
  // ============================================================================

  const requiredBlocks = validAsset.outputBlocks.filter(b => b.required)
  if (requiredBlocks.length === 0) {
    errors.push('At least one output block must be marked as required')
  }

  // ============================================================================
  // 6. Adapter Validation
  // ============================================================================

  // Check for duplicate provider+model combinations
  const adapterKeys = validAsset.adapters.map(a => `${a.provider}:${a.model}`)
  const duplicateAdapters = adapterKeys.filter((key, index) => adapterKeys.indexOf(key) !== index)

  if (duplicateAdapters.length > 0) {
    errors.push(`Duplicate adapter configurations: ${Array.from(new Set(duplicateAdapters)).join(', ')}`)
  }

  // ============================================================================
  // Return Result
  // ============================================================================

  return {
    ok: errors.length === 0,
    errors,
  }
}
