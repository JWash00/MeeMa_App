'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SavedView } from '@/lib/sidebar/types'
import { findViewById } from '@/lib/sidebar/savedViews'

export function useLibraryRoute() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeView, setActiveViewState] = useState<SavedView | null>(null)
  const [mounted, setMounted] = useState(false)

  // Read URL params + localStorage on mount
  useEffect(() => {
    setMounted(true)

    const urlView = searchParams.get('view')

    // Try to get last view from localStorage
    let storedViewId: string | null = null
    try {
      storedViewId = localStorage.getItem('libraryLastView')
    } catch (e) {
      // localStorage might be disabled
    }

    // Priority: URL > localStorage
    const viewId = urlView || storedViewId
    if (viewId) {
      const view = findViewById(viewId)
      if (view) {
        setActiveViewState(view)
      }
    }
  }, [searchParams])

  // Update URL when state changes (shallow routing)
  const updateURL = (viewId: string | null) => {
    if (!mounted) return

    const params = new URLSearchParams(searchParams.toString())

    // Set view param
    if (viewId) {
      params.set('view', viewId)
    } else {
      params.delete('view')
    }

    const query = params.toString()
    const newURL = query ? `${pathname}?${query}` : pathname
    router.replace(newURL, { scroll: false })
  }

  const setActiveView = (view: SavedView | null) => {
    setActiveViewState(view)

    // Persist last view to localStorage
    try {
      if (view?.id) {
        localStorage.setItem('libraryLastView', view.id)
      } else {
        localStorage.removeItem('libraryLastView')
      }
    } catch (e) {
      // localStorage might be disabled
    }

    updateURL(view?.id || null)
  }

  return {
    activeView,
    setActiveView,
    mounted,
  }
}
