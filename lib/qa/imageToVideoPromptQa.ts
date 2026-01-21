// Image-to-Video (I2V) Prompt QA Standards v0.1
// Deterministic structural QA + scoring for I2V prompts (preservation-focused)

import type { Snippet } from '@/lib/types'

// Types
export interface I2VQaIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

export interface I2VQaResult {
  level: 'draft' | 'verified'
  score: number
  issues: I2VQaIssue[]
  checks: Record<string, boolean>
  subtype: 'image_to_video'
}

export interface I2VQaChecks {
  hasSourceImage: boolean
  hasPreservationRules: boolean
  hasMotion: boolean
  hasTiming: boolean
  hasStyleContinuity: boolean
  hasConstraints: boolean
  hasOutputSettings: boolean
}

// Preservation anchor keywords (grouped by category)
const PRESERVATION_ANCHORS = {
  identity: ['same person', 'same face', 'identity', 'no identity change', 'maintain identity', 'preserve face'],
  outfit: ['outfit', 'clothing', 'wardrobe', 'costume', 'attire', 'same outfit'],
  objects: ['object', 'prop', 'logo', 'product', 'same object', 'maintain object'],
  background: ['background', 'composition', 'scene stays the same', 'maintain background', 'preserve background', 'same setting'],
  lighting: ['lighting', 'exposure', 'same lighting', 'maintain lighting', 'preserve lighting', 'consistent lighting'],
  colorPalette: ['color palette', 'colors remain', 'same colors', 'maintain colors', 'preserve colors', 'color consistency'],
  style: ['style', 'rendering', 'same style', 'maintain style', 'preserve style', 'style consistency', 'visual style']
}

// Stability constraint keywords
const STABILITY_KEYWORDS = [
  'no flicker',
  'no morphing',
  'no warping',
  'no jitter',
  'no sudden scene change',
  'no identity change',
  'no extra limbs',
  'no deformation',
  'no artifacts',
  'stable',
  'consistent',
  'smooth'
]

// Motion keywords (reused from video QA)
const CAMERA_MOTION_KEYWORDS = [
  'pan', 'tilt', 'dolly', 'zoom', 'tracking shot', 'handheld',
  'static camera', 'crane shot', 'orbit', 'aerial view',
  'tracking', 'static', 'crane', 'aerial', 'push in', 'pull out'
]

const SUBJECT_MOTION_KEYWORDS = [
  'blink', 'breathe', 'hair sway', 'subtle movement', 'turn head',
  'wave', 'walk', 'cloth flutter', 'slight motion', 'gentle movement',
  'running', 'turning', 'speaking', 'gesturing'
]

/**
 * Detect presence of 7 required I2V blocks
 */
export function detectI2VBlocks(text: string): I2VQaChecks {
  if (!text || text.trim() === '') {
    return {
      hasSourceImage: false,
      hasPreservationRules: false,
      hasMotion: false,
      hasTiming: false,
      hasStyleContinuity: false,
      hasConstraints: false,
      hasOutputSettings: false
    }
  }

  // SOURCE IMAGE (aliases: REFERENCE IMAGE, INPUT IMAGE)
  const hasSourceImage =
    /##?\s*source\s+image[\s:]/i.test(text) ||
    /\n\s*source\s+image\s*[:]/i.test(text) ||
    /##?\s*reference\s+image[\s:]/i.test(text) ||
    /##?\s*input\s+image[\s:]/i.test(text)

  // PRESERVATION RULES (aliases: LOCK, KEEP, DO NOT CHANGE)
  const hasPreservationRules =
    /##?\s*preservation\s+rules[\s:]/i.test(text) ||
    /\n\s*preservation\s+rules\s*[:]/i.test(text) ||
    /##?\s*lock[\s:]/i.test(text) ||
    /##?\s*keep[\s:]/i.test(text) ||
    /##?\s*do\s+not\s+change[\s:]/i.test(text) ||
    /##?\s*what\s+to\s+keep[\s:]/i.test(text)

  // MOTION (aliases: MOVEMENT, CAMERA MOVEMENT)
  const hasMotion =
    /##?\s*motion[\s:]/i.test(text) ||
    /\n\s*motion\s*[:]/i.test(text) ||
    /##?\s*movement[\s:]/i.test(text) ||
    /##?\s*camera\s+movement[\s:]/i.test(text)

  // TIMING (aliases: DURATION, VIDEO LENGTH)
  const hasTiming =
    /##?\s*timing[\s:]/i.test(text) ||
    /\n\s*timing\s*[:]/i.test(text) ||
    /##?\s*duration[\s:]/i.test(text) ||
    /##?\s*video\s+length[\s:]/i.test(text)

  // STYLE CONTINUITY (aliases: MATCH STYLE, KEEP STYLE)
  const hasStyleContinuity =
    /##?\s*style\s+continuity[\s:]/i.test(text) ||
    /\n\s*style\s+continuity\s*[:]/i.test(text) ||
    /##?\s*match\s+style[\s:]/i.test(text) ||
    /##?\s*keep\s+style[\s:]/i.test(text) ||
    /##?\s*maintain\s+style[\s:]/i.test(text)

  // CONSTRAINTS (aliases: WHAT TO AVOID, NEGATIVE PROMPT)
  const hasConstraints =
    /##?\s*constraints[\s:]/i.test(text) ||
    /\n\s*constraints\s*[:]/i.test(text) ||
    /what\s+to\s+avoid/i.test(text) ||
    /##?\s*negative\s+prompt[\s:]/i.test(text)

  // OUTPUT SETTINGS (aliases: SETTINGS, PARAMETERS, EXPORT SETTINGS)
  const hasOutputSettings =
    /##?\s*output\s+settings[\s:]/i.test(text) ||
    /\n\s*output\s+settings\s*[:]/i.test(text) ||
    /##?\s*settings[\s:]/i.test(text) ||
    /##?\s*parameters[\s:]/i.test(text) ||
    /##?\s*export\s+settings[\s:]/i.test(text)

  return {
    hasSourceImage,
    hasPreservationRules,
    hasMotion,
    hasTiming,
    hasStyleContinuity,
    hasConstraints,
    hasOutputSettings
  }
}

/**
 * Extract block content between header and next header (reused logic)
 */
export function extractBlock(text: string, blockNames: string[]): string | null {
  if (!text || blockNames.length === 0) return null

  // Create regex pattern for any of the block names
  const blockPattern = blockNames.map(name => name.replace(/\s+/g, '\\s+')).join('|')
  const headerRegex = new RegExp(`##?\\s*(${blockPattern})\\s*[:]*`, 'i')

  const match = text.match(headerRegex)
  if (!match) return null

  const startIndex = match.index! + match[0].length

  // Find next header (## or single line uppercase)
  const remainingText = text.substring(startIndex)
  const nextHeaderMatch = remainingText.match(/\n##?\s+[A-Z]/i)

  const endIndex = nextHeaderMatch
    ? startIndex + nextHeaderMatch.index!
    : text.length

  return text.substring(startIndex, endIndex).trim()
}

/**
 * Count preservation anchors in PRESERVATION RULES block
 * Returns count of matched anchor categories
 */
export function countPreservationAnchors(text: string): number {
  if (!text || text.trim() === '') return 0

  const lowerText = text.toLowerCase()
  let count = 0

  // Check each category - count if ANY keyword in that category matches
  for (const category of Object.values(PRESERVATION_ANCHORS)) {
    const hasAnchorInCategory = category.some(keyword => lowerText.includes(keyword))
    if (hasAnchorInCategory) {
      count++
    }
  }

  return count
}

/**
 * Check if CONSTRAINTS block has stability keywords
 */
export function hasStabilityConstraint(text: string): boolean {
  if (!text || text.trim() === '') return false

  const lowerText = text.toLowerCase()
  return STABILITY_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

/**
 * Check for motion keywords in text
 */
export function hasMotionSignal(text: string): boolean {
  if (!text) return false

  const lowerText = text.toLowerCase()

  const hasCameraMotion = CAMERA_MOTION_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  )

  const hasSubjectMotion = SUBJECT_MOTION_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  )

  return hasCameraMotion || hasSubjectMotion
}

/**
 * Check for timing signal (duration in seconds)
 */
export function hasTimingSignal(text: string): boolean {
  if (!text) return false
  // Must have duration with seconds
  return /\b\d+\s*(seconds?|secs?|s\b)/i.test(text)
}

/**
 * Validate OUTPUT SETTINGS has required parameters
 */
export function validateI2VOutputSettings(text: string, hasOutputSettings: boolean): I2VQaIssue[] {
  if (!hasOutputSettings) {
    return []
  }

  const lowerText = text.toLowerCase()

  // Check for aspect ratio
  const hasAspectRatio =
    lowerText.includes('--ar') ||
    lowerText.includes('aspect ratio') ||
    /\b\d+:\d+\b/.test(text)

  // Check for resolution
  const hasResolution =
    /\d+x\d+/.test(text) ||
    /\d+p\b/.test(text) ||
    /4k\b/i.test(text) ||
    lowerText.includes('resolution')

  // Check for FPS
  const hasFps =
    /\d+\s*fps/i.test(text) ||
    lowerText.includes('frame rate') ||
    lowerText.includes('frames per second')

  const issues: I2VQaIssue[] = []

  // Error if none of the required settings present
  if (!hasAspectRatio && !hasResolution && !hasFps) {
    issues.push({
      level: 'error',
      code: 'OUTPUT_SETTINGS_INCOMPLETE',
      message: 'OUTPUT SETTINGS must include aspect ratio, resolution, or fps'
    })
  }

  // Warning if FPS missing (important for I2V stability)
  if (!hasFps && (hasAspectRatio || hasResolution)) {
    issues.push({
      level: 'warning',
      code: 'FPS_NOT_SPECIFIED',
      message: 'FPS not specified - recommended for smooth I2V output'
    })
  }

  return issues
}

/**
 * Scan for I2V-specific contradictions
 */
export function scanI2VContradictions(text: string): I2VQaIssue[] {
  const issues: I2VQaIssue[] = []
  const lowerText = text.toLowerCase()

  // Contradiction pairs specific to I2V
  const contradictions = [
    {
      terms: ['keep exactly the same', 'dramatic transformation'],
      code: 'CONTRADICTION_PRESERVE_TRANSFORM',
      message: 'Contradiction: "keep exactly the same" AND "dramatic transformation" both present'
    },
    {
      terms: ['no changes', 'completely change'],
      code: 'CONTRADICTION_NO_CHANGE_COMPLETELY',
      message: 'Contradiction: "no changes" AND "completely change" both present'
    },
    {
      terms: ['no camera movement', 'handheld'],
      code: 'CONTRADICTION_STATIC_HANDHELD',
      message: 'Contradiction: "no camera movement" AND "handheld" both present'
    },
    {
      terms: ['static camera', 'dynamic camera'],
      code: 'CONTRADICTION_STATIC_DYNAMIC',
      message: 'Contradiction: "static camera" AND "dynamic camera" both present'
    },
    {
      terms: ['single continuous shot', 'multiple scene changes'],
      code: 'CONTRADICTION_CONTINUOUS_MULTIPLE',
      message: 'Contradiction: "single continuous shot" AND "multiple scene changes" both present'
    },
    {
      terms: ['single continuous shot', 'scene changes'],
      code: 'CONTRADICTION_CONTINUOUS_CHANGES',
      message: 'Contradiction: "single continuous shot" AND "scene changes" both present'
    }
  ]

  // Check for maintain style vs. switch style contradictions
  const maintainStyle = lowerText.includes('maintain exact style') || lowerText.includes('match style')
  const switchStyle = lowerText.includes('switch to cartoon') || lowerText.includes('anime') ||
                      lowerText.includes('animation style')
  if (maintainStyle && switchStyle) {
    issues.push({
      level: 'error',
      code: 'CONTRADICTION_MAINTAIN_SWITCH_STYLE',
      message: 'Contradiction: "maintain style" AND "switch to cartoon/anime" both present'
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
 * Score I2V prompt for preservation quality (0-100)
 */
export function scoreI2VPrompt(
  text: string,
  checks: I2VQaChecks,
  preservationAnchorCount: number,
  hasStabilityConstraint: boolean
): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}
  const lowerText = text.toLowerCase()

  // Structural Completeness: 30 points (7 blocks)
  const structuralPoints = {
    hasSourceImage: 4,
    hasPreservationRules: 5,
    hasMotion: 4,
    hasTiming: 4,
    hasStyleContinuity: 5,
    hasConstraints: 4,
    hasOutputSettings: 4
  }

  let structural = 0
  for (const [key, points] of Object.entries(structuralPoints)) {
    if (checks[key as keyof I2VQaChecks]) {
      structural += points
    }
  }
  breakdown.structural = structural
  score += structural

  // Preservation Explicitness: 30 points (based on anchor count)
  // 7 anchor categories: 30/7 = ~4.3 pts each
  const preservationScore = Math.min(30, preservationAnchorCount * 4.3)
  breakdown.preservationAnchors = Math.round(preservationScore)
  score += preservationScore

  // Motion Clarity: 15 points
  let motionScore = 0
  if (checks.hasMotion) {
    const cameraMatches = CAMERA_MOTION_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
    const subjectMatches = SUBJECT_MOTION_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))

    if (cameraMatches.length >= 1) motionScore += 8
    if (subjectMatches.length >= 1) motionScore += 7
  }
  breakdown.motion = motionScore
  score += motionScore

  // Timing Clarity: 10 points
  let timingScore = 0
  if (/\b\d+\s*(seconds?|secs?|s\b)/i.test(text)) {
    timingScore = 10
  } else if (checks.hasTiming) {
    timingScore = 3 // Has timing block but no explicit duration
  }
  breakdown.timing = timingScore
  score += timingScore

  // Stability Constraints: 10 points
  const stabilityScore = hasStabilityConstraint ? 10 : 0
  breakdown.stabilityConstraints = stabilityScore
  score += stabilityScore

  // Output Settings: 5 points
  let outputScore = 0
  if (checks.hasOutputSettings) {
    // Check for completeness
    const hasAspectRatio = lowerText.includes('--ar') || lowerText.includes('aspect ratio') || /\b\d+:\d+\b/.test(text)
    const hasResolution = /\d+x\d+/.test(text) || /\d+p\b/.test(text) || /4k\b/i.test(text)
    const hasFps = /\d+\s*fps/i.test(text) || lowerText.includes('frame rate')

    if (hasAspectRatio || hasResolution) outputScore += 3
    if (hasFps) outputScore += 2
  }
  breakdown.outputSettings = outputScore
  score += outputScore

  // Deduct for contradictions (max -30)
  const contradictions = scanI2VContradictions(text)
  const contradictionPenalty = Math.min(30, contradictions.length * 10)
  breakdown.contradictionPenalty = -contradictionPenalty
  score -= contradictionPenalty

  // Cap at 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, breakdown }
}

/**
 * Main entry point: Evaluate I2V prompt for QA
 */
export function evaluateImageToVideoPrompt(options: {
  text: string
  inputs?: Record<string, string>
  snippetMeta?: Snippet
}): I2VQaResult {
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
        hasSourceImage: false,
        hasPreservationRules: false,
        hasMotion: false,
        hasTiming: false,
        hasStyleContinuity: false,
        hasConstraints: false,
        hasOutputSettings: false
      },
      subtype: 'image_to_video'
    }
  }

  // Detect blocks
  const checks = detectI2VBlocks(text)

  // Collect issues
  const issues: I2VQaIssue[] = []

  // Critical: All 7 blocks are REQUIRED for I2V (errors if missing)
  if (!checks.hasSourceImage) {
    issues.push({
      level: 'error',
      code: 'MISSING_SOURCE_IMAGE',
      message: 'Missing SOURCE IMAGE block: Specify the reference/input image'
    })
  }
  if (!checks.hasPreservationRules) {
    issues.push({
      level: 'error',
      code: 'MISSING_PRESERVATION_RULES',
      message: 'Missing PRESERVATION RULES block: Define what to keep from the source image'
    })
  }
  if (!checks.hasMotion) {
    issues.push({
      level: 'error',
      code: 'MISSING_MOTION',
      message: 'Missing MOTION block: Describe desired movement'
    })
  }
  if (!checks.hasTiming) {
    issues.push({
      level: 'error',
      code: 'MISSING_TIMING',
      message: 'Missing TIMING block: Specify video duration'
    })
  }
  if (!checks.hasStyleContinuity) {
    issues.push({
      level: 'error',
      code: 'MISSING_STYLE_CONTINUITY',
      message: 'Missing STYLE CONTINUITY block: Ensure style consistency'
    })
  }
  if (!checks.hasConstraints) {
    issues.push({
      level: 'error',
      code: 'MISSING_CONSTRAINTS',
      message: 'Missing CONSTRAINTS block: Specify what to avoid'
    })
  }
  if (!checks.hasOutputSettings) {
    issues.push({
      level: 'error',
      code: 'MISSING_OUTPUT_SETTINGS',
      message: 'Missing OUTPUT SETTINGS block: Define technical parameters'
    })
  }

  // Validate preservation explicitness
  const preservationBlock = extractBlock(text, [
    'PRESERVATION RULES',
    'LOCK',
    'KEEP',
    'DO NOT CHANGE',
    'WHAT TO KEEP'
  ])
  const preservationAnchorCount = preservationBlock
    ? countPreservationAnchors(preservationBlock)
    : 0

  if (checks.hasPreservationRules && preservationAnchorCount < 3) {
    issues.push({
      level: 'error',
      code: 'INSUFFICIENT_PRESERVATION_ANCHORS',
      message: `PRESERVATION RULES must include at least 3 anchor categories (found ${preservationAnchorCount}). Examples: identity, outfit, objects, background, lighting, colors, style.`
    })
  }

  // Validate stability constraints
  const constraintsBlock = extractBlock(text, [
    'CONSTRAINTS',
    'WHAT TO AVOID',
    'NEGATIVE PROMPT'
  ])
  const hasStability = constraintsBlock
    ? hasStabilityConstraint(constraintsBlock)
    : false

  if (checks.hasConstraints && !hasStability) {
    issues.push({
      level: 'error',
      code: 'MISSING_STABILITY_CONSTRAINT',
      message: 'CONSTRAINTS must include at least one stability keyword (e.g., "no flicker", "no morphing", "no warping", "no jitter")'
    })
  }

  // Validate motion explicitness
  if (checks.hasMotion) {
    const motionBlock = extractBlock(text, ['MOTION', 'MOVEMENT', 'CAMERA MOVEMENT'])
    const textToCheck = motionBlock || text
    if (!hasMotionSignal(textToCheck)) {
      issues.push({
        level: 'error',
        code: 'MOTION_NOT_EXPLICIT',
        message: 'MOTION block exists but no motion keywords found (e.g., pan, tilt, blink, subtle movement)'
      })
    }
  }

  // Validate timing explicitness
  if (checks.hasTiming) {
    const timingBlock = extractBlock(text, ['TIMING', 'DURATION', 'VIDEO LENGTH'])
    const textToCheck = timingBlock || text
    if (!hasTimingSignal(textToCheck)) {
      issues.push({
        level: 'error',
        code: 'TIMING_NOT_EXPLICIT',
        message: 'TIMING block exists but no duration found (e.g., "5 seconds", "3s")'
      })
    }
  }

  // Validate output settings
  const outputSettingsIssues = validateI2VOutputSettings(text, checks.hasOutputSettings)
  issues.push(...outputSettingsIssues)

  // Scan contradictions
  const contradictionIssues = scanI2VContradictions(text)
  issues.push(...contradictionIssues)

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
  const { score } = scoreI2VPrompt(text, checks, preservationAnchorCount, hasStability)

  // Determine level
  const errorCount = issues.filter(i => i.level === 'error').length
  const level: 'draft' | 'verified' = score >= 85 && errorCount === 0 ? 'verified' : 'draft'

  return {
    level,
    score,
    issues,
    checks: {
      hasSourceImage: checks.hasSourceImage,
      hasPreservationRules: checks.hasPreservationRules,
      hasMotion: checks.hasMotion,
      hasTiming: checks.hasTiming,
      hasStyleContinuity: checks.hasStyleContinuity,
      hasConstraints: checks.hasConstraints,
      hasOutputSettings: checks.hasOutputSettings
    },
    subtype: 'image_to_video'
  }
}
