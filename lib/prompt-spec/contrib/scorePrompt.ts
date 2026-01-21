import { PromptAsset, InputSchema } from '../v1-types'
import { PromptScore } from './models'
import { qaEvaluateSnippet } from '../../qa/promptQa'
import { evaluateCompliance } from '../../spec/specCompliance'
import { Snippet } from '../../types'

/**
 * Score a PromptAsset combining QA evaluation and spec compliance
 *
 * Algorithm:
 * 1. Convert PromptAsset → Snippet
 * 2. Run qaEvaluate() to get base score (0-100)
 * 3. Run evaluateCompliance() to get issues
 * 4. Calculate penalties: error = -5 points, warning = -2 points
 * 5. Compute final score clamped to 0-100
 * 6. Generate detailed reasons array
 *
 * @param asset - The PromptAsset to score
 * @returns PromptScore with final score, penalties, and reasons
 */
export function scorePrompt(asset: PromptAsset): PromptScore {
  // Step 1: Convert to Snippet format
  const snippet = promptAssetToSnippet(asset)

  // Step 2: Run QA evaluation
  const qaResult = qaEvaluateSnippet(snippet)
  const baseScore = qaResult.score

  // Step 3: Run compliance checks
  const complianceIssues = evaluateCompliance(snippet)

  // Step 4: Calculate penalties
  let penalty = 0
  for (const issue of complianceIssues) {
    if (issue.level === 'error') {
      penalty += 5  // Critical compliance issues
    } else if (issue.level === 'warning') {
      penalty += 2  // Minor compliance issues
    }
  }

  // Step 5: Compute final score (clamped 0-100)
  const finalScore = Math.max(0, Math.min(100, baseScore - penalty))

  // Step 6: Generate reasons
  const reasons: string[] = []

  reasons.push(`Base QA score: ${baseScore}/100`)

  if (penalty > 0) {
    reasons.push(`Compliance penalty: -${penalty} points`)
  }

  // Add QA issue summary
  if (qaResult.issues.length > 0) {
    const errorCount = qaResult.issues.filter(i => i.level === 'error').length
    const warningCount = qaResult.issues.filter(i => i.level === 'warning').length

    if (errorCount > 0) {
      reasons.push(`QA errors found: ${errorCount}`)
    }
    if (warningCount > 0) {
      reasons.push(`QA warnings found: ${warningCount}`)
    }
  }

  // Add compliance issue summary
  if (complianceIssues.length > 0) {
    const errorCount = complianceIssues.filter(i => i.level === 'error').length
    const warningCount = complianceIssues.filter(i => i.level === 'warning').length

    if (errorCount > 0) {
      reasons.push(`Compliance errors found: ${errorCount}`)
    }
    if (warningCount > 0) {
      reasons.push(`Compliance warnings found: ${warningCount}`)
    }
  }

  reasons.push(`Final score: ${finalScore}/100`)

  return {
    score: finalScore,
    qaScore: baseScore,
    compliancePenalty: penalty,
    reasons,
  }
}

/**
 * Convert PromptAsset to Snippet format for QA/compliance evaluation
 *
 * @param asset - PromptAsset to convert
 * @returns Snippet compatible with existing QA systems
 */
function promptAssetToSnippet(asset: PromptAsset): Snippet {
  return {
    id: asset.id,
    title: asset.name,
    description: asset.description,
    tags: asset.tags,
    language: 'prompt',
    code: asset.userPromptTemplate,
    template: asset.userPromptTemplate,
    provider: null,
    scope: 'public',
    type: 'workflow',
    version: asset.version,
    category: 'Uncategorized',
    inputs_schema: convertInputSchemaToLegacy(asset.inputSchema),
    created_at: asset.createdAt,
    updated_at: asset.updatedAt,
  }
}

/**
 * Convert InputSchema (JSON Schema format) to legacy format
 *
 * @param schema - JSON Schema InputSchema
 * @returns Legacy inputs_schema format
 */
function convertInputSchemaToLegacy(schema: InputSchema): Record<string, any> {
  // Extract properties from JSON Schema format
  return schema.properties as Record<string, any>
}
