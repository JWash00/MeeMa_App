'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { RenderTarget } from '@/lib/prompt-spec/types'
import type { VisualPromptPack } from '@/lib/prompt-spec/visual/promptPackSchema'
import type { QaIssue } from '@/lib/prompt-spec/outputQaTypes'
import { runVisualPackChecks } from '@/lib/prompt-spec/visual/visualQa'

interface VisualPromptRunnerProps {
  generatedOutput: string | null
  renderTargets?: RenderTarget[]
  repaired?: boolean
}

const PROVIDER_LABELS: Record<string, string> = {
  midjourney_v6: 'Midjourney v6',
  sdxl: 'SDXL',
  dalle3: 'DALL-E 3',
  ideogram: 'Ideogram'
}

export default function VisualPromptRunner({
  generatedOutput,
  renderTargets,
  repaired = false
}: VisualPromptRunnerProps) {
  const [activeTab, setActiveTab] = useState<RenderTarget>('midjourney_v6')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [jsonExpanded, setJsonExpanded] = useState(false)

  // Parse and validate output
  const { pack, qaIssues, parseError } = useMemo(() => {
    if (!generatedOutput) {
      return { pack: null, qaIssues: [], parseError: null }
    }

    try {
      const parsed = JSON.parse(generatedOutput) as VisualPromptPack
      const issues = runVisualPackChecks(parsed, renderTargets)
      return { pack: parsed, qaIssues: issues, parseError: null }
    } catch (e) {
      return {
        pack: null,
        qaIssues: [{
          id: 'mps.json.valid',
          severity: 'error' as const,
          message: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`
        }],
        parseError: e instanceof Error ? e.message : 'Parse error'
      }
    }
  }, [generatedOutput, renderTargets])

  // Available provider tabs
  const availableProviders = useMemo(() => {
    if (!pack) return []
    return Object.keys(pack.providers) as RenderTarget[]
  }, [pack])

  // Copy handler
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // QA status summary
  const errorCount = qaIssues.filter(i => i.severity === 'error').length
  const warnCount = qaIssues.filter(i => i.severity === 'warn').length

  // Empty state
  if (!generatedOutput) {
    return (
      <div className="bg-spotify-darkgray rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-spotify-lightgray mb-2" size={32} />
        <p className="text-spotify-lightgray text-sm">
          Generate a prompt pack to see provider outputs
        </p>
      </div>
    )
  }

  // Parse error state
  if (!pack) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-500" size={18} />
            <span className="text-red-400 font-medium">Failed to parse output</span>
          </div>
          <p className="text-sm text-red-400/80">{parseError}</p>
        </div>
        <div className="bg-spotify-darkgray rounded-lg p-4">
          <span className="text-sm font-medium text-spotify-lightgray block mb-2">Raw Output</span>
          <pre className="text-xs text-spotify-lightgray bg-spotify-black p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
            {generatedOutput}
          </pre>
        </div>
      </div>
    )
  }

  const currentProvider = pack.providers[activeTab]

  return (
    <div className="space-y-4">
      {/* Repaired indicator */}
      {repaired && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="text-yellow-500" size={16} />
          <span className="text-sm text-yellow-400">Output was repaired automatically</span>
        </div>
      )}

      {/* Provider Tabs */}
      {availableProviders.length > 0 && (
        <div className="flex gap-2 border-b border-spotify-gray pb-2">
          {availableProviders.map(provider => (
            <button
              key={provider}
              onClick={() => setActiveTab(provider)}
              className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                activeTab === provider
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-spotify-lightgray hover:bg-spotify-gray/80'
              }`}
            >
              {PROVIDER_LABELS[provider] || provider}
            </button>
          ))}
        </div>
      )}

      {/* Provider Output Panel */}
      {currentProvider && (
        <div className="bg-spotify-darkgray rounded-lg overflow-hidden">
          {/* Positive Prompt */}
          <div className="p-4 border-b border-spotify-gray">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Positive Prompt</span>
              <button
                onClick={() => handleCopy(currentProvider.positive, `${activeTab}-positive`)}
                className="flex items-center gap-1 px-2 py-1 bg-spotify-gray hover:bg-spotify-gray/80 rounded text-xs text-spotify-lightgray transition-colors"
              >
                {copiedField === `${activeTab}-positive` ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                {copiedField === `${activeTab}-positive` ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-sm text-spotify-lightgray whitespace-pre-wrap bg-spotify-black p-3 rounded max-h-40 overflow-y-auto">
              {currentProvider.positive}
            </pre>
          </div>

          {/* Negative Prompt (if present) */}
          {currentProvider.negative && (
            <div className="p-4 border-b border-spotify-gray">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Negative Prompt</span>
                <button
                  onClick={() => handleCopy(currentProvider.negative!, `${activeTab}-negative`)}
                  className="flex items-center gap-1 px-2 py-1 bg-spotify-gray hover:bg-spotify-gray/80 rounded text-xs text-spotify-lightgray transition-colors"
                >
                  {copiedField === `${activeTab}-negative` ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                  {copiedField === `${activeTab}-negative` ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm text-red-400/80 whitespace-pre-wrap bg-spotify-black p-3 rounded max-h-32 overflow-y-auto">
                {currentProvider.negative}
              </pre>
            </div>
          )}

          {/* Parameters */}
          <div className="p-4 border-b border-spotify-gray">
            <span className="text-sm font-medium text-white block mb-2">Parameters</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(currentProvider.params).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-spotify-gray rounded text-xs text-spotify-lightgray">
                  <span className="text-spotify-lightgray/60">{key}:</span> {String(value)}
                </span>
              ))}
            </div>
          </div>

          {/* Instructions (if present) */}
          {currentProvider.instructions && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Instructions</span>
                <button
                  onClick={() => handleCopy(currentProvider.instructions!, `${activeTab}-instructions`)}
                  className="flex items-center gap-1 px-2 py-1 bg-spotify-green hover:bg-spotify-greenhover text-black rounded text-xs font-medium transition-colors"
                >
                  {copiedField === `${activeTab}-instructions` ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === `${activeTab}-instructions` ? 'Copied!' : 'Copy Full Command'}
                </button>
              </div>
              <pre className="text-sm text-spotify-lightgray whitespace-pre-wrap bg-spotify-black p-3 rounded max-h-32 overflow-y-auto font-mono">
                {currentProvider.instructions}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Notes (if present) */}
      {pack.notes && pack.notes.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <span className="text-xs font-medium text-blue-400 block mb-1">Tips</span>
          <ul className="text-xs text-blue-300/80 space-y-1">
            {pack.notes.map((note, idx) => (
              <li key={idx}>• {note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* QA Panel */}
      <div className="bg-spotify-darkgray rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Quality Checks</span>
          <div className="flex items-center gap-2">
            {errorCount === 0 && warnCount === 0 ? (
              <span className="flex items-center gap-1 text-status-success text-xs">
                <Check size={14} /> All Passed
              </span>
            ) : (
              <>
                {errorCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                    {errorCount} error{errorCount > 1 ? 's' : ''}
                  </span>
                )}
                {warnCount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    {warnCount} warning{warnCount > 1 ? 's' : ''}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {qaIssues.length > 0 && (
          <div className="space-y-2">
            {qaIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs ${
                  issue.severity === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}
              >
                <span className="font-mono opacity-60">[{issue.id}]</span> {issue.message}
                {issue.path && <span className="block opacity-60 mt-0.5">at {issue.path}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw JSON Viewer (collapsible) */}
      <div className="bg-spotify-darkgray rounded-lg overflow-hidden">
        <button
          onClick={() => setJsonExpanded(!jsonExpanded)}
          className="w-full p-4 flex items-center justify-between text-sm font-medium text-spotify-lightgray hover:bg-spotify-gray/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            {jsonExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            View Raw JSON
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy(JSON.stringify(pack, null, 2), 'full-json')
            }}
            className="flex items-center gap-1 px-2 py-1 bg-spotify-gray hover:bg-spotify-gray/80 rounded text-xs transition-colors"
          >
            {copiedField === 'full-json' ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
            Copy JSON
          </button>
        </button>
        {jsonExpanded && (
          <div className="p-4 pt-0">
            <pre className="text-xs text-spotify-lightgray bg-spotify-black p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(pack, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
