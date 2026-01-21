// Patch system for PromptTest - v0.1
// Automatically generate and append missing sections to model output

import { AssertionResult } from './assertions'

// Patch requirement derived from failed validation check
export interface PatchRequirement {
  sectionTitle: string  // Normalized section name (e.g., "INTRO", "CALL TO ACTION")
  rationale?: string    // Optional: why this section is needed
}

// Request payload for patch API
export interface PatchRequest {
  snippetId: string
  inputValues: Record<string, string>
  originalOutput: string
  requirements: PatchRequirement[]
  snippetContext?: {
    title: string
    description: string
    category?: string
  }
}

// Response from patch API
export interface PatchResponse {
  patchText: string     // Generated sections to append
  sectionsAdded: string[]  // List of section titles that were added
}

// Error response
export interface PatchError {
  error: string
  details?: string
}

/**
 * Extract patchable requirements from failed validation checks
 * Only returns requirements for structural section checks (contains type)
 */
export function buildPatchRequirements(
  results: AssertionResult[]
): PatchRequirement[] {
  const requirements: PatchRequirement[] = []
  const seen = new Set<string>()

  for (const result of results) {
    // Skip passed checks
    if (result.passed) continue

    // Only patch 'contains' type failures (structural sections)
    if (result.assertion.type !== 'contains') continue

    // Extract section title from assertion value
    const sectionTitle = String(result.assertion.value).trim().toUpperCase()

    // De-duplicate
    if (seen.has(sectionTitle)) continue
    seen.add(sectionTitle)

    requirements.push({
      sectionTitle,
      rationale: result.assertion.description
    })
  }

  return requirements
}
