// Provider Registry v0.1 - Capabilities only (no execution logic yet)

import { Modality, ProviderId, ProviderExecution } from './modality'

export interface ProviderCapability {
  id: ProviderId
  name: string
  modality: Modality
  execution: ProviderExecution
  testable: boolean
  description?: string
}

export const PROVIDER_REGISTRY: ProviderCapability[] = [
  // Text Providers (execution coming in v0.2)
  {
    id: 'openai',
    name: 'OpenAI',
    modality: 'text',
    execution: 'sync',
    testable: true,
    description: 'GPT-4, GPT-3.5 models'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    modality: 'text',
    execution: 'sync',
    testable: true,
    description: 'Claude models'
  },
  {
    id: 'google',
    name: 'Google',
    modality: 'text',
    execution: 'sync',
    testable: true,
    description: 'Gemini models'
  },

  // Image Providers (manual execution only)
  {
    id: 'midjourney',
    name: 'Midjourney',
    modality: 'image',
    execution: 'manual',
    testable: false,
    description: 'Discord-based image generation'
  },

  // Video Providers (manual execution only)
  {
    id: 'runway',
    name: 'Runway',
    modality: 'video',
    execution: 'manual',
    testable: false,
    description: 'Gen-2 video generation'
  },
  {
    id: 'pika',
    name: 'Pika',
    modality: 'video',
    execution: 'manual',
    testable: false,
    description: 'Text and image-to-video'
  },

  // Fallback
  {
    id: 'generic',
    name: 'Generic',
    modality: 'manual',
    execution: 'manual',
    testable: false,
    description: 'Any external provider'
  }
]

/**
 * Get all providers for a specific modality
 */
export function getProvidersByModality(modality: Modality): ProviderCapability[] {
  return PROVIDER_REGISTRY.filter(p => p.modality === modality)
}

/**
 * Get a specific provider by ID
 */
export function getProviderById(id: ProviderId): ProviderCapability | undefined {
  return PROVIDER_REGISTRY.find(p => p.id === id)
}
