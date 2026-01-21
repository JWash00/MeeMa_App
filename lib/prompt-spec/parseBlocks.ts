/**
 * Parses structured output blocks from LLM text response
 *
 * Format:
 * BLOCK_KEY:
 * content here
 * more content
 *
 * ANOTHER_BLOCK:
 * different content
 *
 * Rules:
 * - Block keys must be UPPERCASE_UNDERSCORE
 * - Block key must be followed by ":" on its own line
 * - Content between blocks is captured exactly (preserves newlines)
 * - Trailing spaces on each line are trimmed
 * - Leading/trailing newlines within block content are NOT trimmed
 *
 * @param text - Raw LLM output text
 * @returns Object with parsed blocks and any extra (invalid) keys found
 */

export interface ParseBlocksResult {
  blocks: Record<string, string>
  extraKeys: string[] // Invalid keys that don't match uppercase format
}

const BLOCK_KEY_REGEX = /^[A-Z_]+:$/

export function parseBlocks(text: string): ParseBlocksResult {
  const blocks: Record<string, string> = {}
  const extraKeys: string[] = []

  const lines = text.split('\n')

  let currentBlockKey: string | null = null
  let currentBlockContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Check if this line is a block key
    if (BLOCK_KEY_REGEX.test(trimmedLine)) {
      // Save previous block if exists
      if (currentBlockKey !== null) {
        // Trim trailing empty lines
        while (currentBlockContent.length > 0 && currentBlockContent[currentBlockContent.length - 1].trim() === '') {
          currentBlockContent.pop()
        }
        blocks[currentBlockKey] = currentBlockContent
          .map(l => l.trimEnd()) // Trim trailing spaces only
          .join('\n')
      }

      // Start new block
      currentBlockKey = trimmedLine.slice(0, -1) // Remove trailing ":"
      currentBlockContent = []

    } else if (trimmedLine.endsWith(':') && /^[a-zA-Z_]+:$/.test(trimmedLine)) {
      // Found a key-like pattern but not uppercase - track as extra
      const invalidKey = trimmedLine.slice(0, -1)
      if (!extraKeys.includes(invalidKey)) {
        extraKeys.push(invalidKey)
      }

      // Still collect content if we're in a block
      if (currentBlockKey !== null) {
        currentBlockContent.push(line)
      }

    } else {
      // Regular content line
      if (currentBlockKey !== null) {
        currentBlockContent.push(line)
      }
    }
  }

  // Save final block
  if (currentBlockKey !== null) {
    // Trim trailing empty lines
    while (currentBlockContent.length > 0 && currentBlockContent[currentBlockContent.length - 1].trim() === '') {
      currentBlockContent.pop()
    }
    blocks[currentBlockKey] = currentBlockContent
      .map(l => l.trimEnd())
      .join('\n')
  }

  return {
    blocks,
    extraKeys,
  }
}
