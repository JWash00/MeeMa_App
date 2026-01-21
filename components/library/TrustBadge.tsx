'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Shield, ShieldCheck, Award } from 'lucide-react'
import { TEST_IDS, TRUST_BADGE } from './uiTokens'

export type TrustLevel = 'basic' | 'verified' | 'gold'

interface TrustBadgeProps {
  level: TrustLevel
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

const trustConfig: Record<TrustLevel, {
  label: string
  icon: typeof Shield
  colors: string
  tooltip: string
}> = {
  basic: {
    label: 'Basic',
    icon: Shield,
    colors: 'bg-gray-200 dark:bg-zinc-700/50 text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-600/50',
    tooltip: 'Draft or unverified prompt.',
  },
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    colors: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700/50',
    tooltip: 'Passed QA checks for structure & completeness.',
  },
  gold: {
    label: 'Gold',
    icon: Award,
    colors: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/50',
    tooltip: 'Production-ready: QA + examples + versioned.',
  },
}

export function TrustBadge({ level, size = 'sm', showLabel = true, className }: TrustBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const config = trustConfig[level]
  const Icon = config.icon

  // STRICT SPEC: Tooltip delay 250ms
  const handleMouseEnter = () => {
    setShowTooltip(true)
    timeoutRef.current = setTimeout(() => {
      setTooltipVisible(true)
    }, TRUST_BADGE.TOOLTIP_DELAY_MS)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setTooltipVisible(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <div className="relative inline-flex" data-testid={TEST_IDS.TRUST_BADGE}>
      <span
        className={cn(
          // STRICT SPEC: height 20px, padding 8px, rounded-full, text-12px, font-medium
          'h-[20px] inline-flex items-center px-[8px] rounded-full text-[12px] font-medium',
          'border transition-colors cursor-default gap-1',
          config.colors,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon size={iconSize} />
        {showLabel && <span>{config.label}</span>}
      </span>

      {/* STRICT SPEC: Tooltip w-240px, text-12px, max 3 lines, delay 250ms */}
      {showTooltip && tooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="w-[240px] bg-zinc-900 text-zinc-200 text-[12px] px-3 py-2 rounded-lg shadow-lg border border-zinc-700 line-clamp-3">
            {config.tooltip}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}
