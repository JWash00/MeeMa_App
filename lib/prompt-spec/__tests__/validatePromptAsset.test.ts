import { describe, it, expect } from 'vitest'
import { validatePromptAsset } from '../validatePromptAsset'
import { PromptAsset } from '../v1-types'

describe('validatePromptAsset', () => {
  const baseValidAsset: PromptAsset = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    version: '1.0.0',
    name: 'Test Prompt',
    description: 'A test prompt',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    capability: 'text-generation',
    modality: 'text',
    status: 'production',
    visibility: 'public',
    riskTier: 'low',
    tags: [],
    userPromptTemplate: 'Generate a summary for {{topic}} in {{style}} style',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        style: { type: 'string' },
      },
      required: ['topic', 'style'],
    },
    outputBlocks: [
      {
        key: 'SUMMARY',
        description: 'Summary output',
        required: true,
      },
    ],
    qaChecks: [],
    adapters: [],
  }

  describe('Valid assets', () => {
    it('should validate a complete valid asset', () => {
      const result = validatePromptAsset(baseValidAsset)
      expect(result.ok).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Template variable validation', () => {
    it('should detect missing template variables in inputSchema', () => {
      const invalid = {
        ...baseValidAsset,
        userPromptTemplate: 'Generate {{topic}} and {{missing}}',
      }

      const result = validatePromptAsset(invalid)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.includes('Template variables not defined in inputSchema: missing'))).toBe(true)
    })

    it('should detect unused input properties', () => {
      const invalid = {
        ...baseValidAsset,
        userPromptTemplate: 'Generate {{topic}}', // Not using 'style'
      }

      const result = validatePromptAsset(invalid)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.includes('Input properties not used in template: style'))).toBe(true)
    })
  })

  describe('Block key validation', () => {
    it('should detect duplicate block keys', () => {
      const invalid = {
        ...baseValidAsset,
        outputBlocks: [
          { key: 'SUMMARY', description: 'First', required: true },
          { key: 'SUMMARY', description: 'Duplicate', required: false },
        ],
      }

      const result = validatePromptAsset(invalid)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.includes('Duplicate output block keys: SUMMARY'))).toBe(true)
    })
  })

  describe('Required blocks validation', () => {
    it('should require at least one required block', () => {
      const invalid = {
        ...baseValidAsset,
        outputBlocks: [
          { key: 'OPTIONAL', description: 'Optional', required: false },
        ],
      }

      const result = validatePromptAsset(invalid)
      expect(result.ok).toBe(false)
      expect(result.errors).toContain(
        'At least one output block must be marked as required'
      )
    })
  })

  describe('Adapter validation', () => {
    it('should detect duplicate adapter configurations', () => {
      const invalid = {
        ...baseValidAsset,
        adapters: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'openai', model: 'gpt-4' }, // Duplicate
        ],
      }

      const result = validatePromptAsset(invalid)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.includes('Duplicate adapter configurations: openai:gpt-4'))).toBe(true)
    })
  })
})
