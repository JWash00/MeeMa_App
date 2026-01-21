// Trust Utils v0.1
// Trust status computation and formatting utilities

import type { TrustStatus } from './trustCopy'
import type { Modality } from '@/lib/prompttest/modality'

/**
 * Compute trust status from QA result
 *
 * @param qaResult - QA evaluation result with level and score
 * @param options - Optional flags (isPatchedView for patch system integration)
 * @returns TrustStatus - verified, patched, or draft
 */
export function computeTrustStatus(
  qaResult: { level: 'draft' | 'verified'; score: number },
  options?: { isPatchedView?: boolean }
): TrustStatus {
  // If QA passed natively, return verified
  if (qaResult.level === 'verified') {
    return 'verified'
  }

  // If draft but viewing patched content, return patched
  if (qaResult.level === 'draft' && options?.isPatchedView === true) {
    return 'patched'
  }

  // Otherwise, return draft
  return 'draft'
}

/**
 * Format score label based on modality and subtype
 *
 * @param modality - Prompt modality (text, email, image, video, audio)
 * @param meta - Optional metadata (subtype for video, emailType, audioSubtype)
 * @returns Score label string ("Preservation Score" or "Consistency Score")
 */
export function formatScoreLabel(
  modality: Modality,
  meta?: { subtype?: string; emailType?: string; audioSubtype?: string }
): string {
  // Special case: Image-to-Video uses "Preservation Score"
  if (modality === 'video' && meta?.subtype === 'image_to_video') {
    return 'Preservation Score'
  }

  // All other modalities use "Consistency Score"
  return 'Consistency Score'
}

/**
 * Format score display with label
 *
 * @param score - QA score (0-100)
 * @param modality - Prompt modality
 * @param meta - Optional metadata
 * @returns Formatted string like "Consistency Score: 92"
 */
export function formatScoreDisplay(
  score: number,
  modality: Modality,
  meta?: { subtype?: string; emailType?: string; audioSubtype?: string }
): string {
  const label = formatScoreLabel(modality, meta)
  return `${label}: ${score}`
}
