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
