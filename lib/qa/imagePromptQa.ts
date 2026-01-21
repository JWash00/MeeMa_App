// Image Prompt QA Standards v0.1
// Deterministic structural QA + scoring for image prompts (Midjourney/SDXL style)

import type { Snippet } from '@/lib/types'

// Types
export interface ImageQaIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

export interface ImageQaResult {
  level: 'draft' | 'verified'
  score: number
  issues: ImageQaIssue[]
  checks: Record<string, boolean>
  modality: 'image'
}

export interface ImageQaChecks {
  hasSubject: boolean
  hasStyle: boolean
  hasComposition: boolean
  hasDetails: boolean
  hasConstraints: boolean
  hasOutputSettings: boolean
}

// Keyword sets for scoring
const CAMERA_KEYWORDS = [
  'close-up', 'wide shot', 'top-down', "bird's eye", 'low angle',
  'eye level', 'dutch angle', 'aerial view', 'overhead', 'extreme close-up'
]

const LIGHTING_KEYWORDS = [
  'soft light', 'rim light', 'golden hour', 'backlighting',
  'studio lighting', 'natural light', 'dramatic lighting', 'ambient light'
]

const COLOR_KEYWORDS = [
  'monochrome', 'pastel', 'neon', 'vibrant', 'muted',
  'desaturated', 'warm tones', 'cool tones', 'sepia', 'black and white'
]

const STYLE_KEYWORDS = [
  'cinematic photo', 'film still', '3d render', 'watercolor',
  'oil painting', 'digital art', 'concept art', 'photorealistic',
  'anime', 'line art', 'pencil sketch', 'vector illustration'
]

/**
 * Detect presence of 6 required image blocks
 */
export function detectImageBlocks(text: string): ImageQaChecks {
  if (!text || text.trim() === '') {
    return {
      hasSubject: false,
      hasStyle: false,
      hasComposition: false,
      hasDetails: false,
      hasConstraints: false,
      hasOutputSettings: false
    }
  }

  const lowerText = text.toLowerCase()

  // Flexible block detection with aliases
  const hasSubject = /##?\s*subject[\s:]/i.test(text) || /\n\s*subject\s*[:]/i.test(text)
  const hasStyle = /##?\s*style[\s:]/i.test(text) || /\n\s*style\s*[:]/i.test(text)
  const hasComposition = /##?\s*composition[\s:]/i.test(text) || /\n\s*composition\s*[:]/i.test(text)
  const hasDetails = /##?\s*details[\s:]/i.test(text) || /\n\s*details\s*[:]/i.test(text)

  // CONSTRAINTS accepts "WHAT TO AVOID" alias
  const hasConstraints =
    /##?\s*constraints[\s:]/i.test(text) ||
    /\n\s*constraints\s*[:]/i.test(text) ||
    /what\s+to\s+avoid/i.test(text)

  // OUTPUT SETTINGS accepts "SETTINGS" or "PARAMETERS" aliases
  const hasOutputSettings =
    /##?\s*output\s+settings[\s:]/i.test(text) ||
    /\n\s*output\s+settings\s*[:]/i.test(text) ||
    /##?\s*settings[\s:]/i.test(text) ||
    /##?\s*parameters[\s:]/i.test(text)

  return {
    hasSubject,
    hasStyle,
    hasComposition,
    hasDetails,
    hasConstraints,
    hasOutputSettings
  }
}

/**
 * Scan for critical contradictions (errors if both terms present)
 */
export function scanContradictions(text: string): ImageQaIssue[] {
  const issues: ImageQaIssue[] = []
  const lowerText = text.toLowerCase()

  // Contradiction pairs
  const contradictions = [
    {
      terms: ['photorealistic', 'cartoon'],
      code: 'CONTRADICTION_PHOTOREALISTIC_CARTOON',
      message: 'Contradiction detected: "photorealistic" AND "cartoon" both present'
    },
    {
      terms: ['vector', 'photorealistic'],
      code: 'CONTRADICTION_VECTOR_PHOTOREALISTIC',
      message: 'Contradiction detected: "vector" AND "photorealistic" both present'
    },
    {
      terms: ['vector', 'photo-realistic'],
      code: 'CONTRADICTION_VECTOR_PHOTOREALISTIC',
      message: 'Contradiction detected: "vector" AND "photo-realistic" both present'
    },
    {
      terms: ['wide-angle', 'close-up'],
      code: 'CONTRADICTION_WIDE_CLOSEUP',
      message: 'Contradiction detected: "wide-angle" AND "close-up" both present'
    },
    {
      terms: ['macro', 'wide shot'],
      code: 'CONTRADICTION_MACRO_WIDE',
      message: 'Contradiction detected: "macro" AND "wide shot" both present'
    }
  ]

  // Check flat/2D vs hyperrealistic/photorealistic
  const hasFlat = lowerText.includes('flat') || lowerText.includes('2d')
  const hasHyperRealistic = lowerText.includes('hyperrealistic') || lowerText.includes('photorealistic')
  if (hasFlat && hasHyperRealistic) {
    issues.push({
      level: 'error',
      code: 'CONTRADICTION_FLAT_HYPERREALISTIC',
      message: 'Contradiction detected: "flat/2D" AND "hyperrealistic/photorealistic" both present'
    })
  }

  // Check each contradiction pair
  for (const contradiction of contradictions) {
    const allPresent = contradiction.terms.every(term => lowerText.includes(term))
    if (allPresent) {
      issues.push({
        level: 'error',
        code: contradiction.code,
        message: contradiction.message
      })
    }
  }

  return issues
}

/**
 * Validate OUTPUT SETTINGS block has required parameters
 */
export function validateOutputSettings(text: string, hasOutputSettings: boolean): ImageQaIssue[] {
  if (!hasOutputSettings) {
    return []
  }

  const lowerText = text.toLowerCase()

  // Check for aspect ratio indicators
  const hasAspectRatio =
    lowerText.includes('--ar') ||
    lowerText.includes('aspect ratio') ||
    /\b\d+:\d+\b/.test(text) // matches patterns like "16:9", "1:1"

  // Check for resolution indicators
  const hasResolution =
    /\d+x\d+/.test(text) || // matches "1024x1024"
    lowerText.includes('resolution') ||
    lowerText.includes('width') ||
    lowerText.includes('height')

  if (!hasAspectRatio && !hasResolution) {
    return [{
      level: 'error',
      code: 'MISSING_REQUIRED_PARAMETER',
      message: 'OUTPUT SETTINGS must include aspect ratio or resolution'
    }]
  }

  return []
}

/**
 * Score image prompt for consistency/repeatability (0-100)
 */
export function scoreImagePrompt(
  text: string,
  checks: ImageQaChecks
): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}

  // Structural Completeness: 40 points
  const structuralPoints = {
    hasSubject: 7,
    hasStyle: 7,
    hasComposition: 7,
    hasDetails: 6,
    hasConstraints: 6,
    hasOutputSettings: 7
  }

  let structural = 0
  for (const [key, points] of Object.entries(structuralPoints)) {
    if (checks[key as keyof ImageQaChecks]) {
      structural += points
    }
  }
  breakdown.structural = structural
  score += structural

  // Parameter Explicitness: 25 points
  const lowerText = text.toLowerCase()

  // Camera angle/framing: 8 pts
  const cameraMatches = CAMERA_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const cameraScore = Math.min(8, cameraMatches.length * 2) // 2 pts per keyword, max 8
  breakdown.camera = cameraScore
  score += cameraScore

  // Lighting: 8 pts
  const lightingMatches = LIGHTING_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const lightingScore = Math.min(8, lightingMatches.length * 2)
  breakdown.lighting = lightingScore
  score += lightingScore

  // Color palette: 9 pts
  const colorMatches = COLOR_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const colorScore = Math.min(9, colorMatches.length * 2)
  breakdown.color = colorScore
  score += colorScore

  // Style Locking: 20 points
  const styleMatches = STYLE_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const styleScore = Math.min(20, styleMatches.length * 5) // 5 pts per keyword, max 20
  breakdown.styleLocking = styleScore
  score += styleScore

  // Constraint Clarity: 15 points
  // Count "avoid" items in CONSTRAINTS block
  let constraintScore = 0
  if (checks.hasConstraints) {
    const avoidMatches = (text.match(/\b(no|avoid|don't|without)\b/gi) || []).length
    if (avoidMatches >= 2) {
      constraintScore = 15
    } else if (avoidMatches === 1) {
      constraintScore = 8
    }
  }
  breakdown.constraints = constraintScore
  score += constraintScore

  // Deduct for contradictions (handled separately, max -30)
  const contradictions = scanContradictions(text)
  const contradictionPenalty = Math.min(30, contradictions.length * 10)
  breakdown.contradictionPenalty = -contradictionPenalty
  score -= contradictionPenalty

  // Cap at 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, breakdown }
}

/**
 * Main entry point: Evaluate image prompt for QA
 */
export function evaluateImagePrompt(options: {
  text: string
  inputs?: Record<string, string>
  snippetMeta?: Snippet
}): ImageQaResult {
  const { text, inputs, snippetMeta } = options

  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      level: 'draft',
      score: 0,
      issues: [{
        level: 'warning',
        code: 'EMPTY_PROMPT',
        message: 'Prompt text is empty'
      }],
      checks: {
        hasSubject: false,
        hasStyle: false,
        hasComposition: false,
        hasDetails: false,
        hasConstraints: false,
        hasOutputSettings: false
      },
      modality: 'image'
    }
  }

  // Detect blocks
  const checks = detectImageBlocks(text)

  // Collect issues
  const issues: ImageQaIssue[] = []

  // Add warnings for missing blocks
  if (!checks.hasSubject) {
    issues.push({
      level: 'warning',
      code: 'MISSING_SUBJECT',
      message: 'Missing SUBJECT block: Define what to generate'
    })
  }
  if (!checks.hasStyle) {
    issues.push({
      level: 'warning',
      code: 'MISSING_STYLE',
      message: 'Missing STYLE block: Specify visual style/medium'
    })
  }
  if (!checks.hasComposition) {
    issues.push({
      level: 'warning',
      code: 'MISSING_COMPOSITION',
      message: 'Missing COMPOSITION block: Describe framing/layout'
    })
  }
  if (!checks.hasDetails) {
    issues.push({
      level: 'warning',
      code: 'MISSING_DETAILS',
      message: 'Missing DETAILS block: Add specific elements'
    })
  }
  if (!checks.hasConstraints) {
    issues.push({
      level: 'warning',
      code: 'MISSING_CONSTRAINTS',
      message: 'Missing CONSTRAINTS block: Specify what to avoid'
    })
  }
  if (!checks.hasOutputSettings) {
    issues.push({
      level: 'warning',
      code: 'MISSING_OUTPUT_SETTINGS',
      message: 'Missing OUTPUT SETTINGS block: Define technical parameters'
    })
  }

  // Scan contradictions (errors)
  const contradictionIssues = scanContradictions(text)
  issues.push(...contradictionIssues)

  // Validate output settings (errors)
  const outputSettingsIssues = validateOutputSettings(text, checks.hasOutputSettings)
  issues.push(...outputSettingsIssues)

  // Check placeholder completeness (workflow only)
  if (snippetMeta?.type === 'workflow' && inputs) {
    const placeholders = text.match(/\{\{([^}]+)\}\}/g) || []
    const placeholderKeys = placeholders.map(p => p.replace(/[{}]/g, '').trim())

    for (const key of placeholderKeys) {
      const value = inputs[key]
      if (!value || value.trim() === '') {
        issues.push({
          level: 'error',
          code: `MISSING_REQUIRED_INPUT:${key}`,
          message: `Placeholder {{${key}}} is not filled`
        })
      }
    }
  }

  // Compute score
  const { score } = scoreImagePrompt(text, checks)

  // Determine level
  const errorCount = issues.filter(i => i.level === 'error').length
  const level: 'draft' | 'verified' = score >= 85 && errorCount === 0 ? 'verified' : 'draft'

  return {
    level,
    score,
    issues,
    checks: {
      hasSubject: checks.hasSubject,
      hasStyle: checks.hasStyle,
      hasComposition: checks.hasComposition,
      hasDetails: checks.hasDetails,
      hasConstraints: checks.hasConstraints,
      hasOutputSettings: checks.hasOutputSettings
    },
    modality: 'image'
  }
}
