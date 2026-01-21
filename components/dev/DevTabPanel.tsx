'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import DevUsePanel from './DevUsePanel'
import DevTemplatePanel from './DevTemplatePanel'
import DevSchemaPanel from './DevSchemaPanel'
import DevContractPanel from './DevContractPanel'
import DevExportPanel from './DevExportPanel'
import DevQaPanel from './DevQaPanel'

type TabId = 'use' | 'template' | 'schema' | 'contract' | 'export' | 'qa'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'use', label: 'Use' },
  { id: 'template', label: 'Template' },
  { id: 'schema', label: 'Schema' },
  { id: 'contract', label: 'Contract' },
  { id: 'qa', label: 'QA' },
  { id: 'export', label: 'Export' },
]

interface DevTabPanelProps {
  snippet: Snippet
}

export default function DevTabPanel({ snippet }: DevTabPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('use')

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-spotify-darkgray/60 rounded-lg overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
              ${activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-spotify-lightgray hover:text-white hover:bg-spotify-gray/50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'use' && <DevUsePanel snippet={snippet} />}
        {activeTab === 'template' && <DevTemplatePanel snippet={snippet} />}
        {activeTab === 'schema' && <DevSchemaPanel snippet={snippet} />}
        {activeTab === 'contract' && <DevContractPanel snippet={snippet} />}
        {activeTab === 'export' && <DevExportPanel snippet={snippet} />}
        {activeTab === 'qa' && <DevQaPanel snippet={snippet} />}
      </div>
    </div>
  )
}
