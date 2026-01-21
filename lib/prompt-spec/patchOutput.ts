import { PromptAsset, OutputBlockSpec } from './v1-types'
import { parseBlocks } from './parseBlocks'
import { renderBlocks } from './renderBlocks'
import { runQa, QaRunResult } from './runQa'

/**
 * Result of patching output
 */
export interface PatchResult {
  success: boolean          // Was patch successful?
  original: string          // Original output text
  patched: string           // Patched output text
  changes: PatchChange[]    // List of changes made
  qaResult: QaRunResult     // QA result after patching
}

/**
 * Describes a single change in the patch
 */
export interface PatchChange {
  type: 'block_added' | 'block_updated'
  blockKey: string
  reason: string
  contentPreview: string    // First 100 chars
}

/**
 * Patch output by adding missing required blocks
 *
 * Strategy:
 * 1. Run QA to identify missing blocks
 * 2. If not patchable, return early
 * 3. Generate content for missing blocks using best-effort heuristics:
 *    - Use context from existing blocks
 *    - Use inputs to fill placeholders
 *    - Use block description as guidance
 * 4. Append missing blocks to output
 * 5. Re-run QA to verify patch
 * 6. Return patched output
 *
 * Constraints:
 * - Never remove existing blocks
 * - Never reorder existing content (only append)
 * - Only add required blocks that are missing
 * - Ensure final output passes required_blocks_present and no_extra_blocks
 */
export function patchOutput(
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  outputText: string
): PatchResult {
  // Step 1: Run initial QA
  const initialQa = runQa(asset, inputs, outputText)

  if (initialQa.pass) {
    // Already passes QA - no patch needed
    return {
      success: true,
      original: outputText,
      patched: outputText,
      changes: [],
      qaResult: initialQa,
    }
  }

  if (!initialQa.patchable) {
    // Failures cannot be auto-fixed
    return {
      success: false,
      original: outputText,
      patched: outputText,
      changes: [],
      qaResult: initialQa,
    }
  }

  // Step 2: Parse existing blocks
  const parsedBlocks = parseBlocks(outputText)
  const existingBlocks = { ...parsedBlocks.blocks }

  // Step 3: Identify missing required blocks
  const requiredSpecs = asset.outputBlocks.filter(spec => spec.required)
  const missingSpecs = requiredSpecs.filter(spec => !(spec.key in existingBlocks))

  if (missingSpecs.length === 0) {
    // No missing blocks - other QA failures
    return {
      success: false,
      original: outputText,
      patched: outputText,
      changes: [],
      qaResult: initialQa,
    }
  }

  // Step 4: Generate content for missing blocks
  const changes: PatchChange[] = []

  for (const spec of missingSpecs) {
    const generatedContent = generateMissingBlockContent(
      spec,
      asset,
      inputs,
      existingBlocks
    )

    existingBlocks[spec.key] = generatedContent

    changes.push({
      type: 'block_added',
      blockKey: spec.key,
      reason: `Required block was missing`,
      contentPreview: generatedContent.slice(0, 100),
    })
  }

  // Step 5: Render patched output
  // Order: existing blocks first, then missing blocks (appended)
  const existingKeys = Object.keys(parsedBlocks.blocks)
  const newKeys = missingSpecs.map(s => s.key)
  const orderedKeys = [...existingKeys, ...newKeys]

  const patchedText = renderBlocks(existingBlocks, orderedKeys)

  // Step 6: Re-run QA on patched output
  const patchedQa = runQa(asset, inputs, patchedText)

  return {
    success: patchedQa.pass,
    original: outputText,
    patched: patchedText,
    changes,
    qaResult: patchedQa,
  }
}

/**
 * Generate content for a missing block using best-effort heuristics
 *
 * Strategy:
 * 1. Use block description as primary guidance
 * 2. Extract context from existing blocks
 * 3. Use inputs to fill in details
 * 4. Use modality-specific templates (leverage existing patch logic)
 * 5. Keep content concise but meaningful (50-200 chars)
 */
function generateMissingBlockContent(
  spec: OutputBlockSpec,
  asset: PromptAsset,
  inputs: Record<string, unknown>,
  existingBlocks: Record<string, string>
): string {
  // Extract context hints from description
  const description = spec.description.toLowerCase()

  // Common block patterns
  if (description.includes('title') || spec.key === 'TITLE') {
    // Generate title from inputs or asset name
    const topic = inputs.topic || inputs.subject || asset.name
    return `${topic}`
  }

  if (description.includes('summary') || spec.key === 'SUMMARY') {
    // Generate summary from existing blocks or inputs
    const firstBlock = Object.values(existingBlocks)[0] || ''
    const excerpt = firstBlock.slice(0, 150).trim()
    return excerpt ? `${excerpt}...` : 'Summary of the content.'
  }

  if (description.includes('conclusion') || spec.key === 'CONCLUSION') {
    return 'In conclusion, this addresses the requirements.'
  }

  if (description.includes('metadata') || spec.key === 'METADATA') {
    // Generate metadata from inputs
    const metadataEntries = Object.entries(inputs)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    return metadataEntries || 'No metadata available.'
  }

  // Format-specific defaults
  if (spec.format === 'json') {
    return '{}'
  }

  if (spec.format === 'yaml') {
    return '---'
  }

  // Generic fallback
  return `Content for ${spec.key}. ${spec.description}`
}
