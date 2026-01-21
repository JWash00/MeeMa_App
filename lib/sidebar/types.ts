/**
 * Sidebar types for Capability-Based Navigation and Saved Views
 */

// DEPRECATED: Kept for backwards compatibility during transition
export type AudienceMode = 'all' | 'creator' | 'dev'

/**
 * Capability taxonomy for organizing prompts by what creators want to DO with AI
 */
export type Capability =
  | 'image_visual'
  | 'video_motion'
  | 'audio_voice'
  | 'writing_text'
  | 'social_marketing'
  | 'automation_apps'

/**
 * Saved view with capability-based organization
 */
export interface SavedView {
  id: string
  label: string
  icon?: any // lucide-react icon
  section: 'workspaces' | 'capabilities' | 'collections' | 'my_library'
  audience?: AudienceMode[] // Optional now, for backwards compatibility
  query: SavedViewQuery
  locked?: {
    plan: 'pro' | 'team'
    reason: string
  }
  comingSoon?: boolean
}

/**
 * Query interface for filtering prompts
 */
export interface SavedViewQuery {
  // Existing dimension filters
  tags?: string[]
  modalities?: ('text' | 'image' | 'video' | 'audio' | 'doc' | 'workflow')[]
  trust?: ('basic' | 'verified' | 'gold')[]
  status?: ('draft' | 'published' | 'production')[]
  providers?: ('openai' | 'anthropic' | 'google' | 'other')[]
  languages?: ('ts' | 'py' | 'json' | 'none')[]

  // NEW: Capability-based filtering
  capability?: Capability

  // NEW: Future-proofing for agent workflows
  agentReady?: boolean

  // NEW: My Library filters
  favorited?: boolean
  recent?: boolean
  drafts?: boolean
}
