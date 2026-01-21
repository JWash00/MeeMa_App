// Audio Prompt QA Standards v0.1
// Deterministic structural QA + scoring for audio prompts (voice/music/generic)

import type { Snippet } from '@/lib/types'

// Types
export type AudioSubtype = 'voice' | 'music' | 'generic'

export interface AudioQaIssue {
  level: 'error' | 'warning'
  code: string
  message: string
}

export interface AudioQaResult {
  level: 'draft' | 'verified'
  score: number
  issues: AudioQaIssue[]
  checks: Record<string, boolean>
  subtype: AudioSubtype
}

export interface AudioQaChecks {
  hasGoal: boolean
  hasStyle: boolean
  hasTiming: boolean
  hasStructure: boolean
  hasConstraints: boolean
  hasOutputSettings: boolean
  // Voice-specific
  hasVoiceSpec?: boolean
  hasScript?: boolean
  // Music-specific
  hasInstrumentation?: boolean
  hasTempo?: boolean
}

// Keyword sets for subtype inference
const VOICE_KEYWORDS = [
  'voice', 'narrat', 'speak', 'tts', 'speech', 'voiceover',
  'podcast', 'dialogue', 'monologue', 'announcer', 'narrator'
]

const MUSIC_KEYWORDS = [
  'music', 'song', 'melody', 'beat', 'track', 'instrumental',
  'tempo', 'bpm', 'chord', 'rhythm', 'harmony', 'composition',
  'jingle', 'soundtrack', 'loop'
]

// Style keywords for scoring
const STYLE_KEYWORDS = [
  'warm', 'bright', 'dark', 'ambient', 'energetic', 'calm',
  'dramatic', 'upbeat', 'melancholic', 'cinematic', 'lo-fi',
  'professional', 'casual', 'authoritative', 'friendly'
]

// Voice contradiction pairs
const VOICE_CONTRADICTIONS = [
  { terms: ['whisper', 'shout'], code: 'CONTRADICTION_WHISPER_SHOUT' },
  { terms: ['monotone', 'expressive'], code: 'CONTRADICTION_MONOTONE_EXPRESSIVE' },
  { terms: ['fast pace', 'slow pace'], code: 'CONTRADICTION_FAST_SLOW_PACE' },
  { terms: ['robotic', 'natural'], code: 'CONTRADICTION_ROBOTIC_NATURAL' }
]

// Music contradiction pairs
const MUSIC_CONTRADICTIONS = [
  { terms: ['acoustic', 'electronic'], code: 'CONTRADICTION_ACOUSTIC_ELECTRONIC' },
  { terms: ['major key', 'minor key'], code: 'CONTRADICTION_MAJOR_MINOR' },
  { terms: ['upbeat', 'melancholic'], code: 'CONTRADICTION_UPBEAT_MELANCHOLIC' },
  { terms: ['silence', 'loud'], code: 'CONTRADICTION_SILENCE_LOUD' }
]

/**
 * Infer audio subtype from text content
 */
export function inferAudioSubtype(text: string): AudioSubtype {
  if (!text) return 'generic'

  const lower = text.toLowerCase()

  const hasVoice = VOICE_KEYWORDS.some(k => lower.includes(k))
  const hasMusic = MUSIC_KEYWORDS.some(k => lower.includes(k))

  if (hasVoice && !hasMusic) return 'voice'
  if (hasMusic && !hasVoice) return 'music'
  return 'generic'
}

/**
 * Get UI label for audio subtype
 */
export function audioSubtypeLabel(subtype: AudioSubtype): string {
  const labels: Record<AudioSubtype, string> = {
    voice: 'Voice',
    music: 'Music',
    generic: 'Audio'
  }
  return labels[subtype]
}

/**
 * Detect presence of required audio blocks
 */
export function detectAudioBlocks(text: string): AudioQaChecks {
  if (!text || text.trim() === '') {
    return {
      hasGoal: false,
      hasStyle: false,
      hasTiming: false,
      hasStructure: false,
      hasConstraints: false,
      hasOutputSettings: false
    }
  }

  // GOAL accepts OBJECTIVE, PURPOSE aliases
  const hasGoal =
    /##?\s*goal[\s:]/i.test(text) ||
    /\n\s*goal\s*[:]/i.test(text) ||
    /##?\s*objective[\s:]/i.test(text) ||
    /##?\s*purpose[\s:]/i.test(text)

  // STYLE accepts AESTHETIC, MOOD aliases
  const hasStyle =
    /##?\s*style[\s:]/i.test(text) ||
    /\n\s*style\s*[:]/i.test(text) ||
    /##?\s*aesthetic[\s:]/i.test(text) ||
    /##?\s*mood[\s:]/i.test(text)

  // TIMING accepts DURATION, LENGTH aliases
  const hasTiming =
    /##?\s*timing[\s:]/i.test(text) ||
    /\n\s*timing\s*[:]/i.test(text) ||
    /##?\s*duration[\s:]/i.test(text) ||
    /##?\s*length[\s:]/i.test(text)

  // STRUCTURE accepts FORMAT, ARRANGEMENT aliases
  const hasStructure =
    /##?\s*structure[\s:]/i.test(text) ||
    /\n\s*structure\s*[:]/i.test(text) ||
    /##?\s*format[\s:]/i.test(text) ||
    /##?\s*arrangement[\s:]/i.test(text)

  // CONSTRAINTS accepts AVOID, EXCLUDE aliases
  const hasConstraints =
    /##?\s*constraints[\s:]/i.test(text) ||
    /\n\s*constraints\s*[:]/i.test(text) ||
    /##?\s*avoid[\s:]/i.test(text) ||
    /##?\s*exclude[\s:]/i.test(text) ||
    /what\s+to\s+avoid/i.test(text)

  // OUTPUT SETTINGS accepts SPECS, OUTPUT FORMAT aliases
  const hasOutputSettings =
    /##?\s*output\s+settings[\s:]/i.test(text) ||
    /\n\s*output\s+settings\s*[:]/i.test(text) ||
    /##?\s*output\s+format[\s:]/i.test(text) ||
    /##?\s*specs[\s:]/i.test(text) ||
    /##?\s*settings[\s:]/i.test(text)

  // Voice-specific blocks
  const hasVoiceSpec =
    /##?\s*voice\s+spec[\s:]/i.test(text) ||
    /##?\s*voice\s+characteristics[\s:]/i.test(text) ||
    /##?\s*speaker[\s:]/i.test(text)

  const hasScript =
    /##?\s*script[\s:]/i.test(text) ||
    /##?\s*dialogue[\s:]/i.test(text) ||
    /##?\s*narration[\s:]/i.test(text) ||
    /##?\s*text[\s:]/i.test(text)

  // Music-specific blocks
  const hasInstrumentation =
    /##?\s*instrumentation[\s:]/i.test(text) ||
    /##?\s*instruments[\s:]/i.test(text) ||
    /##?\s*sounds[\s:]/i.test(text)

  const hasTempo =
    /##?\s*tempo[\s:]/i.test(text) ||
    /##?\s*bpm[\s:]/i.test(text) ||
    /##?\s*rhythm[\s:]/i.test(text) ||
    /##?\s*pace[\s:]/i.test(text)

  return {
    hasGoal,
    hasStyle,
    hasTiming,
    hasStructure,
    hasConstraints,
    hasOutputSettings,
    hasVoiceSpec,
    hasScript,
    hasInstrumentation,
    hasTempo
  }
}

/**
 * Validate timing has explicit duration with units
 */
export function validateTimingExplicit(text: string): boolean {
  if (!text) return false
  // Must include duration with units (seconds, minutes, s, m, sec, min)
  const timingPattern = /\d+\s*(seconds?|minutes?|s|m|sec|min)\b/i
  return timingPattern.test(text)
}

/**
 * Scan for audio-specific contradictions
 */
export function scanAudioContradictions(text: string, subtype: AudioSubtype): AudioQaIssue[] {
  const issues: AudioQaIssue[] = []
  const lowerText = text.toLowerCase()

  const contradictions = subtype === 'voice' ? VOICE_CONTRADICTIONS :
                         subtype === 'music' ? MUSIC_CONTRADICTIONS :
                         [...VOICE_CONTRADICTIONS, ...MUSIC_CONTRADICTIONS]

  for (const { terms, code } of contradictions) {
    const allPresent = terms.every(term => lowerText.includes(term))
    if (allPresent) {
      issues.push({
        level: 'error',
        code,
        message: `Contradiction detected: "${terms[0]}" AND "${terms[1]}" both present`
      })
    }
  }

  return issues
}

/**
 * Score audio prompt (0-100)
 */
export function scoreAudioPrompt(
  text: string,
  checks: AudioQaChecks,
  subtype: AudioSubtype
): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}
  const lowerText = text.toLowerCase()

  // Structural Completeness: 35 points (6 universal blocks)
  const universalPoints = {
    hasGoal: 6,
    hasStyle: 6,
    hasTiming: 6,
    hasStructure: 6,
    hasConstraints: 6,
    hasOutputSettings: 5
  }

  let structural = 0
  for (const [key, points] of Object.entries(universalPoints)) {
    if (checks[key as keyof AudioQaChecks]) {
      structural += points
    }
  }
  breakdown.structural = structural
  score += structural

  // Timing Explicitness: 20 points
  let timingScore = 0
  if (validateTimingExplicit(text)) {
    timingScore = 20
  } else if (checks.hasTiming) {
    // Has timing block but no explicit duration
    timingScore = 5
  }
  breakdown.timing = timingScore
  score += timingScore

  // Style Clarity: 20 points
  const styleMatches = STYLE_KEYWORDS.filter(kw => lowerText.includes(kw))
  const styleScore = Math.min(20, styleMatches.length * 5)
  breakdown.style = styleScore
  score += styleScore

  // Subtype Blocks: 15 points
  let subtypeScore = 0
  if (subtype === 'voice') {
    if (checks.hasVoiceSpec) subtypeScore += 8
    if (checks.hasScript) subtypeScore += 7
  } else if (subtype === 'music') {
    if (checks.hasInstrumentation) subtypeScore += 8
    if (checks.hasTempo) subtypeScore += 7
  } else {
    // Generic audio - give partial credit if any subtype blocks present
    if (checks.hasVoiceSpec || checks.hasScript) subtypeScore += 7
    if (checks.hasInstrumentation || checks.hasTempo) subtypeScore += 8
  }
  breakdown.subtypeBlocks = subtypeScore
  score += subtypeScore

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
  const contradictions = scanAudioContradictions(text, subtype)
  const contradictionPenalty = Math.min(30, contradictions.length * 10)
  breakdown.contradictionPenalty = -contradictionPenalty
  score -= contradictionPenalty

  // Cap at 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, breakdown }
}

/**
 * Main entry point: Evaluate audio prompt for QA
 */
export function evaluateAudioPrompt(options: {
  text: string
  inputs?: Record<string, string>
  snippetMeta?: Snippet
}): AudioQaResult {
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
        hasGoal: false,
        hasStyle: false,
        hasTiming: false,
        hasStructure: false,
        hasConstraints: false,
        hasOutputSettings: false
      },
      subtype: 'generic'
    }
  }

  // Infer subtype
  const subtype = inferAudioSubtype(text)

  // Detect blocks
  const checks = detectAudioBlocks(text)

  // Collect issues
  const issues: AudioQaIssue[] = []

  // Add warnings for missing universal blocks
  if (!checks.hasGoal) {
    issues.push({
      level: 'warning',
      code: 'MISSING_GOAL',
      message: 'Missing GOAL block: Define what this audio should achieve'
    })
  }
  if (!checks.hasStyle) {
    issues.push({
      level: 'warning',
      code: 'MISSING_STYLE',
      message: 'Missing STYLE block: Define mood and aesthetic'
    })
  }
  if (!checks.hasTiming) {
    issues.push({
      level: 'warning',
      code: 'MISSING_TIMING',
      message: 'Missing TIMING block: Specify duration'
    })
  }
  if (!checks.hasStructure) {
    issues.push({
      level: 'warning',
      code: 'MISSING_STRUCTURE',
      message: 'Missing STRUCTURE block: Define format and arrangement'
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
      message: 'Missing OUTPUT SETTINGS block: Define technical specs'
    })
  }

  // Subtype-specific warnings
  if (subtype === 'voice') {
    if (!checks.hasVoiceSpec) {
      issues.push({
        level: 'warning',
        code: 'MISSING_VOICE_SPEC',
        message: 'Missing VOICE SPEC block: Define voice characteristics'
      })
    }
    if (!checks.hasScript) {
      issues.push({
        level: 'warning',
        code: 'MISSING_SCRIPT',
        message: 'Missing SCRIPT block: Provide dialogue or narration text'
      })
    }
  } else if (subtype === 'music') {
    if (!checks.hasInstrumentation) {
      issues.push({
        level: 'warning',
        code: 'MISSING_INSTRUMENTATION',
        message: 'Missing INSTRUMENTATION block: Define instruments and sounds'
      })
    }
    if (!checks.hasTempo) {
      issues.push({
        level: 'warning',
        code: 'MISSING_TEMPO',
        message: 'Missing TEMPO block: Specify BPM or rhythm'
      })
    }
  }

  // Validate timing explicitness
  if (checks.hasTiming && !validateTimingExplicit(text)) {
    issues.push({
      level: 'error',
      code: 'TIMING_NOT_EXPLICIT',
      message: 'TIMING block exists but no explicit duration found (e.g., "30 seconds", "2 minutes")'
    })
  }

  // Scan contradictions
  const contradictionIssues = scanAudioContradictions(text, subtype)
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
  const { score } = scoreAudioPrompt(text, checks, subtype)

  // Determine level
  const errorCount = issues.filter(i => i.level === 'error').length
  const level: 'draft' | 'verified' = score >= 85 && errorCount === 0 ? 'verified' : 'draft'

  // Convert checks to Record<string, boolean> for unified interface
  const checksRecord: Record<string, boolean> = {
    hasGoal: checks.hasGoal,
    hasStyle: checks.hasStyle,
    hasTiming: checks.hasTiming,
    hasStructure: checks.hasStructure,
    hasConstraints: checks.hasConstraints,
    hasOutputSettings: checks.hasOutputSettings,
    ...(checks.hasVoiceSpec !== undefined && { hasVoiceSpec: checks.hasVoiceSpec }),
    ...(checks.hasScript !== undefined && { hasScript: checks.hasScript }),
    ...(checks.hasInstrumentation !== undefined && { hasInstrumentation: checks.hasInstrumentation }),
    ...(checks.hasTempo !== undefined && { hasTempo: checks.hasTempo }),
  }

  return {
    level,
    score,
    issues,
    checks: checksRecord,
    subtype
  }
}
