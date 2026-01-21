/**
 * @deprecated This file is deprecated. Import from '@/lib/voice/voice' instead.
 * These re-exports will be removed in a future version.
 *
 * Old import:
 *   import { TRUST_STATUS_LABELS } from '@/lib/trust/trustCopy'
 *
 * New import:
 *   import { TRUST } from '@/lib/voice/voice'
 *   const labels = TRUST.status
 */

import { TRUST } from '@/lib/voice/voice'

export type TrustStatus = 'verified' | 'patched' | 'draft'

/**
 * @deprecated Use TRUST.status from '@/lib/voice/voice' instead
 */
export const TRUST_STATUS_LABELS: Record<TrustStatus, string> = TRUST.status

/**
 * @deprecated Use TRUST.statusMicro from '@/lib/voice/voice' instead
 */
export const TRUST_STATUS_MICROCOPY: Record<TrustStatus, string> = TRUST.statusMicro

/**
 * @deprecated Use TRUST.terms from '@/lib/voice/voice' instead
 */
export const TRUST_TERMS = {
  reliabilityTitle: TRUST.terms.reliable,
  reuseTitle: TRUST.terms.reuse,
  safeCustomizeTitle: TRUST.terms.customize,
}

/**
 * @deprecated Use TRUST.flagship from '@/lib/voice/voice' instead
 */
export const FLAGSHIP_COPY = TRUST.flagship

/**
 * @deprecated Use TRUST.sections from '@/lib/voice/voice' instead
 */
export const SECTION_HEADINGS = {
  whyThisWorks: TRUST.sections.whyWorks,
  qualityChecks: TRUST.sections.qualityChecks,
  trustStatus: TRUST.sections.trustStatus,
}

/**
 * @deprecated Use TRUST.cta from '@/lib/voice/voice' instead
 */
export const CTA_LABELS = {
  fixWithPatches: TRUST.cta.fixPatches,
  viewQualityChecks: TRUST.cta.viewQuality,
  applyPatch: TRUST.cta.applyPatch,
}
