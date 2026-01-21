/**
 * Visual Prompt Pack Schema for MPS v0.1
 * Defines the structure for multi-provider image generation prompts
 */

import type { RenderTarget } from '../types'

// Intent types for visual generation
export type VisualIntent =
  | 'product_photo'
  | 'headshot'
  | 'logo'
  | 'scene'
  | 'generic'

// Provider-specific output structure
export interface ProviderOutput {
  positive: string
  negative?: string
  params: Record<string, unknown>
  instructions?: string
}

// Main prompt pack structure
export interface VisualPromptPack {
  intent: VisualIntent
  providers: Partial<Record<RenderTarget, ProviderOutput>>
  notes?: string[]
}

// Midjourney v6 specific params
export interface MidjourneyParams {
  ar?: string // aspect ratio e.g. "16:9"
  stylize?: number // 0-1000
  chaos?: number // 0-100
  quality?: number // .25, .5, 1
  seed?: number
  tile?: boolean
  weird?: number // 0-3000
}

// SDXL specific params
export interface SdxlParams {
  width?: number // 512-2048
  height?: number // 512-2048
  steps?: number // 10-150
  cfg?: number // 1-20 (cfg_scale)
  seed?: number
  sampler?: string
}

// JSON Schema for validation (AJV compatible)
export const visualPromptPackSchema = {
  type: 'object',
  required: ['intent', 'providers'],
  properties: {
    intent: {
      type: 'string',
      enum: ['product_photo', 'headshot', 'logo', 'scene', 'generic'],
      description: 'The intent/purpose of the visual generation'
    },
    providers: {
      type: 'object',
      minProperties: 1,
      additionalProperties: {
        type: 'object',
        required: ['positive', 'params'],
        properties: {
          positive: {
            type: 'string',
            minLength: 10,
            description: 'The positive prompt text'
          },
          negative: {
            type: 'string',
            description: 'Negative prompt (what to avoid)'
          },
          params: {
            type: 'object',
            description: 'Provider-specific parameters'
          },
          instructions: {
            type: 'string',
            description: 'Human-readable instructions for using this prompt'
          }
        }
      },
      description: 'Provider-specific prompt outputs'
    },
    notes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Additional notes or tips for the user'
    }
  }
}

// Parameter bounds for validation
export const PROVIDER_PARAM_BOUNDS: Record<string, Record<string, { min: number; max: number }>> = {
  midjourney_v6: {
    stylize: { min: 0, max: 1000 },
    chaos: { min: 0, max: 100 },
    quality: { min: 0.25, max: 1 },
    weird: { min: 0, max: 3000 }
  },
  sdxl: {
    width: { min: 512, max: 2048 },
    height: { min: 512, max: 2048 },
    steps: { min: 10, max: 150 },
    cfg: { min: 1, max: 20 }
  },
  dalle3: {
    // DALL-E 3 has limited params, mostly handled by API
  },
  ideogram: {
    // Ideogram params TBD
  }
}
