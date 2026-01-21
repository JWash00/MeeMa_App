'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/types'
import { Copy, Check, ChevronDown } from 'lucide-react'

interface WorkflowPromptRendererProps {
  snippet: Snippet
}

export default function WorkflowPromptRenderer({ snippet }: WorkflowPromptRendererProps) {
  // Initialize input values from inputs_schema defaults
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    if (snippet.inputs_schema) {
      Object.entries(snippet.inputs_schema).forEach(([key, field]) => {
        defaults[key] = field.default || ''
      })
    }
    return defaults
  })

  const [copied, setCopied] = useState(false)

  // Generate prompt by replacing template placeholders with user input values
  const generatePrompt = () => {
    let result = snippet.template || snippet.code
    Object.entries(inputValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      result = result.replaceAll(placeholder, value)
    })
    return result
  }

  const generatedPrompt = generatePrompt()

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // Track copy event
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snippetId: snippet.id,
          eventType: 'copy',
        }),
      }).catch(() => {
        // Silently fail - analytics shouldn't break UX
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-spotify-gray text-white rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green placeholder:text-spotify-lightgray/60"

  // Graceful fallback if inputs_schema is missing
  if (!snippet.inputs_schema) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-6">
        <p className="text-yellow-500">
          This workflow is missing input configuration.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Workflow Inputs Form */}
      <div className="bg-spotify-darkgray rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Customize Your Prompt</h3>
        <p className="text-sm text-spotify-lightgray mb-4">Fill in the fields below to generate your personalized prompt</p>
        <div className="space-y-4">
          {Object.entries(snippet.inputs_schema).map(([key, field]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-spotify-lightgray mb-1">
                {field.label}
              </label>

              {field.type === 'text' && (
                <input
                  id={key}
                  type="text"
                  value={inputValues[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  id={key}
                  value={inputValues[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              )}

              {field.type === 'select' && field.options && (
                <div className="relative">
                  <select
                    id={key}
                    value={inputValues[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-lightgray pointer-events-none" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generated Prompt Preview */}
      <div className="bg-spotify-darkgray rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-spotify-gray">
          <h3 className="text-lg font-semibold text-white">Generated Prompt</h3>
          <button
            onClick={handleCopy}
            disabled={!generatedPrompt.trim()}
            className="px-4 py-2 bg-spotify-green text-black rounded-full font-semibold hover:bg-spotify-greenhover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          <pre className="bg-spotify-black p-4 rounded-lg text-spotify-lightgray whitespace-pre-wrap font-sans text-sm leading-relaxed min-h-[100px]">
            {generatedPrompt || 'Fill in the form above to see your personalized prompt...'}
          </pre>
        </div>
      </div>

      {/* Template Structure */}
      <details className="bg-spotify-darkgray rounded-lg group">
        <summary className="px-6 py-4 cursor-pointer font-medium text-spotify-lightgray hover:text-white rounded-lg flex items-center gap-2">
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          View Prompt Template
        </summary>
        <div className="px-6 pb-4">
          <pre className="bg-spotify-black p-4 rounded text-sm text-spotify-lightgray font-mono overflow-x-auto">
            {snippet.template || snippet.code}
          </pre>
        </div>
      </details>
    </div>
  )
}
