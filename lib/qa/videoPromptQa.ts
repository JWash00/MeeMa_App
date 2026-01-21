// Video Prompt QA Standards v0.1
// Deterministic structural QA + scoring for video prompts (Runway/Pika/Sora style)

import type { Snippet } from '@/lib/types'
import type { VideoSubtype } from '@/lib/prompttest/videoSubtype'

// Types
export interface VideoQaIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

export interface VideoQaResult {
  level: 'draft' | 'verified'
  score: number
  issues: VideoQaIssue[]
  checks: Record<string, boolean>
  modality: 'video'
  subtype?: VideoSubtype // Optional for backwards compatibility
}

export interface VideoQaChecks {
  hasScene: boolean
  hasSubject: boolean
  hasMotion: boolean
  hasTiming: boolean
  hasStyle: boolean
  hasConstraints: boolean
  hasOutputSettings: boolean
}

// Keyword sets for scoring and validation
const CAMERA_MOTION_KEYWORDS = [
  'pan', 'tilt', 'dolly', 'zoom', 'tracking shot', 'handheld',
  'static camera', 'crane shot', 'orbit', 'aerial view', 'dutch angle',
  'tracking', 'static', 'crane', 'aerial'
]

const SUBJECT_MOTION_KEYWORDS = [
  'walking', 'running', 'turning', 'speaking', 'flying', 'rotating',
  'drifting', 'slow motion', 'jumping', 'dancing', 'gesturing'
]

const STYLE_KEYWORDS = [
  'cinematic', 'documentary', 'handheld realism', 'drone footage',
  'time-lapse', 'slow motion', 'film noir', 'vlog style'
]

const INSTABILITY_PHRASES = [
  'random movement', 'constantly changing', 'rapidly morphing',
  'chaotic transitions', 'unpredictable'
]

/**
 * Detect presence of 7 required video blocks
 */
export function detectVideoBlocks(text: string): VideoQaChecks {
  if (!text || text.trim() === '') {
    return {
      hasScene: false,
      hasSubject: false,
      hasMotion: false,
      hasTiming: false,
      hasStyle: false,
      hasConstraints: false,
      hasOutputSettings: false
    }
  }

  const lowerText = text.toLowerCase()

  // Flexible block detection with aliases
  const hasScene = /##?\s*scene[\s:]/i.test(text) || /\n\s*scene\s*[:]/i.test(text)
  const hasSubject = /##?\s*subject[\s:]/i.test(text) || /\n\s*subject\s*[:]/i.test(text)

  // MOTION accepts "CAMERA MOVEMENT" or "MOVEMENT" aliases
  const hasMotion =
    /##?\s*motion[\s:]/i.test(text) ||
    /\n\s*motion\s*[:]/i.test(text) ||
    /##?\s*camera\s+movement[\s:]/i.test(text) ||
    /##?\s*movement[\s:]/i.test(text)

  // TIMING accepts "DURATION", "VIDEO LENGTH", "PACING" aliases
  const hasTiming =
    /##?\s*timing[\s:]/i.test(text) ||
    /\n\s*timing\s*[:]/i.test(text) ||
    /##?\s*duration[\s:]/i.test(text) ||
    /##?\s*video\s+length[\s:]/i.test(text) ||
    /##?\s*pacing[\s:]/i.test(text)

  const hasStyle = /##?\s*style[\s:]/i.test(text) || /\n\s*style\s*[:]/i.test(text)

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
    hasScene,
    hasSubject,
    hasMotion,
    hasTiming,
    hasStyle,
    hasConstraints,
    hasOutputSettings
  }
}

/**
 * Extract block content between header and next header
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
 * Check for motion keywords in text
 */
export function hasMotionSignal(text: string): boolean {
  if (!text) return false

  const lowerText = text.toLowerCase()

  // Check for camera motion keywords
  const hasCameraMotion = CAMERA_MOTION_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  )

  // Check for subject motion keywords
  const hasSubjectMotion = SUBJECT_MOTION_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  )

  return hasCameraMotion || hasSubjectMotion
}

/**
 * Check for timing indicators in text
 */
export function hasTimingSignal(text: string): boolean {
  if (!text) return false

  const lowerText = text.toLowerCase()

  // Check for duration (seconds)
  const hasDuration = /\d+\s*(seconds?|secs?|s\b)/i.test(text)

  // Check for pacing keywords
  const pacingKeywords = ['slow', 'smooth', 'real-time', 'fast', 'gradual']
  const hasPacing = pacingKeywords.some(keyword => lowerText.includes(keyword))

  // Check for beats/structure
  const hasBeats =
    /\d+\s*beats?/i.test(text) ||
    /intro.*middle.*outro/i.test(text) ||
    /opening.*climax.*end/i.test(text)

  return hasDuration || hasPacing || hasBeats
}

/**
 * Scan for video-specific contradictions
 */
export function scanVideoContradictions(text: string): VideoQaIssue[] {
  const issues: VideoQaIssue[] = []
  const lowerText = text.toLowerCase()

  // Contradiction pairs
  const contradictions = [
    {
      terms: ['static camera', 'handheld'],
      code: 'CONTRADICTION_STATIC_HANDHELD',
      message: 'Contradiction detected: "static camera" AND "handheld" both present'
    },
    {
      terms: ['locked shot', 'rapid cuts'],
      code: 'CONTRADICTION_LOCKED_RAPID',
      message: 'Contradiction detected: "locked shot" AND "rapid cuts" both present'
    },
    {
      terms: ['locked shot', 'quick cuts'],
      code: 'CONTRADICTION_LOCKED_QUICK',
      message: 'Contradiction detected: "locked shot" AND "quick cuts" both present'
    },
    {
      terms: ['slow motion', 'time-lapse'],
      code: 'CONTRADICTION_SLOW_TIMELAPSE',
      message: 'Contradiction detected: "slow motion" AND "time-lapse" both present'
    },
    {
      terms: ['single continuous shot', 'multiple scene changes'],
      code: 'CONTRADICTION_CONTINUOUS_MULTIPLE',
      message: 'Contradiction detected: "single continuous shot" AND "multiple scene changes" both present'
    },
    {
      terms: ['single continuous shot', 'scene changes'],
      code: 'CONTRADICTION_CONTINUOUS_CHANGES',
      message: 'Contradiction detected: "single continuous shot" AND "scene changes" both present'
    }
  ]

  // Check cinematic realism vs cartoon/animation
  const hasCinematicRealism = lowerText.includes('cinematic realism')
  const hasCartoonOrAnimation = lowerText.includes('cartoon') || lowerText.includes('animation')
  if (hasCinematicRealism && hasCartoonOrAnimation) {
    issues.push({
      level: 'error',
      code: 'CONTRADICTION_CINEMATIC_CARTOON',
      message: 'Contradiction detected: "cinematic realism" AND "cartoon/animation" both present'
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
export function validateVideoOutputSettings(text: string, hasOutputSettings: boolean): VideoQaIssue[] {
  if (!hasOutputSettings) {
    return []
  }

  const lowerText = text.toLowerCase()

  // Check for aspect ratio indicators
  const hasAspectRatio =
    lowerText.includes('--ar') ||
    lowerText.includes('aspect ratio') ||
    /\b\d+:\d+\b/.test(text) // matches patterns like "16:9", "9:16"

  // Check for resolution indicators
  const hasResolution =
    /\d+x\d+/.test(text) || // matches "1920x1080"
    /\d+p\b/.test(text) || // matches "1080p", "4K"
    /4k\b/i.test(text) ||
    lowerText.includes('resolution')

  // Check for FPS indicators
  const hasFps =
    /\d+\s*fps/i.test(text) ||
    lowerText.includes('frame rate') ||
    lowerText.includes('frames per second')

  if (!hasAspectRatio && !hasResolution && !hasFps) {
    return [{
      level: 'error',
      code: 'MISSING_REQUIRED_PARAMETER',
      message: 'OUTPUT SETTINGS must include aspect ratio, resolution, or fps'
    }]
  }

  return []
}

/**
 * Check for instability warning phrases
 */
export function checkInstabilityWarnings(text: string): VideoQaIssue[] {
  if (!text) return []

  const lowerText = text.toLowerCase()
  const issues: VideoQaIssue[] = []

  for (const phrase of INSTABILITY_PHRASES) {
    if (lowerText.includes(phrase)) {
      issues.push({
        level: 'warning',
        code: `INSTABILITY_${phrase.toUpperCase().replace(/\s+/g, '_')}`,
        message: `Instability phrase detected: "${phrase}" may lead to unpredictable results`
      })
    }
  }

  return issues
}

/**
 * Score video prompt for consistency/repeatability (0-100)
 */
export function scoreVideoPrompt(
  text: string,
  checks: VideoQaChecks
): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}

  // Structural Completeness: 35 points (7 blocks × 5 pts)
  const structuralPoints = {
    hasScene: 5,
    hasSubject: 5,
    hasMotion: 5,
    hasTiming: 5,
    hasStyle: 5,
    hasConstraints: 5,
    hasOutputSettings: 5
  }

  let structural = 0
  for (const [key, points] of Object.entries(structuralPoints)) {
    if (checks[key as keyof VideoQaChecks]) {
      structural += points
    }
  }
  breakdown.structural = structural
  score += structural

  // Motion Clarity: 25 points
  const lowerText = text.toLowerCase()

  // Camera motion keywords: 12 pts
  const cameraMatches = CAMERA_MOTION_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const cameraScore = cameraMatches.length >= 2 ? 12 : (cameraMatches.length === 1 ? 6 : 0)
  breakdown.cameraMotion = cameraScore
  score += cameraScore

  // Subject motion keywords: 13 pts
  const subjectMatches = SUBJECT_MOTION_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const subjectScore = subjectMatches.length >= 2 ? 13 : (subjectMatches.length === 1 ? 7 : 0)
  breakdown.subjectMotion = subjectScore
  score += subjectScore

  // Timing Clarity: 20 points
  let timingScore = 0

  // Duration specified: 10 pts
  if (/\d+\s*(seconds?|secs?|s\b)/i.test(text)) {
    timingScore += 10
  }

  // Pacing specified: 5 pts
  const pacingKeywords = ['slow', 'smooth', 'real-time', 'fast', 'gradual']
  if (pacingKeywords.some(keyword => lowerText.includes(keyword))) {
    timingScore += 5
  }

  // Beats/structure specified: 5 pts
  if (/\d+\s*beats?/i.test(text) || /intro.*middle.*outro/i.test(text)) {
    timingScore += 5
  }

  breakdown.timing = timingScore
  score += timingScore

  // Style Consistency: 10 points
  const styleMatches = STYLE_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()))
  const styleScore = Math.min(10, styleMatches.length * 3)
  breakdown.styleLocking = styleScore
  score += styleScore

  // Constraint Clarity: 10 points
  let constraintScore = 0
  if (checks.hasConstraints) {
    const avoidMatches = (text.match(/\b(no|avoid|don't|without|not)\b/gi) || []).length
    if (avoidMatches >= 2) {
      constraintScore = 10
    } else if (avoidMatches === 1) {
      constraintScore = 5
    }
  }
  breakdown.constraints = constraintScore
  score += constraintScore

  // Deduct for contradictions (max -30)
  const contradictions = scanVideoContradictions(text)
  const contradictionPenalty = Math.min(30, contradictions.length * 10)
  breakdown.contradictionPenalty = -contradictionPenalty
  score -= contradictionPenalty

  // Deduct for instability warnings (max -15)
  const instabilityWarnings = checkInstabilityWarnings(text)
  const instabilityPenalty = Math.min(15, instabilityWarnings.length * 5)
  breakdown.instabilityPenalty = -instabilityPenalty
  score -= instabilityPenalty

  // Cap at 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, breakdown }
}

/**
 * Main entry point: Evaluate video prompt for QA
 */
export function evaluateVideoPrompt(options: {
  text: string
  inputs?: Record<string, string>
  snippetMeta?: Snippet
  subtype?: VideoSubtype
}): VideoQaResult {
  const { text, inputs, snippetMeta, subtype } = options

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
        hasScene: false,
        hasSubject: false,
        hasMotion: false,
        hasTiming: false,
        hasStyle: false,
        hasConstraints: false,
        hasOutputSettings: false
      },
      modality: 'video'
    }
  }

  // Detect blocks
  const checks = detectVideoBlocks(text)

  // Collect issues
  const issues: VideoQaIssue[] = []

  // Add warnings for missing blocks
  if (!checks.hasScene) {
    issues.push({
      level: 'warning',
      code: 'MISSING_SCENE',
      message: 'Missing SCENE block: Define what happens in the video'
    })
  }
  if (!checks.hasSubject) {
    issues.push({
      level: 'warning',
      code: 'MISSING_SUBJECT',
      message: 'Missing SUBJECT block: Define the main subject/character'
    })
  }
  if (!checks.hasMotion) {
    issues.push({
      level: 'warning',
      code: 'MISSING_MOTION',
      message: 'Missing MOTION block: Describe camera and subject movement'
    })
  }
  if (!checks.hasTiming) {
    issues.push({
      level: 'warning',
      code: 'MISSING_TIMING',
      message: 'Missing TIMING block: Specify duration and pacing'
    })
  }
  if (!checks.hasStyle) {
    issues.push({
      level: 'warning',
      code: 'MISSING_STYLE',
      message: 'Missing STYLE block: Define visual aesthetic'
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

  // Validate motion explicitness (if MOTION block exists)
  if (checks.hasMotion) {
    const motionBlock = extractBlock(text, ['MOTION', 'CAMERA MOVEMENT', 'MOVEMENT'])
    const textToCheck = motionBlock || text
    if (!hasMotionSignal(textToCheck)) {
      issues.push({
        level: 'error',
        code: 'MISSING_MOTION_SIGNAL',
        message: 'MOTION block exists but no motion keywords found (e.g., pan, tilt, walking, running)'
      })
    }
  }

  // Validate timing explicitness (if TIMING block exists)
  if (checks.hasTiming) {
    const timingBlock = extractBlock(text, ['TIMING', 'DURATION', 'VIDEO LENGTH', 'PACING'])
    const textToCheck = timingBlock || text
    if (!hasTimingSignal(textToCheck)) {
      issues.push({
        level: 'error',
        code: 'MISSING_TIMING_SIGNAL',
        message: 'TIMING block exists but no timing indicators found (e.g., "5 seconds", "slow", "3 beats")'
      })
    }
  }

  // Scan contradictions (errors)
  const contradictionIssues = scanVideoContradictions(text)
  issues.push(...contradictionIssues)

  // Validate output settings (errors)
  const outputSettingsIssues = validateVideoOutputSettings(text, checks.hasOutputSettings)
  issues.push(...outputSettingsIssues)

  // Check instability warnings
  const instabilityIssues = checkInstabilityWarnings(text)
  issues.push(...instabilityIssues)

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
  const { score } = scoreVideoPrompt(text, checks)

  // Determine level
  const errorCount = issues.filter(i => i.level === 'error').length
  const level: 'draft' | 'verified' = score >= 85 && errorCount === 0 ? 'verified' : 'draft'

  return {
    level,
    score,
    issues,
    checks: {
      hasScene: checks.hasScene,
      hasSubject: checks.hasSubject,
      hasMotion: checks.hasMotion,
      hasTiming: checks.hasTiming,
      hasStyle: checks.hasStyle,
      hasConstraints: checks.hasConstraints,
      hasOutputSettings: checks.hasOutputSettings
    },
    modality: 'video',
    ...(subtype && { subtype }) // Include subtype if provided
  }
}
