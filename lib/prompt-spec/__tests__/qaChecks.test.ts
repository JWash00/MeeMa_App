import { describe, it, expect } from 'vitest'
import {
  checkRequiredBlocksPresent,
  checkNoExtraBlocks,
  checkMinLength,
  checkStyleConsistency,
  checkSchemaConformity,
} from '../qaChecks'
import { PromptAsset } from '../v1-types'

describe('QA Check Runners', () => {
  const baseAsset: PromptAsset = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    version: '1.0.0',
    name: 'Test Asset',
    description: 'Test',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    capability: 'text-generation',
    modality: 'text',
    status: 'production',
    visibility: 'public',
    riskTier: 'low',
    tags: [],
    userPromptTemplate: 'Generate {{topic}}',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
      },
      required: ['topic'],
    },
    outputBlocks: [
      { key: 'TITLE', description: 'Title', required: true },
      { key: 'CONTENT', description: 'Main content', required: true },
      { key: 'NOTES', description: 'Optional notes', required: false },
    ],
    qaChecks: [],
    adapters: [],
  }

  describe('checkRequiredBlocksPresent', () => {
    it('should pass when all required blocks present', () => {
      const output = `TITLE:
My Title

CONTENT:
Main content here`

      const result = checkRequiredBlocksPresent(baseAsset, {}, output)

      expect(result.passed).toBe(true)
      expect(result.checkId).toBe('mps.v1.required_blocks')
    })

    it('should fail when required block missing', () => {
      const output = `TITLE:
My Title`

      const result = checkRequiredBlocksPresent(baseAsset, {}, output)

      expect(result.passed).toBe(false)
      expect(result.message).toContain('CONTENT')
      expect(result.patchable).toBe(true)
    })
  })

  describe('checkNoExtraBlocks', () => {
    it('should pass when no extra blocks', () => {
      const output = `TITLE:
My Title

CONTENT:
Main content`

      const result = checkNoExtraBlocks(baseAsset, {}, output)

      expect(result.passed).toBe(true)
    })

    it('should fail when extra blocks present', () => {
      const output = `TITLE:
My Title

CONTENT:
Main content

EXTRA_BLOCK:
Should not be here`

      const result = checkNoExtraBlocks(baseAsset, {}, output)

      expect(result.passed).toBe(false)
      expect(result.message).toContain('EXTRA_BLOCK')
      expect(result.patchable).toBe(false)
    })
  })

  describe('checkMinLength', () => {
    it('should pass when blocks meet minimum length', () => {
      const output = `TITLE:
My Title Has Enough Characters

CONTENT:
This content is definitely long enough to pass the minimum length requirement`

      const result = checkMinLength(baseAsset, {}, output)

      expect(result.passed).toBe(true)
    })

    it('should fail when block too short', () => {
      const output = `TITLE:
Hi

CONTENT:
Short`

      const result = checkMinLength(baseAsset, {}, output)

      expect(result.passed).toBe(false)
      expect(result.patchable).toBe(true)
    })
  })

  describe('checkStyleConsistency', () => {
    it('should pass with consistent style', () => {
      const output = `TITLE:
My Title

CONTENT:
- Point one
- Point two
- Point three`

      const result = checkStyleConsistency(baseAsset, {}, output)

      expect(result.passed).toBe(true)
    })

    it('should fail with inconsistent bullet styles', () => {
      const output = `TITLE:
My Title

CONTENT:
- Point one
* Point two
• Point three`

      const result = checkStyleConsistency(baseAsset, {}, output)

      expect(result.passed).toBe(false)
      expect(result.message).toContain('bullet')
    })
  })

  describe('checkSchemaConformity', () => {
    it('should pass with valid inputs', () => {
      const inputs = { topic: 'AI Safety' }

      const result = checkSchemaConformity(baseAsset, inputs, '')

      expect(result.passed).toBe(true)
    })

    it('should fail with missing required input', () => {
      const inputs = {}

      const result = checkSchemaConformity(baseAsset, inputs, '')

      expect(result.passed).toBe(false)
      expect(result.message).toContain('topic')
      expect(result.patchable).toBe(false)
    })
  })
})
