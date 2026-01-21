'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import LibraryClient from './LibraryClient'
import Sidebar from '@/components/layout/Sidebar'
import { useLibraryRoute } from '@/lib/hooks/useLibraryRoute'

interface LibraryPageWrapperProps {
  initialSnippets: Snippet[]
  languages: string[]
  providers: string[]
  allTags: string[]
}

export default function LibraryPageWrapper({
  initialSnippets,
  languages,
  providers,
  allTags,
}: LibraryPageWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { activeView, setActiveView } = useLibraryRoute()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView?.id || null}
        onViewSelect={setActiveView}
      />

      {/* Main content */}
      <LibraryClient
        initialSnippets={initialSnippets}
        languages={languages}
        providers={providers}
        allTags={allTags}
        activeSavedView={activeView}
      />
    </div>
  )
}
