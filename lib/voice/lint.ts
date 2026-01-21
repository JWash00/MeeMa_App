// Voice Linter for MeeMa Copy
// Detects violations of MeeMa voice guidelines

export interface VoiceViolation {
  key: string
  value: string
  issue: string
  suggestion?: string
  severity: 'error' | 'warning'
}

// ============================================================
// FORBIDDEN WORDS (jargon)
// ============================================================

const FORBIDDEN_WORDS: Record<string, string> = {
  'leverage': 'use',
  'leveraging': 'using',
  'optimize': 'improve or make faster',
  'optimized': 'improved or fast',
  'optimization': 'improvement',
  'pipeline': 'workflow or process',
  'architecture': 'structure',
  'robust': 'reliable',
  'advanced': 'remove this word',
  'enterprise': 'professional or business',
  'infrastructure': 'setup or system',
  'modality': 'type or format',
  'validation checks': 'checks',
  'schema': 'structure',
  'utilize': 'use',
  'facilitate': 'help or enable',
  'implement': 'build or add',
  'configuration': 'settings',
  'initialize': 'set up or start',
}

const FORBIDDEN_REGEX = new RegExp(
  `\\b(${Object.keys(FORBIDDEN_WORDS).join('|')})\\b`,
  'gi'
)

// ============================================================
// LINTER FUNCTIONS
// ============================================================

function checkForbiddenWords(key: string, value: string): VoiceViolation[] {
  const violations: VoiceViolation[] = []
  const matches = value.matchAll(FORBIDDEN_REGEX)

  for (const match of matches) {
    const word = match[0].toLowerCase()
    const suggestion = FORBIDDEN_WORDS[word]

    violations.push({
      key,
      value,
      issue: `Contains forbidden word: "${match[0]}"`,
      suggestion: suggestion ? `Replace with: "${suggestion}"` : undefined,
      severity: 'error',
    })
  }

  return violations
}

function checkSentenceLength(key: string, value: string): VoiceViolation[] {
  const violations: VoiceViolation[] = []

  // Skip short strings (buttons, labels)
  if (value.length < 30) return violations

  // Check each sentence
  const sentences = value.split(/[.!?]+/).filter(s => s.trim())

  for (const sentence of sentences) {
    if (sentence.length > 110) {
      violations.push({
        key,
        value,
        issue: `Sentence too long (${sentence.length} chars). Keep under 110.`,
        suggestion: 'Break into shorter sentences or fragments.',
        severity: 'warning',
      })
    }
  }

  return violations
}

function checkVoicePattern(key: string, value: string): VoiceViolation[] {
  const violations: VoiceViolation[] = []

  // Check for over-explaining patterns
  const overExplainPatterns = [
    /allows you to/i,
    /enables you to/i,
    /provides the ability/i,
    /gives you the option/i,
  ]

  for (const pattern of overExplainPatterns) {
    if (pattern.test(value)) {
      violations.push({
        key,
        value,
        issue: 'Over-explaining. Be more direct.',
        suggestion: 'Use action verbs: "Make", "Try", "Copy", etc.',
        severity: 'warning',
      })
    }
  }

  // Check for passive voice
  if (/\b(is|are|was|were) \w+ed\b/i.test(value)) {
    violations.push({
      key,
      value,
      issue: 'Passive voice detected. Use active voice.',
      suggestion: 'Start with action verbs.',
      severity: 'warning',
    })
  }

  return violations
}

function checkBranding(key: string, value: string): VoiceViolation[] {
  const violations: VoiceViolation[] = []

  // Check for old brand name
  if (/prompt toolkit/i.test(value)) {
    violations.push({
      key,
      value,
      issue: 'Contains old brand name "Prompt Toolkit"',
      suggestion: 'Replace with "MeeMa"',
      severity: 'error',
    })
  }

  return violations
}

// ============================================================
// MAIN LINTER FUNCTION
// ============================================================

export function lintCopy(copy: Record<string, any>, prefix = ''): VoiceViolation[] {
  const violations: VoiceViolation[] = []

  for (const [key, value] of Object.entries(copy)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      // Run all checks
      violations.push(...checkForbiddenWords(fullKey, value))
      violations.push(...checkSentenceLength(fullKey, value))
      violations.push(...checkVoicePattern(fullKey, value))
      violations.push(...checkBranding(fullKey, value))

    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recurse into nested objects (skip functions and arrays)
      violations.push(...lintCopy(value, fullKey))
    }
  }

  return violations
}

// ============================================================
// CLI RUNNER
// ============================================================

export function runLinter(): void {
  const { VOICE_COPY } = require('./voice')
  const violations = lintCopy(VOICE_COPY)

  if (violations.length === 0) {
    console.log('✅ All copy passes voice guidelines!')
    process.exit(0)
  }

  console.error(`❌ Found ${violations.length} voice violations:\n`)

  const errors = violations.filter(v => v.severity === 'error')
  const warnings = violations.filter(v => v.severity === 'warning')

  if (errors.length > 0) {
    console.error(`\n🚨 ERRORS (${errors.length}):\n`)
    errors.forEach(v => {
      console.error(`  ${v.key}:`)
      console.error(`    Issue: ${v.issue}`)
      if (v.suggestion) console.error(`    Fix: ${v.suggestion}`)
      console.error(`    Value: "${v.value}"\n`)
    })
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  WARNINGS (${warnings.length}):\n`)
    warnings.forEach(v => {
      console.warn(`  ${v.key}:`)
      console.warn(`    Issue: ${v.issue}`)
      if (v.suggestion) console.warn(`    Fix: ${v.suggestion}`)
      console.warn(`    Value: "${v.value}"\n`)
    })
  }

  // Fail build only on errors
  process.exit(errors.length > 0 ? 1 : 0)
}

// Run if called directly
if (require.main === module) {
  runLinter()
}
