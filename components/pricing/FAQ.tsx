'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqData = [
  {
    question: "Do I still need observability tools?",
    answer: "Yes. Prompt Toolkit gives you production-ready integration patterns. Observability tools help you monitor and debug in production."
  },
  {
    question: "Do I own the generated code?",
    answer: "Yes. All code generated or provided by Prompt Toolkit is yours. No vendor lock-in, no usage restrictions."
  },
  {
    question: "Is this vendor-locked to specific LLM providers?",
    answer: "No. Snippets work across OpenAI, Anthropic, Google, and other providers. You choose your provider."
  },
  {
    question: "Can I keep private snippets?",
    answer: "Yes with Pro tier. Create private collections for internal patterns specific to your product."
  }
]

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {faqData.map((item, index) => (
        <div key={index} className="bg-spotify-darkgray rounded-lg overflow-hidden">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left px-6 py-4 hover:bg-spotify-gray transition-colors flex items-center justify-between"
            aria-expanded={expandedIndex === index}
          >
            <span className="text-base font-semibold text-white pr-4">{item.question}</span>
            <ChevronDown
              size={20}
              className={`text-spotify-lightgray flex-shrink-0 transition-transform ${
                expandedIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedIndex === index && (
            <div className="px-6 pb-4">
              <p className="text-sm text-spotify-lightgray leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
