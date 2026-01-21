/**
 * Extract a named block from a template
 * Looks for ## BLOCK_NAME or # BLOCK_NAME or **BLOCK_NAME**
 * Returns content until the next all-caps header or end of string
 */
export function extractBlock(template: string, blockName: string): string | null {
  if (!template) return null

  // Patterns to match block headers
  const headerPatterns = [
    new RegExp(`^##\\s*${blockName}\\s*\n`, 'im'),
    new RegExp(`^#\\s*${blockName}\\s*\n`, 'im'),
    new RegExp(`\\*\\*${blockName}\\*\\*\\s*\n`, 'i'),
  ]

  let startIndex = -1
  let matchLength = 0

  // Find the start of the block
  for (const pattern of headerPatterns) {
    const match = template.match(pattern)
    if (match && match.index !== undefined) {
      startIndex = match.index + match[0].length
      matchLength = match[0].length
      break
    }
  }

  if (startIndex === -1) return null

  // Find the next section header (## or # followed by all-caps words, or **WORD**)
  const nextHeaderPattern = /\n(?:#{1,2}\s*[A-Z][A-Z\s]+|\*\*[A-Z][A-Z\s]+\*\*)/
  const remainingText = template.slice(startIndex)
  const nextMatch = remainingText.match(nextHeaderPattern)

  const endIndex = nextMatch?.index !== undefined
    ? startIndex + nextMatch.index
    : template.length

  const content = template.slice(startIndex, endIndex).trim()
  return content || null
}

/**
 * Check if template has OUTPUT FORMAT block
 */
export function hasOutputFormat(template: string): boolean {
  return extractBlock(template, 'OUTPUT FORMAT') !== null
}

/**
 * Check if template has QC or QUALITY CHECK block
 */
export function hasQualityCheck(template: string): boolean {
  return extractBlock(template, 'QC') !== null ||
         extractBlock(template, 'QUALITY CHECK') !== null ||
         extractBlock(template, 'QUALITY CONTROL') !== null
}

/**
 * Check if template has UNCERTAINTY POLICY block
 */
export function hasUncertaintyPolicy(template: string): boolean {
  return extractBlock(template, 'UNCERTAINTY POLICY') !== null ||
         extractBlock(template, 'UNCERTAINTY') !== null
}

export interface ContractIndicators {
  hasOutputFormat: boolean
  hasQualityCheck: boolean
  hasUncertaintyPolicy: boolean
  outputFormatContent: string | null
}

/**
 * Get all contract indicators for a template
 */
export function getContractIndicators(template: string): ContractIndicators {
  return {
    hasOutputFormat: hasOutputFormat(template),
    hasQualityCheck: hasQualityCheck(template),
    hasUncertaintyPolicy: hasUncertaintyPolicy(template),
    outputFormatContent: extractBlock(template, 'OUTPUT FORMAT')
  }
}
