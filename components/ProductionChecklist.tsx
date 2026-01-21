'use client'

import { ProductionChecklistItem } from '@/lib/types'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import SectionAccordion from '@/components/ui/SectionAccordion'

interface ProductionChecklistProps {
  items: ProductionChecklistItem[]
}

export default function ProductionChecklist({ items }: ProductionChecklistProps) {
  const checkedCount = items.filter(item => item.checked).length
  const totalCount = items.length
  const allPassed = checkedCount === totalCount

  return (
    <SectionAccordion
      title="Production Readiness"
      rightSummary={allPassed ? 'Ready' : `${checkedCount}/${totalCount}`}
      tone={allPassed ? 'success' : 'warning'}
      icon={allPassed ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      defaultOpen={false}
    >
      <div className="space-y-3 pt-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              item.checked
                ? 'bg-status-success/10 border-status-success/30'
                : 'bg-spotify-gray/20 border-spotify-gray/40'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.checked ? (
                <CheckCircle size={20} className="text-status-success" />
              ) : (
                <XCircle size={20} className="text-spotify-lightgray/50" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  item.checked ? 'text-white' : 'text-spotify-lightgray/70'
                }`}
              >
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-spotify-lightgray/50 mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {allPassed && (
          <div className="mt-4 p-3 bg-status-success/10 border border-status-success/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-status-success" />
              <p className="text-sm font-medium text-status-success">
                This snippet meets all production readiness criteria
              </p>
            </div>
          </div>
        )}
      </div>
    </SectionAccordion>
  )
}
