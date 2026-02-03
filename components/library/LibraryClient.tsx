'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { Search, SlidersHorizontal, Grid3X3, List, Plus, ChevronDown, X } from 'lucide-react'
import GlowingSearchBar from '@/components/ui/GlowingSearchBar'
import { Snippet } from '@/lib/types'
import { PromptCard, PromptCardData, PromptStatus, Provider, Language } from './PromptCard'
import { TrustLevel } from './TrustBadge'
import { LibraryViewTabs, LibraryView } from './LibraryViewTabs'
import { FilterDrawer, FilterState } from './FilterDrawer'
import SnippetDrawer from '@/components/SnippetDrawer'
import { qaEvaluate } from '@/lib/qa/qaRouter'
import { computeTrustStatus } from '@/lib/trust/trustUtils'
import { LAYOUT, GRID, TEST_IDS, GRID_CLASSES, TYPO_CLASSES } from './uiTokens'
import { useGridColumnWarning, logSpecCheck } from './devWarnings'
import { SavedView, SavedViewQuery, Capability } from '@/lib/sidebar/types'
import { inferCapability } from '@/lib/sidebar/capabilityMapping'

interface LibraryClientProps {
  initialSnippets: Snippet[]
  languages: string[]
  providers: string[]
  allTags: string[]
  activeSavedView?: SavedView | null
}

type SortOption = 'recent' | 'popular' | 'alpha'

const sortOptions: { id: SortOption; label: string }[] = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'alpha', label: 'Alphabetical' },
]

// Convert Snippet to PromptCardData
function snippetToCardData(snippet: Snippet): PromptCardData {
  // Compute trust from QA
  const qaResult = qaEvaluate(snippet)
  const trustStatus = computeTrustStatus(qaResult)

  // Map trust status to TrustLevel
  // TrustStatus is 'verified' | 'patched' | 'draft'
  // TrustLevel is 'basic' | 'verified' | 'gold'
  let trust: TrustLevel = 'basic'
  if (trustStatus === 'verified') {
    // Check if it's a "gold" level (has version, examples, etc.)
    const hasVersion = !!snippet.version
    const hasInputSchema = snippet.inputs_schema && Object.keys(snippet.inputs_schema).length > 0
    trust = hasVersion && hasInputSchema ? 'gold' : 'verified'
  } else if (trustStatus === 'patched') {
    trust = 'verified'
  }

  // Map provider
  let provider: Provider | undefined
  if (snippet.provider) {
    const p = snippet.provider.toLowerCase()
    if (p.includes('openai') || p.includes('gpt')) provider = 'openai'
    else if (p.includes('anthropic') || p.includes('claude')) provider = 'anthropic'
    else if (p.includes('google') || p.includes('gemini')) provider = 'google'
    else provider = 'other'
  }

  // Map language
  let language: Language | undefined
  if (snippet.language) {
    const l = snippet.language.toLowerCase()
    if (l.includes('typescript') || l === 'ts') language = 'ts'
    else if (l.includes('python') || l === 'py') language = 'py'
    else if (l.includes('json')) language = 'json'
  }

  return {
    id: snippet.id,
    title: snippet.title,
    description: snippet.description,
    primaryAction: snippet.type === 'workflow' ? 'run' : 'view',
    modality: snippet.type === 'workflow' ? 'workflow' : 'text',
    provider,
    language,
    tags: snippet.tags,
    status: 'published' as PromptStatus,
    trust,
    isFavorited: false,
    updatedAt: snippet.updated_at,
    capability: inferCapability(snippet),
    isAgentReady: snippet.isAgentReady || false,
  }
}

// Apply saved view query filters to cards
function applyViewQuery(cards: PromptCardData[], query: SavedViewQuery): PromptCardData[] {
  let result = cards

  // NEW: Filter by capability
  if (query.capability) {
    result = result.filter((card) => card.capability === query.capability)
  }

  // NEW: Filter by agent-ready
  if (query.agentReady !== undefined) {
    result = result.filter((card) => card.isAgentReady === query.agentReady)
  }

  // NEW: Filter by favorited
  if (query.favorited) {
    result = result.filter((card) => card.isFavorited === true)
  }

  // NEW: Filter by recent (last 30 days)
  if (query.recent) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    result = result.filter((card) => {
      const updatedAt = card.updatedAt ? new Date(card.updatedAt) : null
      return updatedAt && updatedAt >= thirtyDaysAgo
    })
  }

  // NEW: Filter by drafts
  if (query.drafts) {
    result = result.filter((card) => card.status === 'draft')
  }

  // Filter by tags (OR logic - match any tag)
  if (query.tags && query.tags.length > 0) {
    result = result.filter((card) =>
      card.tags?.some((tag) =>
        query.tags!.some((queryTag) => tag.toLowerCase().includes(queryTag.toLowerCase()))
      )
    )
  }

  // Filter by modalities
  if (query.modalities && query.modalities.length > 0) {
    result = result.filter((card) => card.modality && query.modalities!.includes(card.modality))
  }

  // Filter by trust levels
  if (query.trust && query.trust.length > 0) {
    result = result.filter((card) => query.trust!.includes(card.trust))
  }

  // Filter by status
  if (query.status && query.status.length > 0) {
    result = result.filter((card) => query.status!.includes(card.status))
  }

  // Filter by providers
  if (query.providers && query.providers.length > 0) {
    result = result.filter((card) => card.provider && query.providers!.includes(card.provider))
  }

  // Filter by languages
  if (query.languages && query.languages.length > 0) {
    result = result.filter((card) => card.language && query.languages!.includes(card.language))
  }

  return result
}

export default function LibraryClient({
  initialSnippets,
  languages,
  providers,
  allTags,
  activeSavedView,
}: LibraryClientProps) {
  // Ref for grid column warning
  const gridRef = useRef<HTMLDivElement>(null)

  // STRICT SPEC: Dev warnings
  useGridColumnWarning(gridRef)

  // Log spec check on mount (dev only)
  useEffect(() => {
    logSpecCheck()
  }, [])

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<LibraryView>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    languages: [],
    tags: [],
    statuses: [],
    trustLevels: [],
  })

  // Convert snippets to card data
  const cardData = useMemo(() => {
    return initialSnippets.map(snippetToCardData)
  }, [initialSnippets])

  // Filter and sort
  const filteredCards = useMemo(() => {
    let result = [...cardData]

    // Apply saved view query first (if active)
    if (activeSavedView?.query) {
      result = applyViewQuery(result, activeSavedView.query)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (card) =>
          card.title.toLowerCase().includes(query) ||
          card.description.toLowerCase().includes(query) ||
          card.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // View filter
    if (activeView === 'collections') {
      result = result.filter((card) => card.collectionName)
    } else if (activeView === 'modalities') {
      // Group by modality - show all but could be filtered further
    } else if (activeView === 'use-cases') {
      // Show by category/use-case
    }

    // Provider filter
    if (filters.providers.length > 0) {
      result = result.filter((card) => card.provider && filters.providers.includes(card.provider))
    }

    // Language filter
    if (filters.languages.length > 0) {
      result = result.filter((card) => card.language && filters.languages.includes(card.language))
    }

    // Tag filter
    if (filters.tags.length > 0) {
      result = result.filter((card) => card.tags?.some((tag) => filters.tags.includes(tag)))
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((card) => filters.statuses.includes(card.status))
    }

    // Trust filter
    if (filters.trustLevels.length > 0) {
      result = result.filter((card) => filters.trustLevels.includes(card.trust))
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return dateB - dateA
      })
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.uses || 0) - (a.uses || 0))
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [cardData, searchQuery, activeView, filters, sortBy, activeSavedView])

  const activeFilterCount =
    filters.providers.length +
    filters.languages.length +
    filters.tags.length +
    filters.statuses.length +
    filters.trustLevels.length

  // Get active filter chips (max 3)
  const activeFilterChips = useMemo(() => {
    const chips: { label: string; type: keyof FilterState; value: string }[] = []

    filters.providers.forEach((p) => chips.push({ label: p, type: 'providers', value: p }))
    filters.languages.forEach((l) => chips.push({ label: l, type: 'languages', value: l }))
    filters.tags.slice(0, 2).forEach((t) => chips.push({ label: t, type: 'tags', value: t }))
    filters.trustLevels.forEach((t) => chips.push({ label: t, type: 'trustLevels', value: t }))

    return chips.slice(0, 3)
  }, [filters])

  const removeFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: (prev[type] as string[]).filter((v) => v !== value),
    }))
  }

  const handleCardClick = (cardId: string) => {
    const snippet = initialSnippets.find((s) => s.id === cardId)
    if (snippet) {
      setSelectedSnippet(snippet)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-surface-hover">
          <div className="px-6 py-4">
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* STRICT SPEC: Title 28px/700 */}
                <h1 className={cn(TYPO_CLASSES.pageTitle, 'text-foreground')}>
                  {activeSavedView ? `Library · ${activeSavedView.label}` : 'Library'}
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  {activeSavedView
                    ? `Browse ${activeSavedView.label.toLowerCase()} prompts`
                    : 'Browse and discover prompts'}
                </p>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                {/* Grid/List toggle */}
                <div className="hidden sm:flex items-center p-1 bg-surface-hover rounded-lg border border-surface-hover">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground'
                        : 'text-text-secondary hover:text-foreground'
                    )}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'list'
                        ? 'bg-background text-foreground'
                        : 'text-text-secondary hover:text-foreground'
                    )}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Sort menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface-hover border border-surface-hover rounded-lg text-sm text-text-secondary hover:text-foreground hover:border-text-muted transition-colors"
                  >
                    {sortOptions.find((o) => o.id === sortBy)?.label}
                    <ChevronDown size={16} className={cn('transition-transform', showSortMenu && 'rotate-180')} />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-surface-hover border border-surface-hover rounded-lg shadow-xl z-20 py-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSortBy(option.id)
                              setShowSortMenu(false)
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm transition-colors',
                              sortBy === option.id
                                ? 'text-foreground bg-background'
                                : 'text-text-secondary hover:text-foreground hover:bg-background/50'
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* New Prompt button */}
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(28,215,96,0.2)] hover:shadow-[0_4px_12px_rgba(28,215,96,0.25)] transition-all">
                  <Plus size={18} />
                  New Prompt
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="mb-4">
              <GlowingSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search prompts..."
                variant="rounded"
              />
            </div>

            {/* Tabs and filter row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <LibraryViewTabs activeView={activeView} onViewChange={setActiveView} />

              <div className="flex items-center gap-3">
                {/* Active filter chips */}
                {activeFilterChips.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2">
                    {activeFilterChips.map((chip) => (
                      <span
                        key={`${chip.type}-${chip.value}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent border border-accent/30 text-xs font-medium rounded-full"
                      >
                        {chip.label}
                        <button
                          onClick={() => removeFilter(chip.type, chip.value)}
                          className="hover:text-text transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Filter button */}
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeFilterCount > 0
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-border text-muted hover:text-text hover:border-accent/30'
                  )}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1">({activeFilterCount})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* STRICT SPEC: Results area max-w-1200px */}
        <main className="px-6 py-6 max-w-[1200px]">
          {/* Results count */}
          <p className="text-sm text-text-muted mb-4">
            {filteredCards.length} {filteredCards.length === 1 ? 'prompt' : 'prompts'}
          </p>

          {/* STRICT SPEC: Grid gap-20px, columns 3/2/1 at 1280/900/0 breakpoints */}
          {filteredCards.length > 0 ? (
            <div
              ref={gridRef}
              data-testid={TEST_IDS.LIBRARY_GRID}
              className={cn(
                GRID_CLASSES.container,
                viewMode === 'grid'
                  ? GRID_CLASSES.responsive
                  : 'grid-cols-1'
              )}
            >
              {filteredCards.map((card) => (
                <PromptCard
                  key={card.id}
                  data={card}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                <Search size={24} className="text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No prompts found</h3>
              <p className="text-sm text-text-secondary mb-4 max-w-sm">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() =>
                    setFilters({
                      providers: [],
                      languages: [],
                      tags: [],
                      statuses: [],
                      trustLevels: [],
                    })
                  }
                  className="px-4 py-2 bg-surface-hover text-foreground text-sm font-medium rounded-lg hover:bg-surface-hover/80 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={allTags}
        availableProviders={providers}
        availableLanguages={languages}
      />

      {/* Snippet drawer */}
      {selectedSnippet && (
        <SnippetDrawer
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
        />
      )}
    </div>
  )
}
