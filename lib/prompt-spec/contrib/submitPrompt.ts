import { PromptAsset, InputSchema } from '../v1-types'
import { validatePromptAsset } from '../validatePromptAsset'
import { PromptSubmission, SubmissionResponse, SubmissionStatus, QaReport, PromptScore } from './models'
import { scorePrompt } from './scorePrompt'
import { qaEvaluateSnippet } from '../../qa/promptQa'
import { evaluateCompliance } from '../../spec/specCompliance'
import { Snippet } from '../../types'

// In-memory submission store
const submissionStore = new Map<string, PromptSubmission>()

/**
 * Submit a prompt asset for evaluation and classification
 *
 * Workflow:
 * 1. Validate asset (hard fail if invalid)
 * 2. Generate synthetic test inputs from inputSchema
 * 3. Run QA dry-run evaluation
 * 4. Score the prompt (QA + compliance)
 * 5. Assign status based on score thresholds
 * 6. Create and store submission record
 * 7. Generate actionable next steps for user
 *
 * @param asset - The PromptAsset to submit
 * @param submitterId - ID of the user/contributor submitting
 * @returns SubmissionResponse with success status, submission, and guidance
 */
export function submitPrompt(
  asset: PromptAsset,
  submitterId: string
): SubmissionResponse {
  // Step 1: Validate asset (hard fail)
  const validationResult = validatePromptAsset(asset)

  if (!validationResult.ok) {
    return {
      success: false,
      error: `Validation failed: ${validationResult.errors.join(', ')}`,
      nextSteps: [
        'Fix validation errors',
        'Ensure template variables exist in inputSchema',
        'Verify block keys use UPPERCASE_UNDERSCORE',
        'Check version follows semver (MAJOR.MINOR.PATCH)',
      ],
    }
  }

  // Step 2: Generate synthetic test inputs
  const syntheticInputs = generateSyntheticInputs(asset.inputSchema)

  // Step 3: Run QA dry-run
  const snippet = promptAssetToSnippet(asset)
  const qaResult = qaEvaluateSnippet(snippet)
  const complianceIssues = evaluateCompliance(snippet)

  const qaReport: QaReport = {
    level: qaResult.level,
    score: qaResult.score,
    issues: qaResult.issues,
    complianceIssues,
    syntheticInputs,
    validationResult,
  }

  // Step 4: Score the prompt
  const promptScore = scorePrompt(asset)

  // Step 5: Assign status based on score
  let status: SubmissionStatus
  if (promptScore.score >= 85) {
    status = 'verified'
  } else if (promptScore.score >= 70) {
    status = 'submitted'
  } else {
    status = 'rejected'
  }

  // Step 6: Create submission record
  const submission: PromptSubmission = {
    id: generateSubmissionId(),
    asset,
    submitterId,
    status,
    score: promptScore,
    qaReport,
    createdAt: new Date().toISOString(),
  }

  // Store in-memory
  submissionStore.set(submission.id, submission)

  // Step 7: Generate next steps guidance
  const nextSteps = generateNextSteps(status, qaReport, promptScore)

  return {
    success: true,
    submission,
    nextSteps,
  }
}

/**
 * Generate synthetic test inputs from JSON Schema inputSchema
 *
 * @param schema - InputSchema with properties definition
 * @returns Object with generated test values for each property
 */
function generateSyntheticInputs(schema: InputSchema): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}

  for (const [key, prop] of Object.entries(schema.properties)) {
    inputs[key] = generateSyntheticValue(prop)
  }

  return inputs
}

/**
 * Generate a synthetic value for a single property based on JSON Schema type
 *
 * @param property - JSON Schema property definition
 * @returns Generated test value
 */
function generateSyntheticValue(property: unknown): unknown {
  if (typeof property !== 'object' || property === null) {
    return 'test_value'
  }

  const prop = property as any

  // Priority 1: enum - use first value
  if (Array.isArray(prop.enum) && prop.enum.length > 0) {
    return prop.enum[0]
  }

  // Priority 2: type-based defaults
  switch (prop.type) {
    case 'string':
      if (prop.format === 'email') return 'test@example.com'
      if (prop.format === 'url') return 'https://example.com'
      if (prop.format === 'date') return '2025-01-01'
      return 'test_value'

    case 'number':
    case 'integer':
      return prop.minimum ?? 42

    case 'boolean':
      return true

    case 'array':
      const itemValue = prop.items ? generateSyntheticValue(prop.items) : 'test_item'
      return [itemValue]

    case 'object':
      if (prop.properties) {
        return generateSyntheticInputs({
          type: 'object',
          properties: prop.properties
        } as InputSchema)
      }
      return {}

    default:
      return 'test_value'
  }
}

/**
 * Generate actionable next steps based on submission status
 *
 * @param status - Submission status (verified/submitted/rejected)
 * @param qaReport - QA evaluation report
 * @param score - Detailed prompt score
 * @returns Array of guidance strings for user
 */
function generateNextSteps(
  status: SubmissionStatus,
  qaReport: QaReport,
  score: PromptScore
): string[] {
  const steps: string[] = []

  if (status === 'verified') {
    steps.push('✓ Submission auto-approved!')
    steps.push('Your prompt meets all quality standards')
    steps.push('Ready for publication to the library')
  } else if (status === 'submitted') {
    steps.push('Submission pending review')
    steps.push(`Score: ${score.score}/100 (good, minor improvements needed)`)

    if (qaReport.issues.length > 0) {
      steps.push('Review QA warnings for higher score')
    }

    if (qaReport.complianceIssues.length > 0) {
      steps.push('Address compliance warnings for higher score')
    }

    steps.push('Your submission will be reviewed by the team')
  } else {  // rejected
    steps.push('Submission requires significant improvements')
    steps.push(`Score: ${score.score}/100 (below threshold of 70)`)

    // Collect critical errors
    const criticalIssues = [
      ...qaReport.issues.filter(i => i.level === 'error'),
      ...qaReport.complianceIssues.filter(i => i.level === 'error')
    ]

    if (criticalIssues.length > 0) {
      steps.push('Fix critical errors:')
      criticalIssues.forEach(i => steps.push(`  - ${i.message}`))
    }

    steps.push('Revise and resubmit after addressing issues')
  }

  return steps
}

/**
 * Generate unique submission ID
 *
 * @returns Unique ID in format: sub_timestamp_random
 */
function generateSubmissionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Convert PromptAsset to Snippet format (same as in scorePrompt.ts)
 *
 * @param asset - PromptAsset to convert
 * @returns Snippet compatible with QA systems
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
    inputs_schema: asset.inputSchema.properties as Record<string, any>,
    created_at: asset.createdAt,
    updated_at: asset.updatedAt,
  }
}

/**
 * Retrieve a submission by ID (for testing/admin)
 *
 * @param id - Submission ID
 * @returns Submission or undefined if not found
 */
export function getSubmission(id: string): PromptSubmission | undefined {
  return submissionStore.get(id)
}

/**
 * Get all submissions (for testing/admin)
 *
 * @returns Array of all submissions
 */
export function getAllSubmissions(): PromptSubmission[] {
  return Array.from(submissionStore.values())
}
