'use client'

import { ProductionChecklistItem } from '@/lib/types'

interface ProductionChecklistProps {
  items: ProductionChecklistItem[]
}

export default function ProductionChecklist({ items }: ProductionChecklistProps) {
  const checkedCount = items.filter(item => item.checked).length
  const totalCount = items.length

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Production Readiness
        </h2>
        <p className="text-gray-600 text-sm">
          {checkedCount} of {totalCount} production best practices implemented
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.checked ? (
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  item.checked ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.label}
              </p>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {checkedCount === totalCount && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              This snippet meets all production readiness criteria
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
