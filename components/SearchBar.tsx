'use client'

import { Search } from 'lucide-react'
import { LIBRARY } from '@/lib/voice/voice'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
      <input
        type="text"
        placeholder={LIBRARY.search.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-full text-text placeholder-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50 transition-all"
      />
    </div>
  )
}
