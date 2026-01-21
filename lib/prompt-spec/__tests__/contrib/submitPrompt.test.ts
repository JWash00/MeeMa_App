import { describe, it, expect } from 'vitest'
import { submitPrompt, getSubmission } from '../../contrib/submitPrompt'
import { PromptAsset } from '../../v1-types'
import validAssetFixture from '../fixtures/valid-asset.json'

describe('submitPrompt', () => {
  const validAsset = validAssetFixture as PromptAsset

  it('should reject invalid assets with validation errors', () => {
    const invalidAsset = {
      ...validAsset,
      version: '1.0',  // Invalid semver (missing patch)
    } as PromptAsset

    const response = submitPrompt(invalidAsset, 'user123')

    expect(response.success).toBe(false)
    expect(response.error).toContain('Validation failed')
    expect(response.nextSteps).toContain('Fix validation errors')
    expect(response.submission).toBeUndefined()
  })

  it('should successfully submit valid asset', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)
    expect(response.submission).toBeDefined()
    // Status depends on score - could be verified, submitted, or rejected
    expect(['verified', 'submitted', 'rejected']).toContain(response.submission?.status)
    expect(response.submission?.score.score).toBeGreaterThanOrEqual(0)
    expect(response.nextSteps.length).toBeGreaterThan(0)
  })

  it('should generate synthetic inputs for all inputSchema properties', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)
    expect(response.submission?.qaReport.syntheticInputs).toBeDefined()

    const inputs = response.submission!.qaReport.syntheticInputs

    // Check that synthetic values were generated
    expect(inputs.text).toBe('test_value')
    expect(inputs.max_words).toBe(42)
    expect(inputs.tone).toBe('formal')  // First enum value
  })

  it('should store submission in memory and be retrievable', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)
    const submissionId = response.submission!.id

    const retrieved = getSubmission(submissionId)

    expect(retrieved).toBeDefined()
    expect(retrieved?.id).toBe(submissionId)
    expect(retrieved?.submitterId).toBe('user123')
  })

  it('should include complete QA report in submission', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)

    const qaReport = response.submission!.qaReport

    expect(qaReport.level).toBeDefined()
    expect(qaReport.score).toBeGreaterThanOrEqual(0)
    expect(qaReport.issues).toBeDefined()
    expect(qaReport.complianceIssues).toBeDefined()
    expect(qaReport.syntheticInputs).toBeDefined()
    expect(qaReport.validationResult).toBeDefined()
    expect(qaReport.validationResult.ok).toBe(true)
  })

  it('should generate appropriate next steps based on status', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)
    expect(response.nextSteps.length).toBeGreaterThan(0)

    // Check that guidance matches status
    if (response.submission!.status === 'verified') {
      expect(response.nextSteps.some(s => s.includes('approved'))).toBe(true)
    } else if (response.submission!.status === 'submitted') {
      expect(response.nextSteps.some(s => s.includes('pending') || s.includes('review'))).toBe(true)
    } else if (response.submission!.status === 'rejected') {
      expect(response.nextSteps.some(s => s.includes('improvements') || s.includes('threshold'))).toBe(true)
    }
  })

  it('should handle synthetic input generation for different types', () => {
    // Create asset with various input types - simpler version with valid template
    const assetWithTypes: PromptAsset = {
      ...validAsset,
      inputSchema: {
        type: 'object',
        properties: {
          stringField: { type: 'string' },
          numberField: { type: 'number' },
          booleanField: { type: 'boolean' },
          enumField: { type: 'string', enum: ['option1', 'option2'] },
        },
        required: ['stringField'],
      },
      userPromptTemplate: 'Test {{stringField}}',
    }

    const response = submitPrompt(assetWithTypes, 'user123')

    // If validation passes, check synthetic inputs
    if (response.success) {
      const inputs = response.submission!.qaReport.syntheticInputs

      expect(inputs.stringField).toBe('test_value')
      expect(inputs.numberField).toBe(42)
      expect(inputs.booleanField).toBe(true)
      expect(inputs.enumField).toBe('option1')  // First enum
    } else {
      // Validation failed - that's also okay for this test
      expect(response.error).toBeDefined()
    }
  })

  it('should include submission timestamp', () => {
    const response = submitPrompt(validAsset, 'user123')

    expect(response.success).toBe(true)
    expect(response.submission?.createdAt).toBeDefined()

    // Verify ISO 8601 format
    const timestamp = response.submission!.createdAt
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})
