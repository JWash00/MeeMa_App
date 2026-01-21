'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { evaluateCompliance, getComplianceStatus, SpecIssue } from '@/lib/spec/specCompliance'

interface SpecCompliancePanelProps {
  snippet: Snippet
}

export default function SpecCompliancePanel({ snippet }: SpecCompliancePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only render for official scope
  if (snippet.scope !== 'official') {
    return null
  }

  const issues = evaluateCompliance(snippet)
  const status = getComplianceStatus(issues)

  const errors = issues.filter(i => i.level === 'error')
  const warnings = issues.filter(i => i.level === 'warning')

  const statusConfig = {
    pass: {
      icon: CheckCircle,
      label: 'All checks passed',
      bgClass: 'bg-status-success/10',
      textClass: 'text-status-success',
      borderClass: 'border-status-success/30'
    },
    warning: {
      icon: AlertTriangle,
      label: `${warnings.length} suggestion${warnings.length !== 1 ? 's' : ''}`,
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-400',
      borderClass: 'border-yellow-500/20'
    },
    error: {
      icon: AlertCircle,
      label: `${errors.length} issue${errors.length !== 1 ? 's' : ''} found`,
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-400',
      borderClass: 'border-red-500/20'
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className={`rounded-lg border ${config.borderClass} ${config.bgClass} mt-6`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <StatusIcon size={20} className={config.textClass} />
          <span className="font-medium text-white">Quality & Format Checks</span>
          <span className={`text-sm ${config.textClass}`}>{config.label}</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-spotify-lightgray" />
        ) : (
          <ChevronDown size={20} className="text-spotify-lightgray" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          {status === 'pass' ? (
            <p className="text-status-success text-sm pt-4">
              This content meets all Internal Spec v0.1 requirements.
            </p>
          ) : (
            <ul className="space-y-2 pt-4">
              {errors.map((issue, idx) => (
                <IssueItem key={`error-${idx}`} issue={issue} />
              ))}
              {warnings.map((issue, idx) => (
                <IssueItem key={`warning-${idx}`} issue={issue} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function IssueItem({ issue }: { issue: SpecIssue }) {
  const isError = issue.level === 'error'
  return (
    <li className="flex items-start gap-2 text-sm">
      {isError ? (
        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
      )}
      <span className={isError ? 'text-red-300' : 'text-yellow-300'}>
        {issue.message}
      </span>
    </li>
  )
}
