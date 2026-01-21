'use client'

import { useMemo } from 'react'
import { Snippet } from '@/lib/types'
import SnippetCard from './SnippetCard'
import { Star, Check } from 'lucide-react'
import { TrustBadge } from './trust/TrustBadge'
import { computeTrustStatus, formatScoreDisplay } from '@/lib/trust/trustUtils'
import { buildWhyThisWorks } from '@/lib/trust/whyThisWorks'
import { FLAGSHIP_COPY } from '@/lib/trust/trustCopy'
import { qaEvaluate } from '@/lib/qa/qaRouter'
import { inferModality } from '@/lib/prompttest/modality'

interface FeaturedWorkflowsProps {
  workflows: Snippet[]
  onSnippetClick?: (snippet: Snippet) => void
}

export default function FeaturedWorkflows({ workflows, onSnippetClick }: FeaturedWorkflowsProps) {
  // Get first featured workflow for flagship spotlight (or null if empty)
  const flagship = workflows.length > 0 ? workflows[0] : null

  // Compute QA and trust data for flagship (hooks must be called unconditionally)
  const flagshipQa = useMemo(() => {
    if (!flagship) return null
    try {
      return qaEvaluate(flagship)
    } catch (error) {
      console.error('QA evaluation failed for flagship:', error)
      return null
    }
  }, [flagship])

  const flagshipTrust = useMemo(() => {
    if (!flagshipQa) return null
    return computeTrustStatus(flagshipQa, { isPatchedView: false })
  }, [flagshipQa])

  const flagshipModality = useMemo(() => {
    if (!flagship) return 'text'
    return inferModality(flagship)
  }, [flagship])

  const flagshipWhyBullets = useMemo(() => {
    if (!flagshipQa) return []
    return buildWhyThisWorks(flagshipQa, {
      modality: flagshipModality,
      subtype: 'subtype' in flagshipQa ? (flagshipQa as any).subtype : undefined,
      emailType: 'emailType' in flagshipQa ? (flagshipQa as any).emailType : undefined,
      audioSubtype: 'audioSubtype' in flagshipQa ? (flagshipQa as any).audioSubtype : undefined
    }).slice(0, 3) // Max 3 bullets for compact display
  }, [flagshipQa, flagshipModality])

  // Early return after all hooks
  if (workflows.length === 0) {
    return null // Don't show section if no featured workflows
  }

  return (
    <div className="mb-8">
      {/* Flagship Spotlight Section */}
      {flagship && flagshipQa && flagshipTrust && (
        <div className="mb-6 bg-spotify-darkgray/60 rounded-xl p-5 border border-yellow-400/30 ring-2 ring-yellow-400/20">
          <div className="flex items-start gap-2 mb-3">
            <Star size={16} className="text-yellow-400 mt-1" fill="currentColor" />
            <div>
              <h3 className="text-sm font-bold text-yellow-400">{FLAGSHIP_COPY.heading}</h3>
              <p className="text-xs text-spotify-lightgray">{FLAGSHIP_COPY.subheading}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-2">{flagship.title}</h2>

          {/* Trust Badge + Score */}
          <div className="flex items-center gap-3 mb-3">
            <TrustBadge status={flagshipTrust} size="sm" />
            <span className="text-xs text-spotify-lightgray">
              {formatScoreDisplay(
                flagshipQa.score,
                flagshipModality,
                {
                  subtype: 'subtype' in flagshipQa ? (flagshipQa as any).subtype : undefined,
                  emailType: 'emailType' in flagshipQa ? (flagshipQa as any).emailType : undefined,
                  audioSubtype: 'audioSubtype' in flagshipQa ? (flagshipQa as any).audioSubtype : undefined
                }
              )}
            </span>
          </div>

          {/* Why this works bullets (max 3) */}
          {flagshipWhyBullets.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-white mb-2">Why this works:</p>
              <ul className="space-y-1">
                {flagshipWhyBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-spotify-lightgray">
                    <Check size={12} className="text-status-success mt-0.5 flex-shrink-0" />
                    <span>{bullet.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onSnippetClick?.(flagship)}
              className="px-4 py-2 bg-spotify-green hover:bg-spotify-green/90 text-black font-medium text-sm rounded-lg transition-colors"
            >
              {FLAGSHIP_COPY.ctaPrimary}
            </button>
          </div>
        </div>
      )}

      {/* Other Featured Workflows Grid */}
      {workflows.length > 1 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">
              More Featured Workflows
            </h2>
            <p className="text-sm text-spotify-lightgray">
              Use these every time for consistent, professional results.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {workflows.slice(1).map(workflow => (
              <div key={workflow.id} className="relative">
                {/* Featured Badge */}
                <div className="absolute -top-1 -right-1 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg">
                    <Star size={10} fill="currentColor" />
                    Featured
                  </span>
                </div>

                {/* Highlighted Card */}
                <div className="ring-2 ring-yellow-400/50 rounded-lg">
                  <SnippetCard snippet={workflow} onClick={() => onSnippetClick?.(workflow)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
