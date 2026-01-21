import { PromptAsset, ValidationResult } from '../v1-types'
import { SpecIssue } from '../../spec/specCompliance'

/**
 * QA issue type (from qaRouter)
 */
export interface QaIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

/**
 * Submission status enum
 * - verified: Score ≥85, auto-approved
 * - submitted: Score 70-84, pending review
 * - rejected: Score <70, needs significant improvements
 */
export type SubmissionStatus = 'verified' | 'submitted' | 'rejected'

/**
 * Detailed scoring breakdown
 */
export interface PromptScore {
  score: number                    // Final score 0-100
  qaScore: number                  // Base QA score from qaEvaluate
  compliancePenalty: number        // Total penalty from compliance issues
  reasons: string[]                // Human-readable explanations
}

/**
 * Complete QA report from dry-run evaluation
 */
export interface QaReport {
  level: 'draft' | 'verified'      // QA level from qaEvaluate
  score: number                    // Raw QA score
  issues: QaIssue[]                // QA issues found
  complianceIssues: SpecIssue[]    // Compliance issues found
  syntheticInputs: Record<string, unknown>  // Generated test inputs
  validationResult: ValidationResult        // validatePromptAsset result
}

/**
 * Complete submission record
 */
export interface PromptSubmission {
  id: string                       // Unique submission ID (sub_timestamp_random)
  asset: PromptAsset               // The prompt asset being submitted
  submitterId: string              // User/contributor ID
  status: SubmissionStatus         // Current status
  score: PromptScore               // Detailed scoring breakdown
  qaReport: QaReport               // QA evaluation results
  createdAt: string                // ISO 8601 timestamp
}

/**
 * User-facing submission response
 */
export interface SubmissionResponse {
  success: boolean                 // Whether submission succeeded
  submission?: PromptSubmission    // Submission object (if successful)
  error?: string                   // Error message (if failed)
  nextSteps: string[]              // Actionable guidance for user
}
