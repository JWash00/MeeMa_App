import { describe, it, expect } from 'vitest'
import { patchOutput } from '../patchOutput'
import { PromptAsset } from '../v1-types'

describe('patchOutput', () => {
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
      { key: 'SUMMARY', description: 'Summary', required: true },
      { key: 'BODY', description: 'Body', required: true },
    ],
    qaChecks: [],
    adapters: [],
  }

  it('should return unchanged output if already valid', () => {
    const output = `TITLE:
Complete Guide

SUMMARY:
A comprehensive summary section.

BODY:
Full body content here with all required information.`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    expect(result.success).toBe(true)
    expect(result.patched).toBe(output)
    expect(result.changes).toHaveLength(0)
  })

  it('should add missing required block', () => {
    const output = `TITLE:
Incomplete Guide

BODY:
Body content without summary`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    expect(result.success).toBe(true)
    expect(result.patched).toContain('SUMMARY:')
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0].blockKey).toBe('SUMMARY')
    expect(result.changes[0].type).toBe('block_added')
  })

  it('should preserve existing block order and append missing blocks', () => {
    const output = `BODY:
Body comes first

TITLE:
Title comes second`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    expect(result.success).toBe(true)

    // Check that original order is preserved
    const bodyIndex = result.patched.indexOf('BODY:')
    const titleIndex = result.patched.indexOf('TITLE:')
    const summaryIndex = result.patched.indexOf('SUMMARY:')

    expect(bodyIndex).toBeLessThan(titleIndex)
    expect(titleIndex).toBeLessThan(summaryIndex)  // SUMMARY appended last
  })

  it('should add multiple missing blocks', () => {
    const output = `TITLE:
Only Title`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    expect(result.success).toBe(true)
    expect(result.changes).toHaveLength(2)  // SUMMARY and BODY added

    const summaryChange = result.changes.find(c => c.blockKey === 'SUMMARY')
    const bodyChange = result.changes.find(c => c.blockKey === 'BODY')

    expect(summaryChange).toBeDefined()
    expect(bodyChange).toBeDefined()
  })

  it('should use inputs to generate content', () => {
    const output = `BODY:
Generic body content`

    const result = patchOutput(testAsset, { topic: 'AI Safety' }, output)

    expect(result.success).toBe(true)
    expect(result.patched).toContain('TITLE:')

    // Title should contain the topic
    const titleMatch = result.patched.match(/TITLE:\s*(.+?)(\n\n|$)/s)
    if (titleMatch) {
      expect(titleMatch[1]).toContain('AI Safety')
    }
  })

  it('should not remove existing content', () => {
    const output = `TITLE:
Original Title

BODY:
Original body content with specific details

EXTRA_BLOCK:
This should stay even though not in spec`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    // All original content should be present
    expect(result.patched).toContain('Original Title')
    expect(result.patched).toContain('Original body content with specific details')
    expect(result.patched).toContain('EXTRA_BLOCK')
  })

  it('should re-run QA and verify success', () => {
    const output = `TITLE:
Partial Output`

    const result = patchOutput(testAsset, { topic: 'Testing' }, output)

    expect(result.qaResult.pass).toBe(true)
    expect(result.qaResult.failures).toHaveLength(0)
  })
})
