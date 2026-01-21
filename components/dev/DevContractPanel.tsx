'use client'

import { Snippet } from '@/lib/types'
import { getRawTemplateText } from '@/lib/utils/snippetHelpers'
import { getContractIndicators } from '@/lib/spec/blockExtractor'
import { validatePlaceholders } from '@/lib/utils/placeholderValidation'
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react'
import SectionAccordion from '@/components/ui/SectionAccordion'

interface DevContractPanelProps {
  snippet: Snippet
}

export default function DevContractPanel({ snippet }: DevContractPanelProps) {
  const template = getRawTemplateText(snippet)
  const indicators = getContractIndicators(template)
  const isWorkflow = snippet.type === 'workflow'

  // Only validate placeholders for workflows
  const placeholderValidation = isWorkflow ? validatePlaceholders(snippet) : null

  const presentCount = [
    indicators.hasOutputFormat,
    indicators.hasQualityCheck,
    indicators.hasUncertaintyPolicy
  ].filter(Boolean).length
  const totalIndicators = 3

  return (
    <div className="space-y-6">
      {/* Contract Indicators */}
      <SectionAccordion
        title="Contract Indicators"
        rightSummary={`${presentCount} of ${totalIndicators} indicators`}
        tone={presentCount === totalIndicators ? 'success' : 'warning'}
        icon={presentCount === totalIndicators ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        defaultOpen={false}
      >
        <div className="space-y-2 pt-4">
          <IndicatorRow
            label="OUTPUT FORMAT"
            present={indicators.hasOutputFormat}
            description="Defines the expected output structure"
          />
          <IndicatorRow
            label="QC / Quality Check"
            present={indicators.hasQualityCheck}
            description="Self-verification checklist"
          />
          <IndicatorRow
            label="UNCERTAINTY POLICY"
            present={indicators.hasUncertaintyPolicy}
            description="How to handle ambiguous situations"
          />
        </div>
      </SectionAccordion>

      {/* Placeholder Validation (workflows only) */}
      {isWorkflow && placeholderValidation && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Placeholder Validation</h4>
          {placeholderValidation.isValid ? (
            <div className="flex items-center gap-2 text-status-success text-sm">
              <CheckCircle size={16} />
              <span>All schema keys match template placeholders</span>
            </div>
          ) : (
            <div className="space-y-2">
              {placeholderValidation.missingSchemaKeys.length > 0 && (
                <div className="flex items-start gap-2 text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Placeholders not in schema:</p>
                    <p className="text-yellow-300/80 font-mono text-xs mt-1">
                      {placeholderValidation.missingSchemaKeys.map(k => `{{${k}}}`).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {placeholderValidation.unusedSchemaKeys.length > 0 && (
                <div className="flex items-start gap-2 text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Schema keys not used in template:</p>
                    <p className="text-yellow-300/80 font-mono text-xs mt-1">
                      {placeholderValidation.unusedSchemaKeys.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OUTPUT FORMAT Content */}
      {indicators.outputFormatContent && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <FileText size={14} />
            OUTPUT FORMAT Block
          </h4>
          <div className="bg-spotify-black/80 rounded-lg border border-spotify-gray/30 p-4">
            <pre className="text-sm text-spotify-lightgray font-mono whitespace-pre-wrap max-h-[40vh] overflow-auto">
              {indicators.outputFormatContent}
            </pre>
          </div>
        </div>
      )}

      {/* Warning if no OUTPUT FORMAT */}
      {!indicators.hasOutputFormat && (
        <div className="flex items-start gap-2 text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">No explicit OUTPUT FORMAT found</p>
            <p className="text-yellow-300/80 text-xs mt-1">
              Adding an OUTPUT FORMAT block improves consistency and makes the contract explicit.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function IndicatorRow({
  label,
  present,
  description
}: {
  label: string
  present: boolean
  description: string
}) {
  return (
    <div className="flex items-center gap-3 p-2 bg-spotify-darkgray/40 rounded-lg">
      {present ? (
        <CheckCircle size={18} className="text-status-success shrink-0" />
      ) : (
        <XCircle size={18} className="text-spotify-lightgray/50 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${present ? 'text-white' : 'text-spotify-lightgray/70'}`}>
          {label}
        </p>
        <p className="text-xs text-spotify-lightgray/50 truncate">{description}</p>
      </div>
    </div>
  )
}
