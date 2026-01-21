'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { X, Search, Check } from 'lucide-react'
import { TrustLevel } from './TrustBadge'
import { PromptStatus, Provider, Language } from './PromptCard'
import { DRAWER, TEST_IDS, DRAWER_CLASSES } from './uiTokens'
import { useDrawerWidthWarning } from './devWarnings'

export interface FilterState {
  providers: Provider[]
  languages: Language[]
  tags: string[]
  statuses: PromptStatus[]
  trustLevels: TrustLevel[]
}

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableTags: string[]
  availableProviders: string[]
  availableLanguages: string[]
}

const providerOptions: { id: Provider; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'google', label: 'Google' },
  { id: 'other', label: 'Other' },
]

const languageOptions: { id: Language; label: string }[] = [
  { id: 'ts', label: 'TypeScript' },
  { id: 'py', label: 'Python' },
  { id: 'json', label: 'JSON' },
]

const statusOptions: { id: PromptStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'production', label: 'Production' },
]

const trustOptions: { id: TrustLevel; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'verified', label: 'Verified' },
  { id: 'gold', label: 'Gold' },
]

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableTags,
}: FilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const [tagSearch, setTagSearch] = useState('')

  // STRICT SPEC: Dev warning for drawer width
  useDrawerWidthWarning(drawerRef, isOpen)

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleProvider = (provider: Provider) => {
    const newProviders = filters.providers.includes(provider)
      ? filters.providers.filter((p) => p !== provider)
      : [...filters.providers, provider]
    onFiltersChange({ ...filters, providers: newProviders })
  }

  const toggleLanguage = (language: Language) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...filters.languages, language]
    onFiltersChange({ ...filters, languages: newLanguages })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const toggleStatus = (status: PromptStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const toggleTrust = (trust: TrustLevel) => {
    const newTrust = filters.trustLevels.includes(trust)
      ? filters.trustLevels.filter((t) => t !== trust)
      : [...filters.trustLevels, trust]
    onFiltersChange({ ...filters, trustLevels: newTrust })
  }

  const clearAll = () => {
    onFiltersChange({
      providers: [],
      languages: [],
      tags: [],
      statuses: [],
      trustLevels: [],
    })
  }

  const activeFilterCount =
    filters.providers.length +
    filters.languages.length +
    filters.tags.length +
    filters.statuses.length +
    filters.trustLevels.length

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  )

  return (
    <>
      {/* STRICT SPEC: Backdrop overlay 50% opacity */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity duration-300',
          DRAWER_CLASSES.overlay,
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* STRICT SPEC: Drawer w-360px, p-16px */}
      <div
        ref={drawerRef}
        data-testid={TEST_IDS.FILTER_DRAWER}
        className={cn(
          'fixed top-0 right-0 h-full',
          'w-[360px]',
          'bg-background border-l border-surface-hover',
          'z-50 flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-hover">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-secondary hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Provider */}
          <FilterSection title="Provider">
            <div className="flex flex-wrap gap-2">
              {providerOptions.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  isSelected={filters.providers.includes(option.id)}
                  onClick={() => toggleProvider(option.id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Language */}
          <FilterSection title="Language">
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  isSelected={filters.languages.includes(option.id)}
                  onClick={() => toggleLanguage(option.id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Tags */}
          <FilterSection title="Tags">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-hover border border-surface-hover rounded-lg text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-text-muted"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <FilterChip
                  key={tag}
                  label={tag}
                  isSelected={filters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
              {filteredTags.length === 0 && (
                <p className="text-zinc-500 text-sm">No tags found</p>
              )}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Status">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  isSelected={filters.statuses.includes(option.id)}
                  onClick={() => toggleStatus(option.id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Trust Level */}
          <FilterSection title="Trust Level">
            <div className="flex flex-wrap gap-2">
              {trustOptions.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  isSelected={filters.trustLevels.includes(option.id)}
                  onClick={() => toggleTrust(option.id)}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        {/* STRICT SPEC: Footer h-56px */}
        <div className="h-[56px] px-6 border-t border-surface-hover flex items-center justify-between gap-4">
          <button
            onClick={clearAll}
            disabled={activeFilterCount === 0}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeFilterCount > 0
                ? 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
                : 'text-text-muted cursor-not-allowed'
            )}
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-300 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
        isSelected
          ? 'bg-accent/10 border border-accent text-accent'
          : 'bg-surface-2 text-muted hover:text-text hover:bg-surface-2'
      )}
    >
      {isSelected && <Check size={14} />}
      {label}
    </button>
  )
}
