// QA Router v0.1
// Unified entry point for modality-based QA evaluation

import { inferModality, type Modality } from '@/lib/prompttest/modality'
import { inferVideoSubtype } from '@/lib/prompttest/videoSubtype'
import { qaEvaluateSnippet as qaEvaluateText } from './promptQa'
import { evaluateImagePrompt } from './imagePromptQa'
import { evaluateVideoPrompt } from './videoPromptQa'
import { evaluateImageToVideoPrompt } from './imageToVideoPromptQa'
import { evaluateEmailPrompt } from './emailPromptQa'
import { evaluateAudioPrompt } from './audioPromptQa'
import type { Snippet } from '@/lib/types'

// Unified result type
export interface UnifiedQaResult {
  level: 'draft' | 'verified'
  score: number
  issues: Array<{ level: 'error' | 'warning'; code: string; message: string }>
  checks: Record<string, boolean>
  modality: Modality
}

/**
 * Interpolate template placeholders with input values
 */
function interpolateTemplate(template: string, inputs: Record<string, string>): string {
  let result = template
  Object.entries(inputs).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replaceAll(placeholder, value || '')
  })
  return result
}

/**
 * Main QA evaluation entry point - routes based on modality
 */
export function qaEvaluate(
  snippet: Snippet,
  options?: { inputValues?: Record<string, string> }
): UnifiedQaResult {
  const modality = inferModality(snippet)

  if (modality === 'image') {
    // Get effective text
    let text = snippet.template || snippet.code || ''

    // If workflow and inputs provided, interpolate
    if (snippet.type === 'workflow' && options?.inputValues) {
      text = interpolateTemplate(text, options.inputValues)
    }

    const result = evaluateImagePrompt({
      text,
      inputs: options?.inputValues,
      snippetMeta: snippet
    })

    return {
      ...result,
      modality: 'image'
    }
  }

  // Video modality routing (with subtype detection)
  if (modality === 'video') {
    // Get effective text
    let text = snippet.template || snippet.code || ''

    // If workflow and inputs provided, interpolate
    if (snippet.type === 'workflow' && options?.inputValues) {
      text = interpolateTemplate(text, options.inputValues)
    }

    // Infer video subtype
    const videoSubtype = inferVideoSubtype(snippet)

    // Route based on subtype
    if (videoSubtype === 'image_to_video') {
      // Use I2V-specific QA
      const result = evaluateImageToVideoPrompt({
        text,
        inputs: options?.inputValues,
        snippetMeta: snippet
      })

      return {
        ...result,
        modality: 'video'
      }
    } else {
      // Use standard T2V QA (text-to-video or generic)
      const result = evaluateVideoPrompt({
        text,
        inputs: options?.inputValues,
        snippetMeta: snippet,
        subtype: videoSubtype
      })

      return {
        ...result,
        modality: 'video'
      }
    }
  }

  // Email modality routing
  if (modality === 'email') {
    // Get effective text
    let text = snippet.template || snippet.code || ''

    // If workflow and inputs provided, interpolate
    if (snippet.type === 'workflow' && options?.inputValues) {
      text = interpolateTemplate(text, options.inputValues)
    }

    const result = evaluateEmailPrompt({
      text,
      inputs: options?.inputValues,
      snippetMeta: snippet
    })

    return {
      level: result.level,
      score: result.score,
      issues: result.issues,
      checks: result.checks,
      modality: 'email'
    }
  }

  // Audio modality routing
  if (modality === 'audio') {
    // Get effective text
    let text = snippet.template || snippet.code || ''

    // If workflow and inputs provided, interpolate
    if (snippet.type === 'workflow' && options?.inputValues) {
      text = interpolateTemplate(text, options.inputValues)
    }

    const result = evaluateAudioPrompt({
      text,
      inputs: options?.inputValues,
      snippetMeta: snippet
    })

    return {
      level: result.level,
      score: result.score,
      issues: result.issues,
      checks: result.checks,
      modality: 'audio'
    }
  }

  // Fall back to text QA for all other modalities
  const result = qaEvaluateText(snippet)
  return {
    ...result,
    modality
  }
}
