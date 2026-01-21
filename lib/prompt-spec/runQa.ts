import { PromptAsset } from './v1-types'
import { parseBlocks } from './parseBlocks'
import { CheckResult, getCheckRunner } from './qaChecks'

/**
 * Result of running QA checks on an output
 */
export interface QaRunResult {
  pass: boolean              // All checks passed
  failures: CheckResult[]    // Failed checks
  patchable: boolean         // Can failures be auto-fixed?
  suggestedPatch?: string    // Optional patched output (if patchable)
}

/**
 * Run all QA checks defined in asset.qaChecks on the output
 *
 * @param asset - The prompt asset with QA check definitions
 * @param inputs - User-provided inputs (for schema validation)
 * @param outputText - The LLM output text to validate
 * @returns QaRunResult with pass/fail status and optional patch
 */
export function runQa(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string
): QaRunResult {
  // Parse blocks once for all checks
  const parsedBlocks = parseBlocks(outputText)

  // Run each check defined in asset.qaChecks
  const results: CheckResult[] = []

  for (const qaCheck of asset.qaChecks) {
    const runner = getCheckRunner(qaCheck.id)

    if (!runner) {
      // Check runner not implemented - log warning and skip
      console.warn(`QA check runner not found: ${qaCheck.id}`)
      continue
    }

    const result = runner(asset, inputs, outputText, parsedBlocks)
    results.push(result)
  }

  // Also run core checks if not explicitly in asset.qaChecks
  const definedCheckIds = new Set(asset.qaChecks.map(c => c.id))

  // Always run required_blocks_present (critical)
  if (!definedCheckIds.has('required_blocks_present')) {
    const runner = getCheckRunner('required_blocks_present')
    if (runner) {
      results.push(runner(asset, inputs, outputText, parsedBlocks))
    }
  }

  // Determine overall pass/fail
  const failures = results.filter(r => !r.passed)
  const pass = failures.length === 0

  // Determine if failures are patchable
  const patchable = failures.length > 0 && failures.every(f => f.patchable)

  return {
    pass,
    failures,
    patchable,
    // suggestedPatch will be added by patchOutput.ts if patchable=true
  }
}
