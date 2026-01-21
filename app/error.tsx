'use client'

import { useEffect } from 'react'
import ErrorNotice from '@/components/ui/ErrorNotice'
import { ERRORS } from '@/lib/voice/voice'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorNotice
        title={ERRORS.generic.title}
        onRetry={reset}
        retryLabel={ERRORS.generic.action}
      />
    </div>
  )
}
