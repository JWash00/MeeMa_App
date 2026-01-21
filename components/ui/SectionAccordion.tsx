'use client'

import { useState, useId } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SectionAccordionProps {
  title: string
  rightSummary?: React.ReactNode
  defaultOpen?: boolean
  tone?: 'neutral' | 'success' | 'warning' | 'error'
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const toneConfig = {
  neutral: {
    bgClass: 'bg-spotify-gray/30 dark:bg-spotify-gray/30',
    textClass: 'text-spotify-lightgray dark:text-spotify-lightgray',
    borderClass: 'border-spotify-gray/20 dark:border-spotify-gray/20'
  },
  success: {
    bgClass: 'bg-status-success/10',
    textClass: 'text-status-success',
    borderClass: 'border-status-success/30'
  },
  warning: {
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/20'
  },
  error: {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/20'
  }
}

export default function SectionAccordion({
  title,
  rightSummary,
  defaultOpen = false,
  tone = 'neutral',
  icon,
  children,
  className = ''
}: SectionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen)
  const contentId = useId()

  const config = toneConfig[tone]

  return (
    <div className={`rounded-lg border ${config.borderClass} ${config.bgClass} mt-6 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-spotify-green rounded-t-lg"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        role="button"
      >
        <div className="flex items-center gap-3">
          {icon && <span className={config.textClass}>{icon}</span>}
          <span className="font-medium text-white dark:text-white">{title}</span>
          {rightSummary && (
            <span className={`text-sm ${config.textClass}`}>{rightSummary}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-spotify-lightgray dark:text-spotify-lightgray" />
        ) : (
          <ChevronDown size={20} className="text-spotify-lightgray dark:text-spotify-lightgray" />
        )}
      </button>

      {isExpanded && (
        <div id={contentId} className="px-4 pb-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  )
}
