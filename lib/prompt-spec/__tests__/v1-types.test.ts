import { describe, it, expect } from 'vitest'
import {
  PromptAssetSchema,
  CapabilitySchema,
  StatusSchema,
  OutputBlockSpecSchema,
} from '../v1-types'

describe('MeeMa Prompt Spec v1.0 - Zod Schemas', () => {
  describe('CapabilitySchema', () => {
    it('should accept valid capabilities', () => {
      expect(CapabilitySchema.parse('text-generation')).toBe('text-generation')
      expect(CapabilitySchema.parse('image-generation')).toBe('image-generation')
      expect(CapabilitySchema.parse('multimodal')).toBe('multimodal')
    })

    it('should reject invalid capabilities', () => {
      expect(() => CapabilitySchema.parse('invalid')).toThrow()
    })
  })

  describe('OutputBlockSpecSchema', () => {
    it('should accept valid uppercase block keys', () => {
      const valid = {
        key: 'SUMMARY',
        description: 'Summary block',
        required: true,
      }
      expect(OutputBlockSpecSchema.parse(valid)).toEqual(valid)
    })

    it('should accept uppercase with underscores', () => {
      const valid = {
        key: 'CODE_OUTPUT',
        description: 'Code output block',
        required: false,
      }
      expect(OutputBlockSpecSchema.parse(valid)).toMatchObject(valid)
    })

    it('should reject lowercase block keys', () => {
      const invalid = {
        key: 'summary',
        description: 'Summary block',
      }
      expect(() => OutputBlockSpecSchema.parse(invalid)).toThrow()
    })

    it('should reject mixed case block keys', () => {
      const invalid = {
        key: 'Summary_Block',
        description: 'Summary block',
      }
      expect(() => OutputBlockSpecSchema.parse(invalid)).toThrow()
    })
  })

  describe('PromptAssetSchema', () => {
    it('should accept valid complete prompt asset', () => {
      const valid = {
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
        userPromptTemplate: 'Generate {{topic}}',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
          },
          required: ['topic'],
        },
        outputBlocks: [
          {
            key: 'OUTPUT',
            description: 'Main output',
            required: true,
          },
        ],
      }

      const result = PromptAssetSchema.parse(valid)
      expect(result.id).toBe(valid.id)
      expect(result.version).toBe('1.0.0')
    })

    it('should reject invalid semver version', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        version: '1.0', // Invalid semver
        name: 'Test Prompt',
        description: 'A test prompt',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        capability: 'text-generation',
        modality: 'text',
        status: 'production',
        visibility: 'public',
        riskTier: 'low',
        userPromptTemplate: 'Generate',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        outputBlocks: [
          {
            key: 'OUTPUT',
            description: 'Main output',
          },
        ],
      }

      expect(() => PromptAssetSchema.parse(invalid)).toThrow()
    })

    it('should require at least one output block', () => {
      const invalid = {
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
        userPromptTemplate: 'Generate',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        outputBlocks: [], // Empty
      }

      expect(() => PromptAssetSchema.parse(invalid)).toThrow()
    })
  })
})
