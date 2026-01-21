import { Snippet } from '@/lib/types'

export type IssueLevel = 'error' | 'warning'

export interface SpecIssue {
  level: IssueLevel
  code: string
  message: string
}

export type ComplianceStatus = 'pass' | 'warning' | 'error'

// Required blocks for workflows
const REQUIRED_WORKFLOW_BLOCKS = ['ROLE', 'OBJECTIVE', 'OUTPUT FORMAT', 'QC']
const RECOMMENDED_PROMPT_BLOCKS = ['OUTPUT FORMAT']

/**
 * Check if a template contains a specific block
 */
function hasBlock(template: string, blockName: string): boolean {
  // Match ## BLOCK or # BLOCK or **BLOCK** patterns
  const patterns = [
    new RegExp(`^##\\s*${blockName}`, 'im'),
    new RegExp(`^#\\s*${blockName}`, 'im'),
    new RegExp(`\\*\\*${blockName}\\*\\*`, 'i'),
  ]
  return patterns.some(pattern => pattern.test(template))
}

/**
 * Check if version follows semver-like format (MAJOR.MINOR)
 */
function isValidVersion(version: string | undefined): boolean {
  if (!version) return false
  return /^\d+\.\d+$/.test(version)
}

/**
 * Evaluate compliance for a snippet against the Internal Spec v0.1
 */
export function evaluateCompliance(snippet: Snippet): SpecIssue[] {
  const issues: SpecIssue[] = []
  const isWorkflow = snippet.type === 'workflow'

  // === All Content Rules ===

  // Title required
  if (!snippet.title?.trim()) {
    issues.push({
      level: 'error',
      code: 'MISSING_TITLE',
      message: 'Title is required'
    })
  }

  // Description required
  if (!snippet.description?.trim()) {
    issues.push({
      level: 'error',
      code: 'MISSING_DESCRIPTION',
      message: 'Description is required'
    })
  }

  // Category required
  if (!snippet.category?.trim()) {
    issues.push({
      level: 'error',
      code: 'MISSING_CATEGORY',
      message: 'Category is required'
    })
  }

  // Version should be semver-like
  if (!isValidVersion(snippet.version)) {
    issues.push({
      level: 'warning',
      code: 'INVALID_VERSION',
      message: 'Version should follow MAJOR.MINOR format (e.g., 1.0)'
    })
  }

  // Audience should be specified
  if (!snippet.audience) {
    issues.push({
      level: 'warning',
      code: 'MISSING_AUDIENCE',
      message: 'Audience should be specified (creator, developer, or both)'
    })
  }

  // === Workflow-Specific Rules ===
  if (isWorkflow) {
    // Template required for workflows
    if (!snippet.template?.trim()) {
      issues.push({
        level: 'error',
        code: 'WORKFLOW_MISSING_TEMPLATE',
        message: 'Workflows require a template'
      })
    } else {
      // Check for required blocks
      for (const block of REQUIRED_WORKFLOW_BLOCKS) {
        if (!hasBlock(snippet.template, block)) {
          issues.push({
            level: 'error',
            code: `WORKFLOW_MISSING_${block.replace(/\s+/g, '_').toUpperCase()}`,
            message: `Workflows require a ${block} block`
          })
        }
      }
    }

    // inputs_schema required for workflows
    if (!snippet.inputs_schema || Object.keys(snippet.inputs_schema).length === 0) {
      issues.push({
        level: 'error',
        code: 'WORKFLOW_MISSING_INPUTS_SCHEMA',
        message: 'Workflows require inputs_schema with at least one input'
      })
    }
  }

  // === Prompt-Specific Rules ===
  if (!isWorkflow) {
    // Code or template required
    if (!snippet.code?.trim() && !snippet.template?.trim()) {
      issues.push({
        level: 'error',
        code: 'PROMPT_MISSING_CONTENT',
        message: 'Prompts require code or template content'
      })
    }

    // OUTPUT FORMAT recommended for prompts
    const content = snippet.template || snippet.code || ''
    if (content && !hasBlock(content, 'OUTPUT FORMAT')) {
      issues.push({
        level: 'warning',
        code: 'PROMPT_MISSING_OUTPUT_FORMAT',
        message: 'OUTPUT FORMAT block is recommended for prompts'
      })
    }
  }

  return issues
}

/**
 * Check if snippet is ready for official release (no errors)
 */
export function isOfficialReady(issues: SpecIssue[]): boolean {
  return !issues.some(issue => issue.level === 'error')
}

/**
 * Get overall compliance status
 */
export function getComplianceStatus(issues: SpecIssue[]): ComplianceStatus {
  if (issues.some(issue => issue.level === 'error')) {
    return 'error'
  }
  if (issues.some(issue => issue.level === 'warning')) {
    return 'warning'
  }
  return 'pass'
}
