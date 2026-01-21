import { createClient } from './server'
import { Snippet, SnippetFilters } from '../types'

/**
 * SCHEMA REQUIREMENTS:
 *
 * This file assumes the following columns exist in the 'snippets' table:
 * - category (TEXT) - Creator job category
 * - audience (TEXT) - Target audience: 'creator', 'developer', or 'both'
 * - type (TEXT) - Prompt type: 'prompt' or 'workflow'
 * - version (TEXT) - Version number (e.g., "1.0")
 * - template (TEXT) - Workflow template with {{placeholders}}
 * - inputs_schema (JSONB) - Workflow input field definitions
 *
 * If these columns don't exist yet, run the migration in SCHEMA_UPDATES.md
 * The app will function without them, but new features won't work.
 */

/**
 * Fetch all public snippets with optional filters
 * Server-side only
 */
export async function getSnippets(filters?: SnippetFilters): Promise<Snippet[]> {
  const supabase = await createClient()

  let query = supabase
    .from('snippets')
    .select('*')
    .in('scope', ['official', 'public'])
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.language) {
    query = query.eq('language', filters.language)
  }

  if (filters?.provider) {
    query = query.eq('provider', filters.provider)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching snippets:', error)
    throw new Error(`Failed to fetch snippets: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single snippet by ID
 * Server-side only
 */
export async function getSnippetById(id: string): Promise<Snippet | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', id)
    .in('scope', ['official', 'public'])
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    console.error('Error fetching snippet:', error)
    throw new Error(`Failed to fetch snippet: ${error.message}`)
  }

  return data
}

/**
 * Get unique languages from all snippets
 * Server-side only
 */
export async function getUniqueLanguages(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('snippets')
    .select('language')
    .in('scope', ['official', 'public'])

  if (error) {
    console.error('Error fetching languages:', error)
    return []
  }

  const languages = [...new Set(data.map(s => s.language))].sort()
  return languages
}

/**
 * Get unique providers from all snippets
 * Server-side only
 */
export async function getUniqueProviders(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('snippets')
    .select('provider')
    .in('scope', ['official', 'public'])
    .not('provider', 'is', null)

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  const providers = [...new Set(data.map(s => s.provider).filter(Boolean) as string[])].sort()
  return providers
}

/**
 * Get all unique tags from all snippets
 * Server-side only
 */
export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('snippets')
    .select('tags')
    .in('scope', ['official', 'public'])

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  const allTags = new Set<string>()
  data.forEach(snippet => {
    snippet.tags?.forEach((tag: string) => allTags.add(tag))
  })

  return Array.from(allTags).sort()
}

/**
 * Get unique categories from all snippets
 * Server-side only
 */
export async function getUniqueCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('snippets')
    .select('category')
    .in('scope', ['official', 'public'])
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set(data.map(s => s.category).filter(Boolean) as string[])].sort()
  return categories
}
