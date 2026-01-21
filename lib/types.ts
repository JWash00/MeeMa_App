export type SnippetScope = 'official' | 'private' | 'public'

export interface Snippet {
  id: string
  title: string
  description: string
  tags: string[]
  language: string
  code: string
  provider?: string | null
  scope: SnippetScope
  owner_id?: string | null
  created_at?: string
  updated_at?: string
  // Extended fields for workflows and QA
  type?: 'prompt' | 'workflow'
  template?: string
  inputs_schema?: Record<string, any>
  version?: string
  audience?: 'creator' | 'developer' | 'both'
  category?: string
  // NEW: Agent workflow fields (future-proofing)
  isAgentReady?: boolean
  outputsSchema?: Record<string, any>
}

export interface SnippetFilters {
  language?: string
  provider?: string
  tags?: string[]
}

export type EventType = 'view' | 'copy'

export interface SnippetEvent {
  id?: string
  snippet_id: string
  event_type: EventType
  user_id?: string | null
  created_at?: string
}

export interface ProductionChecklistItem {
  label: string
  checked: boolean
  description?: string
}
