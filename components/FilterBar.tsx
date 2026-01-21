'use client'

interface FilterBarProps {
  languages: string[]
  providers: string[]
  allTags: string[]
  selectedLanguage: string
  selectedProvider: string
  selectedTags: string[]
  onLanguageChange: (language: string) => void
  onProviderChange: (provider: string) => void
  onTagsChange: (tags: string[]) => void
}

export default function FilterBar({
  languages,
  providers,
  allTags,
  selectedLanguage,
  selectedProvider,
  selectedTags,
  onLanguageChange,
  onProviderChange,
  onTagsChange,
}: FilterBarProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className="mb-8 max-w-7xl mx-auto">
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language Filter */}
          <div>
            <label htmlFor="language-filter" className="block text-sm font-medium text-muted mb-2">
              Language
            </label>
            <select
              id="language-filter"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50"
            >
              <option value="">All languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label htmlFor="provider-filter" className="block text-sm font-medium text-muted mb-2">
              Provider
            </label>
            <select
              id="provider-filter"
              value={selectedProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50"
            >
              <option value="">All providers</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-bg border border-border rounded-md">
              {allTags.length === 0 ? (
                <span className="text-sm text-muted">No tags available</span>
              ) : (
                allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-accent/10 border border-accent text-accent'
                        : 'bg-surface-2 text-muted hover:bg-surface-2 hover:text-text'
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
            {selectedTags.length > 0 && (
              <p className="mt-2 text-xs text-muted">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
