'use client'

import { Snippet } from '@/lib/types'
import { exportAsJson, exportAsMarkdown } from '@/lib/utils/exportHelpers'
import { Download, FileJson, FileText, FlaskConical } from 'lucide-react'

interface DevExportPanelProps {
  snippet: Snippet
}

export default function DevExportPanel({ snippet }: DevExportPanelProps) {
  const handleExportJson = () => {
    exportAsJson(snippet)
  }

  const handleExportMarkdown = () => {
    exportAsMarkdown(snippet)
  }

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Export Options</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-3 p-4 bg-spotify-darkgray/60 hover:bg-spotify-gray/60 rounded-lg border border-spotify-gray/30 transition-colors text-left"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileJson size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Export JSON</p>
              <p className="text-xs text-spotify-lightgray">Download as {snippet.id}.json</p>
            </div>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-3 p-4 bg-spotify-darkgray/60 hover:bg-spotify-gray/60 rounded-lg border border-spotify-gray/30 transition-colors text-left"
          >
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Export Markdown</p>
              <p className="text-xs text-spotify-lightgray">Download as {snippet.id}.md</p>
            </div>
          </button>
        </div>
      </div>

      {/* PromptTest placeholder */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Testing</h4>
        <button
          disabled
          className="flex items-center gap-3 p-4 bg-spotify-darkgray/30 rounded-lg border border-spotify-gray/20 opacity-50 cursor-not-allowed w-full text-left"
          title="Coming soon - Run automated tests against this prompt"
        >
          <div className="p-2 bg-spotify-gray/30 rounded-lg">
            <FlaskConical size={20} className="text-spotify-lightgray" />
          </div>
          <div>
            <p className="text-sm font-medium text-spotify-lightgray">Run in PromptTest</p>
            <p className="text-xs text-spotify-lightgray/60">Coming soon</p>
          </div>
        </button>
      </div>

      {/* Export info */}
      <div className="p-4 bg-spotify-darkgray/40 rounded-lg border border-spotify-gray/20">
        <h4 className="text-sm font-medium text-white mb-2">What&apos;s included in exports</h4>
        <ul className="text-xs text-spotify-lightgray space-y-1">
          <li>• Metadata: id, type, version, category, audience, scope</li>
          <li>• Content: title, description, tags, provider</li>
          <li>• Template: raw template text with placeholders</li>
          {snippet.type === 'workflow' && <li>• Schema: inputs_schema definition</li>}
          <li>• Timestamps: created_at, updated_at</li>
        </ul>
      </div>
    </div>
  )
}
