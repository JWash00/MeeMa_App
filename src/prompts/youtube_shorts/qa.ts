/**
 * YouTube Shorts v0.1 - QA Checks
 *
 * Deterministic validation of generated output.
 */

import type { YouTubeShortsOutput, Issue } from './spec'
import { containsSourceMarkers } from './spec'

// =============================================================================
// CONSTANTS
// =============================================================================

const HASHTAG_PATTERN = /#\w+/g
const WORDS_PER_MINUTE = 170
const DURATION_TOLERANCE = 0.4 // +/- 40%

// =============================================================================
// QA RESULT TYPE
// =============================================================================

export interface QAResult {
  pass: boolean
  issues: Issue[]
}

// =============================================================================
// MAIN QA FUNCTION
// =============================================================================

/**
 * Run deterministic QA checks on YouTube Shorts output.
 *
 * Checks:
 * 1. No hashtags in any user-visible field
 * 2. No SOURCE markers in any user-visible field
 * 3. Title <= 70 characters
 * 4. Hook <= 180 characters
 * 5. Duration plausibility (script word count vs target duration)
 */
export function qaYouTubeShorts(
  output: YouTubeShortsOutput,
  targetDurationSeconds: number = 30
): QAResult {
  const issues: Issue[] = []

  // Check 1: No hashtags
  issues.push(...checkNoHashtags(output))

  // Check 2: No SOURCE markers
  issues.push(...checkNoSourceMarkers(output))

  // Check 3: Title length
  if (output.title.length > 70) {
    issues.push({
      code: 'TITLE_TOO_LONG',
      message: `Title is ${output.title.length} characters (max 70)`,
      fieldPath: 'title',
    })
  }

  // Check 4: Hook length
  if (output.hook.length > 180) {
    issues.push({
      code: 'HOOK_TOO_LONG',
      message: `Hook is ${output.hook.length} characters (max 180)`,
      fieldPath: 'hook',
    })
  }

  // Check 5: Duration plausibility
  const durationIssue = checkDurationPlausibility(output.script, targetDurationSeconds)
  if (durationIssue) {
    issues.push(durationIssue)
  }

  return {
    pass: issues.length === 0,
    issues,
  }
}

// =============================================================================
// CHECK FUNCTIONS
// =============================================================================

function checkNoHashtags(output: YouTubeShortsOutput): Issue[] {
  const issues: Issue[] = []

  const fieldsToCheck: [string, string][] = [
    ['title', output.title],
    ['hook', output.hook],
    ['script', output.script],
    ['cta', output.cta],
  ]

  // Check main fields
  for (const [fieldPath, value] of fieldsToCheck) {
    const matches = value.match(HASHTAG_PATTERN)
    if (matches && matches.length > 0) {
      issues.push({
        code: 'HASHTAG_VIOLATION',
        message: `Hashtags found: ${matches.join(', ')}`,
        fieldPath,
      })
    }
  }

  // Check onScreenText array
  for (let i = 0; i < output.onScreenText.length; i++) {
    const item = output.onScreenText[i]
    const matches = item.text.match(HASHTAG_PATTERN)
    if (matches && matches.length > 0) {
      issues.push({
        code: 'HASHTAG_VIOLATION',
        message: `Hashtags found: ${matches.join(', ')}`,
        fieldPath: `onScreenText[${i}].text`,
      })
    }
  }

  // Check shotlist array (visual descriptions)
  for (let i = 0; i < output.shotlist.length; i++) {
    const item = output.shotlist[i]
    const matches = item.visual.match(HASHTAG_PATTERN)
    if (matches && matches.length > 0) {
      issues.push({
        code: 'HASHTAG_VIOLATION',
        message: `Hashtags found: ${matches.join(', ')}`,
        fieldPath: `shotlist[${i}].visual`,
      })
    }
  }

  return issues
}

function checkNoSourceMarkers(output: YouTubeShortsOutput): Issue[] {
  const issues: Issue[] = []

  const fieldsToCheck: [string, string][] = [
    ['title', output.title],
    ['hook', output.hook],
    ['script', output.script],
    ['cta', output.cta],
  ]

  // Check main fields
  for (const [fieldPath, value] of fieldsToCheck) {
    if (containsSourceMarkers(value)) {
      issues.push({
        code: 'SOURCE_MARKER_VIOLATION',
        message: 'SOURCE marker found in output',
        fieldPath,
      })
    }
  }

  // Check onScreenText array
  for (let i = 0; i < output.onScreenText.length; i++) {
    const item = output.onScreenText[i]
    if (containsSourceMarkers(item.text)) {
      issues.push({
        code: 'SOURCE_MARKER_VIOLATION',
        message: 'SOURCE marker found in output',
        fieldPath: `onScreenText[${i}].text`,
      })
    }
  }

  // Check shotlist array
  for (let i = 0; i < output.shotlist.length; i++) {
    const item = output.shotlist[i]
    if (containsSourceMarkers(item.visual)) {
      issues.push({
        code: 'SOURCE_MARKER_VIOLATION',
        message: 'SOURCE marker found in output',
        fieldPath: `shotlist[${i}].visual`,
      })
    }
  }

  return issues
}

function checkDurationPlausibility(
  script: string,
  targetDurationSeconds: number
): Issue | null {
  // Count words in script
  const words = script.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length

  // Calculate estimated duration at 170 WPM
  const wordsPerSecond = WORDS_PER_MINUTE / 60
  const estimatedDuration = wordCount / wordsPerSecond

  // Check if within tolerance
  const minDuration = targetDurationSeconds * (1 - DURATION_TOLERANCE)
  const maxDuration = targetDurationSeconds * (1 + DURATION_TOLERANCE)

  if (estimatedDuration < minDuration) {
    return {
      code: 'SCRIPT_TOO_SHORT',
      message: `Script has ${wordCount} words (~${Math.round(estimatedDuration)}s at 170 WPM), target is ${targetDurationSeconds}s. Script may be too short.`,
      fieldPath: 'script',
    }
  }

  if (estimatedDuration > maxDuration) {
    return {
      code: 'SCRIPT_TOO_LONG',
      message: `Script has ${wordCount} words (~${Math.round(estimatedDuration)}s at 170 WPM), target is ${targetDurationSeconds}s. Script may be too long.`,
      fieldPath: 'script',
    }
  }

  return null
}
