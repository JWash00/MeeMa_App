import { describe, it, expect } from 'vitest'
import { scorePrompt } from '../../contrib/scorePrompt'
import { PromptAsset } from '../../v1-types'
import validAssetFixture from '../fixtures/valid-asset.json'

describe('scorePrompt', () => {
  const validAsset = validAssetFixture as PromptAsset

  it('should return valid score structure', () => {
    const result = scorePrompt(validAsset)

    // Should return valid score structure
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.qaScore).toBeGreaterThanOrEqual(0)
    expect(result.compliancePenalty).toBeGreaterThanOrEqual(0)
    expect(result.reasons.length).toBeGreaterThan(0)
    expect(result.reasons.some(r => r.includes('Base QA score'))).toBe(true)
    expect(result.reasons.some(r => r.includes('Final score'))).toBe(true)
  })

  it('should apply compliance penalties for missing title', () => {
    const invalidAsset: PromptAsset = {
      ...validAsset,
      name: '',  // Missing name triggers compliance error
    }

    const result = scorePrompt(invalidAsset)

    expect(result.compliancePenalty).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(result.qaScore)
    expect(result.reasons.some(r => r.includes('Compliance'))).toBe(true)
  })

  it('should apply compliance penalties for missing description', () => {
    const invalidAsset: PromptAsset = {
      ...validAsset,
      description: '',  // Missing description triggers compliance error
    }

    const result = scorePrompt(invalidAsset)

    expect(result.compliancePenalty).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(result.qaScore)
  })

  it('should clamp score to 0-100 range', () => {
    // Create asset with many errors to test lower bound
    const poorAsset: PromptAsset = {
      ...validAsset,
      name: '',
      description: '',
      userPromptTemplate: '',  // Empty template
    }

    const result = scorePrompt(poorAsset)

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('should include detailed reasons in output', () => {
    const result = scorePrompt(validAsset)

    expect(result.reasons.some(r => r.includes('Base QA score'))).toBe(true)
    expect(result.reasons.some(r => r.includes('Final score'))).toBe(true)
    expect(result.reasons.length).toBeGreaterThan(1)
  })

  it('should penalize assets with QA issues', () => {
    // Asset without required blocks triggers QA penalties
    const assetWithIssues: PromptAsset = {
      ...validAsset,
      userPromptTemplate: 'Simple template without blocks {{topic}}',
    }

    const baselineResult = scorePrompt(validAsset)
    const issuesResult = scorePrompt(assetWithIssues)

    // Asset with issues should score lower or equal
    expect(issuesResult.score).toBeLessThanOrEqual(baselineResult.score)
  })
})
