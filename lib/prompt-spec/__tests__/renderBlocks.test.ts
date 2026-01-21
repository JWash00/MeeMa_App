import { describe, it, expect } from 'vitest'
import { renderBlocks } from '../renderBlocks'

describe('renderBlocks', () => {
  it('should render blocks in natural order', () => {
    const blocks = {
      SUMMARY: 'Summary content',
      CODE: 'Code content',
      NOTES: 'Notes content',
    }

    const result = renderBlocks(blocks)

    expect(result).toBe(
      `SUMMARY:\nSummary content\n\nCODE:\nCode content\n\nNOTES:\nNotes content`
    )
  })

  it('should render blocks in specified order', () => {
    const blocks = {
      SUMMARY: 'Summary content',
      CODE: 'Code content',
      NOTES: 'Notes content',
    }

    const result = renderBlocks(blocks, ['CODE', 'NOTES', 'SUMMARY'])

    expect(result).toBe(
      `CODE:\nCode content\n\nNOTES:\nNotes content\n\nSUMMARY:\nSummary content`
    )
  })

  it('should append blocks not in order array', () => {
    const blocks = {
      A: 'Content A',
      B: 'Content B',
      C: 'Content C',
    }

    const result = renderBlocks(blocks, ['B']) // Only specify B

    // B should be first, A and C appended in natural order
    expect(result).toContain('B:\nContent B')
    expect(result.split('\n\n')).toHaveLength(3)
  })

  it('should handle empty blocks', () => {
    const blocks = {
      EMPTY: '',
      CONTENT: 'Has content',
    }

    const result = renderBlocks(blocks)

    expect(result).toBe(`EMPTY:\n\n\nCONTENT:\nHas content`)
  })

  it('should preserve multiline content', () => {
    const blocks = {
      MULTI: 'Line 1\nLine 2\n\nLine 4',
    }

    const result = renderBlocks(blocks)

    expect(result).toBe(`MULTI:\nLine 1\nLine 2\n\nLine 4`)
  })
})
