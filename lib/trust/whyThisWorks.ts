// Why This Works v0.1
// Translates QA checks into creator-friendly benefit bullets

import type { Modality } from '@/lib/prompttest/modality'

export type WhyBullet = {
  icon?: 'check' | 'info'
  text: string
}

/**
 * Build "Why this prompt works" bullets from QA result
 *
 * @param qaResult - QA evaluation result with checks
 * @param context - Modality and metadata context
 * @returns Array of benefit bullets (3-6 max)
 */
export function buildWhyThisWorks(
  qaResult: {
    level: 'draft' | 'verified'
    score: number
    issues: Array<{ level: 'error' | 'warning'; code: string; message: string }>
    checks: Record<string, boolean>
  },
  context: {
    modality: Modality
    subtype?: string
    emailType?: string
    audioSubtype?: string
  }
): WhyBullet[] {
  const bullets: WhyBullet[] = []
  const { checks, level } = qaResult
  const { modality, subtype, emailType, audioSubtype } = context

  // Global benefits (apply to all modalities)

  // No contradictions
  if (checks.no_contradictions === true) {
    bullets.push({
      icon: 'check',
      text: 'No conflicting instructions, so outputs stay consistent.'
    })
  }

  // Explicit timing
  if (checks.timing_explicit === true) {
    bullets.push({
      icon: 'check',
      text: 'Timing is explicit, reducing unpredictable outputs.'
    })
  }

  // Structure complete
  if (checks.structure_complete === true || checks.all_blocks_present === true) {
    bullets.push({
      icon: 'check',
      text: 'Clear structure makes this prompt easy to reuse.'
    })
  }

  // Modality-specific benefits

  // EMAIL
  if (modality === 'email') {
    // Promo emails with offer + urgency
    if (emailType === 'promo' && checks.offer_present === true && checks.urgency_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Offer and timing are clear, so the email stays focused.'
      })
    }

    // CTA present
    if (checks.cta_present === true) {
      bullets.push({
        icon: 'check',
        text: 'One clear action keeps the email from feeling confusing.'
      })
    }

    // Subject line present
    if (checks.subject_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Subject line is defined, ensuring consistent email structure.'
      })
    }
  }

  // IMAGE
  if (modality === 'image') {
    // All blocks present
    if (checks.all_blocks_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Style, composition, and constraints are explicit for repeatable results.'
      })
    }

    // Style block
    if (checks.style_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Visual style is well-defined, reducing unpredictable variations.'
      })
    }

    // Composition block
    if (checks.composition_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Composition rules ensure consistent framing and layout.'
      })
    }
  }

  // VIDEO (Text-to-Video and Generic)
  if (modality === 'video' && subtype !== 'image_to_video') {
    // Motion explicit
    if (checks.motion_explicit === true) {
      bullets.push({
        icon: 'check',
        text: 'Movement is defined so the video doesn\'t feel random.'
      })
    }

    // Timing explicit
    if (checks.timing_explicit === true) {
      bullets.push({
        icon: 'check',
        text: 'Duration and pacing are clear for predictable clips.'
      })
    }

    // Scene description present
    if (checks.scene_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Scene elements are explicit, ensuring consistent video structure.'
      })
    }
  }

  // VIDEO (Image-to-Video)
  if (modality === 'video' && subtype === 'image_to_video') {
    // Preservation anchors OK
    if (checks.preservation_anchors_ok === true) {
      bullets.push({
        icon: 'check',
        text: 'Preservation rules reduce identity drift and unwanted changes.'
      })
    }

    // Stability constraints OK
    if (checks.stability_constraints_ok === true) {
      bullets.push({
        icon: 'check',
        text: 'Stability constraints help prevent flicker and morphing.'
      })
    }

    // Motion explicit
    if (checks.motion_explicit === true) {
      bullets.push({
        icon: 'check',
        text: 'Motion is controlled to preserve source image characteristics.'
      })
    }

    // Source image block present
    if (checks.source_image_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Source image requirements are explicit for reliable animation.'
      })
    }
  }

  // AUDIO
  if (modality === 'audio') {
    // Voice + voice spec
    if (audioSubtype === 'voice' && checks.voice_spec_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Voice style is defined so tone stays consistent.'
      })
    }

    // Music + tempo
    if (audioSubtype === 'music' && checks.tempo_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Tempo is specified so the track matches the intended energy.'
      })
    }

    // Output format
    if (checks.output_format_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Export settings are defined for clean reuse.'
      })
    }

    // Voice style present
    if (checks.voice_style_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Vocal characteristics are explicit, reducing unpredictable output.'
      })
    }
  }

  // TEXT (default)
  if (modality === 'text') {
    // Task context present
    if (checks.task_context_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Task context is clear, helping the model understand the goal.'
      })
    }

    // Output format specified
    if (checks.output_format_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Output format is defined for consistent results.'
      })
    }

    // Examples provided
    if (checks.examples_present === true) {
      bullets.push({
        icon: 'check',
        text: 'Examples are included, reducing ambiguity in the output.'
      })
    }
  }

  // Draft status: Add bullet about missing sections
  if (level === 'draft') {
    bullets.push({
      icon: 'info',
      text: 'A few key sections are missing. Patch Suggestions can add them for you.'
    })
  }

  // Limit to 6 bullets max (prioritize first ones)
  return bullets.slice(0, 6)
}
