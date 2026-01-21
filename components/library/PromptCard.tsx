'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { TrustBadge, TrustLevel } from './TrustBadge'
import { Heart, Play, Eye, Sparkles, Lock, FileCode, Image, Video, Music, FileText, GitBranch } from 'lucide-react'
import { TEST_IDS, CARD, MOTION_CLASSES } from './uiTokens'
import { useCardHeightWarning } from './devWarnings'
import { Capability } from '@/lib/sidebar/types'

export type PromptStatus = 'draft' | 'published' | 'production'
export type Modality = 'text' | 'image' | 'video' | 'audio' | 'doc' | 'workflow'
export type Provider = 'openai' | 'anthropic' | 'google' | 'other'
export type Language = 'ts' | 'py' | 'json' | 'none'

export interface PromptCardData {
  id: string
  title: string
  description: string
  primaryAction?: 'view' | 'run' | 'remix'
  modality?: Modality
  provider?: Provider
  language?: Language
  tags?: string[]
  status: PromptStatus
  trust: TrustLevel
  isFavorited?: boolean
  uses?: number
  updatedAt?: string
  isLocked?: boolean
  lockReason?: string
  featuredBadge?: 'trending' | 'recommended' | 'new' | null
  collectionName?: string
  capability?: Capability
  isAgentReady?: boolean
}

interface PromptCardProps {
  data: PromptCardData
  onClick?: () => void
  onFavoriteToggle?: (id: string) => void
  className?: string
  forceHover?: boolean // Testing only: forces hover state for Storybook/screenshots
}

const modalityIcons: Record<Modality, typeof FileCode> = {
  text: FileCode,
  image: Image,
  video: Video,
  audio: Music,
  doc: FileText,
  workflow: GitBranch,
}

const providerLabels: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  other: 'Other',
}

const languageLabels: Record<Language, string> = {
  ts: 'TypeScript',
  py: 'Python',
  json: 'JSON',
  none: '',
}

const featuredBadgeConfig: Record<string, { label: string; className: string }> = {
  trending: { label: 'Trending', className: 'bg-orange-900/30 text-orange-400' },
  recommended: { label: 'Recommended', className: 'bg-purple-900/30 text-purple-400' },
  new: { label: 'New', className: 'bg-blue-900/30 text-blue-400' },
}

const actionConfig: Record<string, { label: string; icon: typeof Play }> = {
  view: { label: 'View', icon: Eye },
  run: { label: 'Run', icon: Play },
  remix: { label: 'Remix', icon: Sparkles },
}

export function PromptCard({ data, onClick, onFavoriteToggle, className, forceHover = false }: PromptCardProps) {
  const [isHovered, setIsHovered] = useState(forceHover)
  const cardRef = useRef<HTMLDivElement>(null)

  // Dev warning for card height
  useCardHeightWarning(cardRef)

  // Slice tags to max allowed (2) for hover display
  const displayTags = data.tags?.slice(0, CARD.MAX_TAGS_ON_HOVER)

  const action = data.primaryAction || 'view'
  const ActionIcon = actionConfig[action].icon
  const ModalityIcon = data.modality ? modalityIcons[data.modality] : FileCode

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(data.id)
  }

  return (
    <div
      ref={cardRef}
      data-testid={TEST_IDS.PROMPT_CARD}
      className={cn(
        // STRICT SPEC: Fixed height 156px
        'h-[156px] min-h-[156px] max-h-[156px]',
        // STRICT SPEC: Padding 16px, radius 16px
        'p-[16px] rounded-[16px]',
        // STRICT SPEC: Border 1px rgba(255,255,255,0.08)
        'border border-white/[0.08]',
        // Base styles
        'group relative bg-surface-hover cursor-pointer',
        // STRICT SPEC: Hover - translateY(-2px), 150ms ease-out
        'transition-all duration-150 ease-out',
        'hover:translate-y-[-2px]',
        // STRICT SPEC: Hover shadow
        'hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
        // STRICT SPEC: Hover border opacity 0.14
        'hover:border-foreground/[0.14] hover:bg-surface-hover/80',
        // Locked state
        data.isLocked && 'opacity-75',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Lock overlay - STRICT SPEC: opacity 48% */}
      {data.isLocked && (
        <div className="absolute inset-0 bg-black/[0.48] rounded-[16px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            {/* STRICT SPEC: Lock icon 16px */}
            <Lock size={16} />
            <span className="text-xs">{data.lockReason || 'Locked'}</span>
            {/* STRICT SPEC: Upgrade button h-28px text-12px radius-8px */}
            <button className="h-[28px] px-3 text-[12px] font-medium bg-accent text-white rounded-[8px] hover:bg-accent-hover transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Featured badge */}
      {data.featuredBadge && (
        <div className="absolute -top-2 -right-2 z-20">
          <span className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full',
            featuredBadgeConfig[data.featuredBadge].className
          )}>
            {featuredBadgeConfig[data.featuredBadge].label}
          </span>
        </div>
      )}

      {/* Content - flex column to fill fixed height */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          {/* STRICT SPEC: Title 16px weight 600, line-clamp-1 */}
          <h3 className="text-[16px] font-semibold text-foreground leading-tight line-clamp-1 flex-1">
            {data.title}
          </h3>
          {/* Favorite - hidden on mobile per spec */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'p-1 rounded-lg transition-colors flex-shrink-0 hidden sm:block',
              data.isFavorited
                ? 'text-red-400 bg-red-900/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            )}
          >
            <Heart size={14} fill={data.isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* STRICT SPEC: Description 13px, opacity 72%, line-clamp-2 */}
        <p className="text-[13px] text-foreground/[0.72] leading-relaxed line-clamp-2 mb-auto">
          {data.description}
        </p>

        {/* STRICT SPEC: Hover metadata row - h-22px, desktop only */}
        <div className={cn(
          'hidden sm:flex items-center gap-2 overflow-hidden transition-all duration-150',
          // STRICT SPEC: Height 22px when visible
          (isHovered || forceHover) ? 'h-[22px] opacity-100 mt-2' : 'h-0 opacity-0'
        )}>
          {/* Provider */}
          {data.provider && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded text-[11px] text-zinc-400">
              <ModalityIcon size={10} />
              {providerLabels[data.provider]}
            </span>
          )}

          {/* Language */}
          {data.language && data.language !== 'none' && (
            <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[11px] text-zinc-500 font-mono">
              {languageLabels[data.language]}
            </span>
          )}

          {/* STRICT SPEC: Max 2 tags, truncate, no wrap */}
          {displayTags?.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[11px] text-zinc-500 truncate max-w-[80px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* STRICT SPEC: Footer h-36px */}
        <div className="h-[36px] flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <TrustBadge level={data.trust} size="sm" />

          {/* Primary action - full-width on mobile per spec */}
          <button
            className={cn(
              'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              action === 'run'
                ? 'bg-action text-white hover:bg-action-hover active:bg-action-active'
                : 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
              // Buttons can scale per spec
              'hover:scale-[1.02] active:scale-[0.98]',
              // Full width on mobile
              'sm:w-auto w-full'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            <ActionIcon size={12} />
            {actionConfig[action].label}
          </button>
        </div>
      </div>
    </div>
  )
}
