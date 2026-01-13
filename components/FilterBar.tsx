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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language Filter */}
          <div>
            <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language-filter"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              id="provider-filter"
              value={selectedProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {allTags.length === 0 ? (
                <span className="text-sm text-gray-500">No tags available</span>
              ) : (
                allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
            {selectedTags.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
