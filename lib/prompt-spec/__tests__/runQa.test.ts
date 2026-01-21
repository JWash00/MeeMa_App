import { describe, it, expect } from 'vitest'
import { runQa } from '../runQa'
import { PromptAsset } from '../v1-types'

describe('runQa', () => {
  const testAsset: PromptAsset = {
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
      { key: 'BODY', description: 'Body', required: true },
    ],
    qaChecks: [
      { id: 'required_blocks_present', description: 'Check blocks', type: 'structure', severity: 'error', autoFix: true },
      { id: 'min_length', description: 'Check length', type: 'content', severity: 'warning', autoFix: true },
    ],
    adapters: [],
  }

  it('should pass when output is valid', () => {
    const output = `TITLE:
Comprehensive Guide to AI Safety

BODY:
This is a comprehensive body section with enough content to pass validation checks.`

    const result = runQa(testAsset, { topic: 'AI Safety' }, output)

    expect(result.pass).toBe(true)
    expect(result.failures).toHaveLength(0)
    expect(result.patchable).toBe(false)
  })

  it('should fail when required block missing', () => {
    const output = `TITLE:
Just a Title`

    const result = runQa(testAsset, { topic: 'AI Safety' }, output)

    expect(result.pass).toBe(false)
    expect(result.failures.length).toBeGreaterThan(0)
    expect(result.failures[0].checkId).toBe('mps.v1.required_blocks')
    expect(result.patchable).toBe(true)
  })

  it('should aggregate multiple check failures', () => {
    const output = `TITLE:
Hi

BODY:
X`

    const result = runQa(testAsset, { topic: 'AI Safety' }, output)

    expect(result.pass).toBe(false)
    expect(result.failures.length).toBeGreaterThan(0)
    // Should fail min_length check
    const lengthFailure = result.failures.find(f => f.checkId === 'mps.v1.min_length')
    expect(lengthFailure).toBeDefined()
  })
})
