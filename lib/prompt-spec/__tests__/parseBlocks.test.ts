import { describe, it, expect } from 'vitest'
import { parseBlocks } from '../parseBlocks'

describe('parseBlocks', () => {
  it('should parse valid blocks', () => {
    const text = `SUMMARY:
This is a summary.
It has multiple lines.

CODE:
function test() {
  return true
}

NOTES:
Some notes here.`

    const result = parseBlocks(text)

    expect(result.blocks).toEqual({
      SUMMARY: 'This is a summary.\nIt has multiple lines.',
      CODE: 'function test() {\n  return true\n}',
      NOTES: 'Some notes here.',
    })
    expect(result.extraKeys).toHaveLength(0)
  })

  it('should preserve exact content with newlines', () => {
    const text = `OUTPUT:
Line 1

Line 3 (with blank line above)`

    const result = parseBlocks(text)

    expect(result.blocks.OUTPUT).toBe('Line 1\n\nLine 3 (with blank line above)')
  })

  it('should trim trailing spaces on each line', () => {
    const text = `OUTPUT:
Line with trailing
Another line  `

    const result = parseBlocks(text)

    expect(result.blocks.OUTPUT).toBe('Line with trailing\nAnother line')
  })

  it('should detect extra (invalid) keys', () => {
    const text = `VALID_KEY:
Content here

invalid_key:
This should be flagged

ANOTHER_VALID:
More content

MixedCase:
Also invalid`

    const result = parseBlocks(text)

    expect(result.blocks).toHaveProperty('VALID_KEY')
    expect(result.blocks).toHaveProperty('ANOTHER_VALID')
    expect(result.extraKeys).toContain('invalid_key')
    expect(result.extraKeys).toContain('MixedCase')
  })

  it('should handle empty blocks', () => {
    const text = `EMPTY:

NEXT:
Has content`

    const result = parseBlocks(text)

    expect(result.blocks.EMPTY).toBe('')
    expect(result.blocks.NEXT).toBe('Has content')
  })

  it('should handle text with no blocks', () => {
    const text = `Just some random text
with no block keys`

    const result = parseBlocks(text)

    expect(result.blocks).toEqual({})
    expect(result.extraKeys).toHaveLength(0)
  })

  it('should handle consecutive blocks without blank lines', () => {
    const text = `FIRST:
First content
SECOND:
Second content`

    const result = parseBlocks(text)

    expect(result.blocks.FIRST).toBe('First content')
    expect(result.blocks.SECOND).toBe('Second content')
  })
})
