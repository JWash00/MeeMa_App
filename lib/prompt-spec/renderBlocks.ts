/**
 * Renders structured blocks back to text format
 *
 * @param blocks - Record of block key to content
 * @param order - Optional array specifying block order (keys not in order are appended)
 * @returns Formatted text with blocks in specified order
 */

export function renderBlocks(
  blocks: Record<string, string>,
  order?: string[]
): string {
  const allKeys = Object.keys(blocks)

  // Determine final order
  let orderedKeys: string[]

  if (order) {
    // Use provided order, then append remaining keys
    const remainingKeys = allKeys.filter(k => !order.includes(k))
    orderedKeys = [...order.filter(k => allKeys.includes(k)), ...remainingKeys]
  } else {
    // Use natural object key order
    orderedKeys = allKeys
  }

  // Render blocks
  const sections = orderedKeys.map(key => {
    const content = blocks[key]
    return `${key}:\n${content}`
  })

  return sections.join('\n\n')
}
