'use client'

import { cn } from '@/lib/utils/cn'
import { TEST_IDS, CONTROLS } from './uiTokens'

export type LibraryView = 'all' | 'use-cases' | 'modalities' | 'collections'

interface LibraryViewTabsProps {
  activeView: LibraryView
  onViewChange: (view: LibraryView) => void
  className?: string
}

const tabs: { id: LibraryView; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'modalities', label: 'Modalities' },
  { id: 'collections', label: 'Collections' },
]

export function LibraryViewTabs({ activeView, onViewChange, className }: LibraryViewTabsProps) {
  return (
    // STRICT SPEC: Container with pill shape
    <div
      data-testid={TEST_IDS.LIBRARY_TABS}
      className={cn('inline-flex p-1 bg-surface-hover rounded-full border border-surface-hover', className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={cn(
            // STRICT SPEC: h-32px, px-12px, rounded-full, text-13px
            'h-[32px] px-[12px] rounded-full text-[13px] font-medium',
            'transition-all duration-150',
            activeView === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-text-secondary hover:text-foreground hover:bg-background/50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
