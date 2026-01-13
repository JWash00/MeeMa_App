'use client'

import { useState, useMemo } from 'react'
import { Snippet } from '@/lib/types'
import SearchBar from './SearchBar'
import SnippetList from './SnippetList'
import FilterBar from './FilterBar'

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

  const filteredSnippets = useMemo(() => {
    let results = initialSnippets

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
  }, [initialSnippets, searchQuery, selectedLanguage, selectedProvider, selectedTags])

  const handleClearFilters = () => {
    setSelectedLanguage('')
    setSelectedProvider('')
    setSelectedTags([])
  }

  const hasActiveFilters = selectedLanguage || selectedProvider || selectedTags.length > 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            PromptKit
          </h1>
          <p className="text-xl text-gray-600">
            Production-ready AI integration snippets.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-3xl mx-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
        <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
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
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Snippet List */}
        <SnippetList snippets={filteredSnippets} />
      </div>
    </main>
  )
}
