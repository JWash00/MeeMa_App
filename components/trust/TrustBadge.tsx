'use client'

// TrustBadge Component v0.1
// Reusable trust status badge with tooltip

import { TRUST_STATUS_LABELS, TRUST_STATUS_MICROCOPY, type TrustStatus } from '@/lib/trust/trustCopy'

interface TrustBadgeProps {
  status: TrustStatus
  size?: 'sm' | 'md'
  score?: number
  showScore?: boolean
  className?: string
}

export function TrustBadge({
  status,
  size = 'md',
  score,
  showScore = false,
  className = ''
}: TrustBadgeProps) {
  // Color coding based on status
  const statusColors: Record<TrustStatus, string> = {
    verified: 'bg-status-success/10 border-status-success/30 text-status-success',
    patched: 'bg-status-warning/10 border-status-warning/30 text-status-warning',
    draft: 'bg-gray-500/20 border-gray-500/30 text-gray-400'
  }

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1'
  }

  const statusColor = statusColors[status]
  const sizeClass = sizeClasses[size]
  const label = TRUST_STATUS_LABELS[status]
  const microcopy = TRUST_STATUS_MICROCOPY[status]

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Trust Badge */}
      <span
        className={`
          inline-block rounded-full border font-medium
          ${statusColor} ${sizeClass}
        `}
        title={microcopy}
      >
        {label}
      </span>

      {/* Optional Score Display */}
      {showScore && score !== undefined && (
        <span className="text-xs text-spotify-lightgray">
          Score: {score}
        </span>
      )}
    </div>
  )
}
