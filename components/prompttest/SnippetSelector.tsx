'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Snippet } from '@/lib/types';

interface SnippetSelectorProps {
  snippets: Snippet[];
  selectedSnippet: Snippet | null;
  onSelect: (snippet: Snippet) => void;
}

export default function SnippetSelector({ snippets, selectedSnippet, onSelect }: SnippetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter snippets by search query
  const filteredSnippets = snippets.filter((snippet) => {
    const searchText = `${snippet.title} ${snippet.description || ''}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  // Helper to get type badge color
  const getTypeBadgeColor = (type?: string) => {
    if (type === 'workflow') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden h-[calc(100vh-16rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-spotify-gray dark:border-spotify-gray">
        <h2 className="text-lg font-semibold text-white dark:text-white mb-3">Select Snippet</h2>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-lightgray dark:text-spotify-lightgray"
          />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-spotify-gray dark:bg-spotify-gray text-white dark:text-white rounded-md text-sm placeholder:text-spotify-lightgray/60 dark:placeholder:text-spotify-lightgray/60 focus:outline-none focus:ring-2 focus:ring-spotify-green dark:focus:ring-spotify-green"
          />
        </div>
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSnippets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-spotify-lightgray dark:text-spotify-lightgray text-sm">
              No snippets found
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredSnippets.map((snippet) => (
              <button
                key={snippet.id}
                onClick={() => onSelect(snippet)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSnippet?.id === snippet.id
                    ? 'bg-spotify-green/20 border-2 border-spotify-green dark:bg-spotify-green/20 dark:border-spotify-green'
                    : 'bg-spotify-gray hover:bg-spotify-gray/80 border-2 border-transparent dark:bg-spotify-gray dark:hover:bg-spotify-gray/80'
                }`}
              >
                {/* Title */}
                <h3
                  className={`font-semibold text-sm mb-1 line-clamp-1 ${
                    selectedSnippet?.id === snippet.id
                      ? 'text-spotify-green dark:text-spotify-green'
                      : 'text-white dark:text-white'
                  }`}
                >
                  {snippet.title}
                </h3>

                {/* Metadata */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Type Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full border ${getTypeBadgeColor(snippet.type)}`}
                  >
                    {snippet.type || 'prompt'}
                  </span>

                  {/* Version */}
                  {snippet.version && (
                    <span className="text-spotify-lightgray dark:text-spotify-lightgray">
                      v{snippet.version}
                    </span>
                  )}

                  {/* Category */}
                  {snippet.category && (
                    <span className="text-spotify-lightgray dark:text-spotify-lightgray">
                      {snippet.category}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-spotify-gray dark:border-spotify-gray">
        <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">
          {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
}
