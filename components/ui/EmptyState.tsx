'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="flex justify-center mb-4 text-muted">
          {icon}
        </div>
      )}
      <p className="text-lg text-foreground mb-2">{title}</p>
      {subtitle && (
        <p className="text-sm text-muted">{subtitle}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
