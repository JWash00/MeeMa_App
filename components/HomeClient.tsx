'use client'

import { useState, useMemo } from 'react'
import { Snippet } from '@/lib/types'
import Shell from './layout/Shell'
import SnippetList from './SnippetList'
import FilterBar from './FilterBar'
import SnippetDrawer from './SnippetDrawer'
import { useDeveloperMode } from '@/lib/hooks/useDeveloperMode'
import { isVisibleForMode } from '@/lib/utils/snippetHelpers'
import { LIBRARY } from '@/lib/voice/voice'

interface HomeClientProps {
  initialSnippets: Snippet[]
  languages: string[]
  providers: string[]
  allTags: string[]
}

export default function HomeClient({
  initialSnippets,
  languages,
  providers,
  allTags,
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const { isDeveloperMode } = useDeveloperMode()

  const filteredSnippets = useMemo(() => {
    // First filter by audience based on developer mode
    let results = initialSnippets.filter(snippet =>
      isVisibleForMode(snippet, isDeveloperMode)
    )

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
        snippet.language.toLowerCase().includes(query) ||
        (snippet.provider && snippet.provider.toLowerCase().includes(query))
      )
    }

    // Apply language filter
    if (selectedLanguage) {
      results = results.filter(snippet => snippet.language === selectedLanguage)
    }

    // Apply provider filter
    if (selectedProvider) {
      results = results.filter(snippet => snippet.provider === selectedProvider)
    }

    // Apply tags filter (snippet must have ALL selected tags)
    if (selectedTags.length > 0) {
      results = results.filter(snippet =>
        selectedTags.every(tag => snippet.tags.includes(tag))
      )
    }

    return results
  }, [initialSnippets, isDeveloperMode, searchQuery, selectedLanguage, selectedProvider, selectedTags])

  const handleClearFilters = () => {
    setSelectedLanguage('')
    setSelectedProvider('')
    setSelectedTags([])
  }

  const hasActiveFilters = selectedLanguage || selectedProvider || selectedTags.length > 0

  return (
    <Shell searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {LIBRARY.pageTitle}
          </h1>
          <p className="text-text-secondary">
            {LIBRARY.pageSubtitle}
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          languages={languages}
          providers={providers}
          allTags={allTags}
          selectedLanguage={selectedLanguage}
          selectedProvider={selectedProvider}
          selectedTags={selectedTags}
          onLanguageChange={setSelectedLanguage}
          onProviderChange={setSelectedProvider}
          onTagsChange={setSelectedTags}
        />

        {/* Results count and clear filters */}
        <div className="mb-6 flex items-center justify-between text-sm text-text-secondary">
          <div>
            {(searchQuery || hasActiveFilters) && (
              <p>
                Found {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-accent hover:text-accent-hover font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Snippet List */}
        <SnippetList snippets={filteredSnippets} onSnippetClick={setSelectedSnippet} />
      </div>

      {/* Snippet Drawer */}
      <SnippetDrawer
        snippet={selectedSnippet}
        onClose={() => setSelectedSnippet(null)}
      />
    </Shell>
  )
}
