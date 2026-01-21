'use client'

import { AlertCircle } from 'lucide-react'
import Button from './Button'

interface ErrorNoticeProps {
  title: string
  subtitle?: string
  onRetry?: () => void
  retryLabel?: string
}

export default function ErrorNotice({
  title,
  subtitle,
  onRetry,
  retryLabel = 'Try again'
}: ErrorNoticeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted mb-6 text-center max-w-md">
          {subtitle}
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
