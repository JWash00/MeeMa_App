import { Snippet } from '@/lib/types'

/**
 * Check if snippet is visible to creator audience
 */
export function isCreatorVisible(snippet: Snippet): boolean {
  return !snippet.audience ||
         snippet.audience === 'creator' ||
         snippet.audience === 'both'
}

/**
 * Check if snippet is a workflow
 */
export function isWorkflow(snippet: Snippet): boolean {
  return snippet.type === 'workflow'
}

/**
 * Apply search and category filters to snippets
 */
export function applySearchAndCategoryFilters(
  snippets: Snippet[],
  searchQuery: string,
  selectedCategory: string
): Snippet[] {
  let results = snippets

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    results = results.filter(snippet =>
      snippet.title.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
      snippet.language.toLowerCase().includes(query) ||
      (snippet.provider && snippet.provider.toLowerCase().includes(query)) ||
      (snippet.category && snippet.category.toLowerCase().includes(query))
    )
  }

  // Apply category filter
  if (selectedCategory) {
    results = results.filter(snippet => snippet.category === selectedCategory)
  }

  return results
}

/**
 * Get featured workflows by IDs
 */
export function getFeaturedWorkflows(
  snippets: Snippet[],
  featuredIds: string[]
): Snippet[] {
  return featuredIds
    .map(id => snippets.find(s => s.id === id))
    .filter((s): s is Snippet =>
      s !== undefined &&
      isWorkflow(s) &&
      isCreatorVisible(s)
    )
}

/**
 * Normalize snippet type - treat missing/null as 'prompt'
 */
export function normalizeType(snippet: Snippet): 'prompt' | 'workflow' {
  return snippet.type === 'workflow' ? 'workflow' : 'prompt'
}

/**
 * Calculate recommendation score for a snippet
 * Higher score = more recommended
 */
export function calculateRecommendationScore(
  snippet: Snippet,
  selectedCategory: string
): number {
  let score = 0

  // +100 for workflows (prioritize workflows)
  if (normalizeType(snippet) === 'workflow') {
    score += 100
  }

  // +40 if category matches (when category selected)
  if (selectedCategory && snippet.category === selectedCategory) {
    score += 40
  }

  // +2 per tag (max 10 points) - proxy for richness
  const tagScore = Math.min((snippet.tags?.length || 0) * 2, 10)
  score += tagScore

  // +0-20 for recency (updated_at or created_at)
  const timestamp = snippet.updated_at || snippet.created_at
  if (timestamp) {
    const ageInDays = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24)
    // Newer = higher score, max 20 points for items < 30 days old
    const recencyScore = Math.max(0, 20 - Math.floor(ageInDays / 15))
    score += recencyScore
  }

  return score
}

/**
 * Build recommended snippets list
 * Excludes featured IDs, filters by audience, sorts by score
 */
export function buildRecommended(
  snippets: Snippet[],
  featuredIds: string[],
  selectedCategory: string,
  limit: number = 8
): Snippet[] {
  const featuredSet = new Set(featuredIds)

  return snippets
    // Exclude featured items
    .filter(s => !featuredSet.has(s.id))
    // Only creator-visible
    .filter(isCreatorVisible)
    // Score and sort
    .map(s => ({ snippet: s, score: calculateRecommendationScore(s, selectedCategory) }))
    .sort((a, b) => b.score - a.score)
    // Take top N
    .slice(0, limit)
    .map(item => item.snippet)
}

/**
 * Apply type filter to snippets
 */
export function applyTypeFilter(
  snippets: Snippet[],
  selectedType: 'all' | 'workflow' | 'prompt'
): Snippet[] {
  if (selectedType === 'all') return snippets
  return snippets.filter(s => normalizeType(s) === selectedType)
}

/**
 * Normalize version - return "1.0" for missing versions
 */
export function normalizeVersion(snippet: Snippet): string {
  return snippet.version || '1.0'
}

/**
 * Get content text from snippet - prefers template for workflows
 */
export function getContentText(snippet: Snippet): string {
  if (snippet.type === 'workflow' && snippet.template) {
    return snippet.template
  }
  return snippet.code || snippet.template || ''
}

/**
 * Check if snippet is visible based on developer mode
 * Developer mode: show all audiences
 * Creator mode (default): show only creator/both
 */
export function isVisibleForMode(snippet: Snippet, isDeveloperMode: boolean): boolean {
  if (isDeveloperMode) {
    return true
  }
  return isCreatorVisible(snippet)
}

/**
 * Get raw template text for developer view
 * Returns template for workflows, code for prompts (with fallbacks)
 */
export function getRawTemplateText(snippet: Snippet): string {
  if (snippet.type === 'workflow') {
    return snippet.template || snippet.code || ''
  }
  return snippet.code || snippet.template || ''
}
